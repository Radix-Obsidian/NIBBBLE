import { supabase } from '@/lib/supabase/client'
import { tiktokAPI, TikTokVideo } from './tiktok-api'
import { instagramAPI, InstagramPost } from './instagram-api'
import { logger } from '@/lib/logger'

export interface SocialConnection {
  id: string
  user_id: string
  platform: 'tiktok' | 'instagram'
  platform_user_id: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  is_active: boolean
  last_sync_at: string | null
  created_at: string
  updated_at: string
}

export interface ImportedContent {
  id: string
  user_id: string
  platform: 'tiktok' | 'instagram'
  platform_content_id: string
  content_type: 'video' | 'image' | 'carousel'
  content_url: string | null
  thumbnail_url: string | null
  caption: string | null
  engagement_metrics: {
    likes: number
    comments: number
    shares?: number
    views?: number
  } | null
  is_approved: boolean
  imported_at: string
}

export class ContentSyncService {
  /**
   * Connect TikTok account
   */
  async connectTikTok(userId: string, accessToken: string, refreshToken: string, platformUserId: string): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // TikTok tokens typically expire in 24 hours

      const { error } = await supabase
        .from('social_media_connections')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_user_id: platformUserId,
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString()
        })

      if (error) {
        logger.error('Error connecting TikTok account', error)
        throw new Error('Failed to connect TikTok account')
      }

      // Update profile to indicate social media connection
      await supabase
        .from('profiles')
        .update({ 
          social_media_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      logger.info('TikTok account connected successfully', { userId, platformUserId })
    } catch (error) {
      logger.error('Error in connectTikTok', error)
      throw error
    }
  }

  /**
   * Connect Instagram account
   */
  async connectInstagram(userId: string, accessToken: string, platformUserId: string): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 60) // Instagram tokens typically expire in 60 days

      const { error } = await supabase
        .from('social_media_connections')
        .upsert({
          user_id: userId,
          platform: 'instagram',
          platform_user_id: platformUserId,
          access_token: accessToken,
          refresh_token: null, // Instagram Basic Display API doesn't support refresh tokens
          token_expires_at: expiresAt.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString()
        })

      if (error) {
        logger.error('Error connecting Instagram account', error)
        throw new Error('Failed to connect Instagram account')
      }

      // Update profile to indicate social media connection
      await supabase
        .from('profiles')
        .update({ 
          social_media_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      logger.info('Instagram account connected successfully', { userId, platformUserId })
    } catch (error) {
      logger.error('Error in connectInstagram', error)
      throw error
    }
  }

  /**
   * Import TikTok content
   */
  async importTikTokContent(userId: string, maxCount: number = 10): Promise<ImportedContent[]> {
    try {
      // Get TikTok connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .eq('is_active', true)
        .single()

      if (connectionError || !connection) {
        throw new Error('No active TikTok connection found')
      }

      // Check if token is expired
      if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
        // Try to refresh token
        try {
          const refreshResult = await tiktokAPI.refreshToken(connection.refresh_token!)
          await this.connectTikTok(userId, refreshResult.access_token, refreshResult.refresh_token, connection.platform_user_id!)
        } catch (refreshError) {
          // Mark connection as inactive if refresh fails
          await supabase
            .from('social_media_connections')
            .update({ is_active: false })
            .eq('id', connection.id)
          throw new Error('TikTok token expired and refresh failed')
        }
      }

      // Fetch videos from TikTok
      const videos = await tiktokAPI.getUserVideos(connection.access_token!, maxCount)
      
      // Import videos to database
      const importedContent: ImportedContent[] = []
      
      for (const video of videos) {
        // Check if content already exists
        const { data: existing } = await supabase
          .from('imported_content')
          .select('id')
          .eq('platform_content_id', video.id)
          .eq('user_id', userId)
          .single()

        if (existing) {
          continue // Skip if already imported
        }

        // Insert new content
        const { data: inserted, error: insertError } = await supabase
          .from('imported_content')
          .insert({
            user_id: userId,
            platform: 'tiktok',
            platform_content_id: video.id,
            content_type: 'video',
            content_url: video.video_url,
            thumbnail_url: video.thumbnail_url,
            caption: video.caption,
            engagement_metrics: {
              likes: video.likes_count,
              comments: video.comments_count,
              shares: video.shares_count,
              views: video.views_count
            },
            is_approved: false // Require manual approval
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Error inserting TikTok content', insertError)
          continue
        }

        importedContent.push(inserted)
      }

      // Update last sync time
      await supabase
        .from('social_media_connections')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.id)

      logger.info('TikTok content import completed', { 
        userId, 
        importedCount: importedContent.length,
        totalVideos: videos.length 
      })

      return importedContent
    } catch (error) {
      logger.error('Error in importTikTokContent', error)
      throw error
    }
  }

  /**
   * Import Instagram content
   */
  async importInstagramContent(userId: string, maxCount: number = 10): Promise<ImportedContent[]> {
    try {
      // Get Instagram connection
      const { data: connection, error: connectionError } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single()

      if (connectionError || !connection) {
        throw new Error('No active Instagram connection found')
      }

      // Check if token is expired
      if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
        // Mark connection as inactive if expired
        await supabase
          .from('social_media_connections')
          .update({ is_active: false })
          .eq('id', connection.id)
        throw new Error('Instagram token expired. Please reconnect your account.')
      }

      // Fetch posts from Instagram
      const posts = await instagramAPI.getUserMedia(connection.access_token!, maxCount)
      
      // Import posts to database
      const importedContent: ImportedContent[] = []
      
      for (const post of posts) {
        // Check if content already exists
        const { data: existing } = await supabase
          .from('imported_content')
          .select('id')
          .eq('platform_content_id', post.id)
          .eq('user_id', userId)
          .single()

        if (existing) {
          continue // Skip if already imported
        }

        // Determine content type
        let contentType: 'video' | 'image' | 'carousel' = 'image'
        if (post.media_type === 'VIDEO') {
          contentType = 'video'
        } else if (post.media_type === 'CAROUSEL_ALBUM') {
          contentType = 'carousel'
        }

        // Insert new content
        const { data: inserted, error: insertError } = await supabase
          .from('imported_content')
          .insert({
            user_id: userId,
            platform: 'instagram',
            platform_content_id: post.id,
            content_type: contentType,
            content_url: post.media_url,
            thumbnail_url: post.thumbnail_url,
            caption: post.caption,
            engagement_metrics: {
              likes: post.likes_count,
              comments: post.comments_count
            },
            is_approved: false // Require manual approval
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Error inserting Instagram content', insertError)
          continue
        }

        importedContent.push(inserted)
      }

      // Update last sync time
      await supabase
        .from('social_media_connections')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connection.id)

      logger.info('Instagram content import completed', { 
        userId, 
        importedCount: importedContent.length,
        totalPosts: posts.length 
      })

      return importedContent
    } catch (error) {
      logger.error('Error in importInstagramContent', error)
      throw error
    }
  }

  /**
   * Get user's social connections
   */
  async getUserConnections(userId: string): Promise<SocialConnection[]> {
    try {
      const { data, error } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching user connections', error)
        throw new Error('Failed to fetch social connections')
      }

      return data || []
    } catch (error) {
      logger.error('Error in getUserConnections', error)
      throw error
    }
  }

  /**
   * Get user's imported content
   */
  async getUserImportedContent(userId: string, platform?: 'tiktok' | 'instagram'): Promise<ImportedContent[]> {
    try {
      let query = supabase
        .from('imported_content')
        .select('*')
        .eq('user_id', userId)
        .order('imported_at', { ascending: false })

      if (platform) {
        query = query.eq('platform', platform)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Error fetching imported content', error)
        throw new Error('Failed to fetch imported content')
      }

      return data || []
    } catch (error) {
      logger.error('Error in getUserImportedContent', error)
      throw error
    }
  }

  /**
   * Disconnect social media account
   */
  async disconnectAccount(userId: string, platform: 'tiktok' | 'instagram'): Promise<void> {
    try {
      const { error } = await supabase
        .from('social_media_connections')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('platform', platform)

      if (error) {
        logger.error('Error disconnecting account', error)
        throw new Error('Failed to disconnect account')
      }

      logger.info('Account disconnected successfully', { userId, platform })
    } catch (error) {
      logger.error('Error in disconnectAccount', error)
      throw error
    }
  }

  /**
   * Approve imported content
   */
  async approveContent(contentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('imported_content')
        .update({ 
          is_approved: true,
          imported_at: new Date().toISOString()
        })
        .eq('id', contentId)

      if (error) {
        logger.error('Error approving content', error)
        throw new Error('Failed to approve content')
      }

      logger.info('Content approved successfully', { contentId })
    } catch (error) {
      logger.error('Error in approveContent', error)
      throw error
    }
  }
}

export const contentSyncService = new ContentSyncService()
