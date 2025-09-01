import axios from 'axios'
import { logger } from '@/lib/logger'

export interface InstagramPost {
  id: string
  caption: string
  media_url: string
  thumbnail_url: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  likes_count: number
  comments_count: number
  created_at: string
  is_food_related?: boolean
}

export interface InstagramUser {
  id: string
  username: string
  account_type: string
  media_count: number
}

export class InstagramAPI {
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID || ''
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || ''
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || ''
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state: state
    })

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    access_token: string
    user_id: string
  }> {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: code
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      return response.data
    } catch (error) {
      logger.error('Instagram token exchange error', error)
      throw new Error('Failed to exchange code for token')
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string): Promise<InstagramUser> {
    try {
      const response = await axios.get(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`)
      return response.data
    } catch (error) {
      logger.error('Instagram user info error', error)
      throw new Error('Failed to get user info')
    }
  }

  /**
   * Get user's media posts
   */
  async getUserMedia(accessToken: string, limit: number = 20): Promise<InstagramPost[]> {
    try {
      const response = await axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,like_count,comments_count,timestamp&access_token=${accessToken}&limit=${limit}`)
      
      const posts = response.data.data || []
      
      // Filter for food-related content
      return posts
        .map((post: any) => ({
          id: post.id,
          caption: post.caption || '',
          media_url: post.media_url,
          thumbnail_url: post.thumbnail_url || post.media_url,
          media_type: post.media_type,
          likes_count: post.like_count || 0,
          comments_count: post.comments_count || 0,
          created_at: post.timestamp,
          is_food_related: this.isFoodRelated(post.caption || '')
        }))
        .filter((post: InstagramPost) => post.is_food_related)
    } catch (error) {
      logger.error('Instagram media fetch error', error)
      throw new Error('Failed to fetch media')
    }
  }

  /**
   * Get specific media by ID
   */
  async getMediaById(mediaId: string, accessToken: string): Promise<InstagramPost> {
    try {
      const response = await axios.get(`https://graph.instagram.com/${mediaId}?fields=id,caption,media_type,media_url,thumbnail_url,like_count,comments_count,timestamp&access_token=${accessToken}`)
      
      const post = response.data
      return {
        id: post.id,
        caption: post.caption || '',
        media_url: post.media_url,
        thumbnail_url: post.thumbnail_url || post.media_url,
        media_type: post.media_type,
        likes_count: post.like_count || 0,
        comments_count: post.comments_count || 0,
        created_at: post.timestamp,
        is_food_related: this.isFoodRelated(post.caption || '')
      }
    } catch (error) {
      logger.error('Instagram media by ID fetch error', error)
      throw new Error('Failed to fetch media by ID')
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
      'bread', 'cake', 'cookie', 'pie', 'ice cream', 'smoothie',
      '🍕', '🍔', '🍜', '🍣', '🍱', '🥗', '🍰', '🍪', '🍩', '🍦',
      '🥘', '🍳', '🥖', '🧀', '🥩', '🍗', '🥬', '🥕', '🍅', '🥑'
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

  /**
   * Refresh access token (Instagram Basic Display API doesn't support refresh tokens)
   * Users need to re-authenticate when token expires
   */
  async refreshToken(): Promise<never> {
    throw new Error('Instagram Basic Display API does not support token refresh. User must re-authenticate.')
  }
}

export const instagramAPI = new InstagramAPI()
