import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsqtruntoqahnewlotka.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXRydW50b3FhaG5ld2xvdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODQ1MzAsImV4cCI6MjA3MjE2MDUzMH0.lo9bbbDpJ3LLnDhj61qvuyPshNw5w1vFsCnMXwZ1wWo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type-safe database client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          bio: string | null
          avatar_url: string | null
          favorite_cuisines: string[] | null
          location: string | null
          website: string | null
          is_verified: boolean
          followers_count: number
          following_count: number
          recipes_count: number
          created_at: string
          updated_at: string
          tiktok_handle: string | null
          instagram_handle: string | null
          social_media_connected: boolean
        }
        Insert: {
          id: string
          username: string
          display_name: string
          bio?: string | null
          avatar_url?: string | null
          favorite_cuisines?: string[] | null
          location?: string | null
          website?: string | null
          is_verified?: boolean
          followers_count?: number
          following_count?: number
          recipes_count?: number
          created_at?: string
          updated_at?: string
          tiktok_handle?: string | null
          instagram_handle?: string | null
          social_media_connected?: boolean
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          bio?: string | null
          avatar_url?: string | null
          favorite_cuisines?: string[] | null
          location?: string | null
          website?: string | null
          is_verified?: boolean
          followers_count?: number
          following_count?: number
          recipes_count?: number
          created_at?: string
          updated_at?: string
          tiktok_handle?: string | null
          instagram_handle?: string | null
          social_media_connected?: boolean
        }
      }
      social_media_connections: {
        Row: {
          id: string
          user_id: string
          platform: string
          platform_user_id: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          is_active: boolean
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          platform_user_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          platform_user_id?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      imported_content: {
        Row: {
          id: string
          user_id: string
          platform: string
          platform_content_id: string
          content_type: string
          content_url: string | null
          thumbnail_url: string | null
          caption: string | null
          engagement_metrics: any | null
          is_approved: boolean
          imported_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          platform_content_id: string
          content_type: string
          content_url?: string | null
          thumbnail_url?: string | null
          caption?: string | null
          engagement_metrics?: any | null
          is_approved?: boolean
          imported_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          platform_content_id?: string
          content_type?: string
          content_url?: string | null
          thumbnail_url?: string | null
          caption?: string | null
          engagement_metrics?: any | null
          is_approved?: boolean
          imported_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          ingredients: string[] | null
          instructions: string[] | null
          cook_time: number
          prep_time: number
          difficulty: string
          cuisine: string | null
          tags: string[] | null
          image_url: string | null
          video_url: string | null
          creator_id: string
          rating: number | null
          likes_count: number
          views_count: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ingredients?: string[] | null
          instructions?: string[] | null
          cook_time: number
          prep_time: number
          difficulty: string
          cuisine?: string | null
          tags?: string[] | null
          image_url?: string | null
          video_url?: string | null
          creator_id: string
          rating?: number | null
          likes_count?: number
          views_count?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ingredients?: string[] | null
          instructions?: string[] | null
          cook_time?: number
          prep_time?: number
          difficulty?: string
          cuisine?: string | null
          tags?: string[] | null
          image_url?: string | null
          video_url?: string | null
          creator_id?: string
          rating?: number | null
          likes_count?: number
          views_count?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
