import axios from 'axios'
import { logger } from '@/lib/logger'

export interface TikTokVideo {
  id: string
  caption: string
  video_url: string
  thumbnail_url: string
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  created_at: string
  is_food_related?: boolean
}

export interface TikTokUser {
  id: string
  username: string
  display_name: string
  avatar_url: string
  follower_count: number
  following_count: number
  video_count: number
}

export class TikTokAPI {
  private clientKey: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientKey = process.env.TIKTOK_CLIENT_KEY || ''
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || ''
    this.redirectUri = process.env.TIKTOK_REDIRECT_URI || ''
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state: state
    })

    return `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    open_id: string
    union_id: string
  }> {
    try {
      const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        }
      })

      return response.data
    } catch (error) {
      logger.error('TikTok token exchange error', error)
      throw new Error('Failed to exchange code for token')
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }> {
    try {
      const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache'
        }
      })

      return response.data
    } catch (error) {
      logger.error('TikTok token refresh error', error)
      throw new Error('Failed to refresh token')
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string): Promise<TikTokUser> {
    try {
      const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache'
        }
      })

      return response.data.data.user
    } catch (error) {
      logger.error('TikTok user info error', error)
      throw new Error('Failed to get user info')
    }
  }

  /**
   * Get user's videos
   */
  async getUserVideos(accessToken: string, maxCount: number = 20): Promise<TikTokVideo[]> {
    try {
      const response = await axios.get('https://open.tiktokapis.com/v2/video/list/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache'
        },
        params: {
          max_count: maxCount
        }
      })

      const videos = response.data.data.videos || []
      
      // Filter for food-related content
      return videos
        .map((video: any) => ({
          id: video.id,
          caption: video.title,
          video_url: video.video.download_addr,
          thumbnail_url: video.cover.cover,
          likes_count: video.stats.digg_count,
          comments_count: video.stats.comment_count,
          shares_count: video.stats.share_count,
          views_count: video.stats.play_count,
          created_at: video.create_time,
          is_food_related: this.isFoodRelated(video.title)
        }))
        .filter((video: TikTokVideo) => video.is_food_related)
    } catch (error) {
      logger.error('TikTok videos fetch error', error)
      throw new Error('Failed to fetch videos')
    }
  }

  /**
   * Check if content is food-related
   */
  private isFoodRelated(caption: string): boolean {
    const foodKeywords = [
      'recipe', 'cooking', 'food', 'meal', 'dish', 'chef', 'kitchen',
      'cook', 'bake', 'grill', 'fry', 'boil', 'steam', 'roast',
      'ingredient', 'spice', 'herb', 'sauce', 'dressing', 'marinade',
      'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer',
      'pasta', 'pizza', 'burger', 'salad', 'soup', 'stew', 'curry',
      'bread', 'cake', 'cookie', 'pie', 'ice cream', 'smoothie'
    ]

    const lowerCaption = caption.toLowerCase()
    return foodKeywords.some(keyword => lowerCaption.includes(keyword))
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken)
      return true
    } catch (error) {
      return false
    }
  }
}

export const tiktokAPI = new TikTokAPI()
