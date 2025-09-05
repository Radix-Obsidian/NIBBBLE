import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Client for browser/user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client for admin operations (only available on server-side)
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Type-safe database client
export type Database = {
  public: {
    Tables: {
      waitlist_entries: {
        Row: {
          id: string
          email: string
          type: 'creator' | 'cooker'
          name: string
          status: 'pending' | 'approved' | 'rejected'
          social_handle: string | null
          cooking_experience: string | null
          specialty: string | null
          audience_size: string | null
          content_type: string | null
          goals: string | null
          kitchen_setup: string | null
          cooking_goals: string | null
          frequency: string | null
          challenges: string | null
          interests: string | null
          submitted_at: string
          approved_at: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          type: 'creator' | 'cooker'
          name: string
          status?: 'pending' | 'approved' | 'rejected'
          social_handle?: string | null
          cooking_experience?: string | null
          specialty?: string | null
          audience_size?: string | null
          content_type?: string | null
          goals?: string | null
          kitchen_setup?: string | null
          cooking_goals?: string | null
          frequency?: string | null
          challenges?: string | null
          interests?: string | null
          submitted_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          type?: 'creator' | 'cooker'
          name?: string
          status?: 'pending' | 'approved' | 'rejected'
          social_handle?: string | null
          cooking_experience?: string | null
          specialty?: string | null
          audience_size?: string | null
          content_type?: string | null
          goals?: string | null
          kitchen_setup?: string | null
          cooking_goals?: string | null
          frequency?: string | null
          challenges?: string | null
          interests?: string | null
          submitted_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
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
