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
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string
          prep_time: number
          cook_time: number
          total_time: number
          servings: number
          difficulty: 'Easy' | 'Medium' | 'Hard'
          cuisine: string
          meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert'
          dietary_tags: string[] | null
          tags: string[] | null
          images: string[] | null
          video_url: string | null
          rating: number
          review_count: number
          likes_count: number
          views_count: number
          is_published: boolean
          creator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          prep_time: number
          cook_time: number
          total_time?: number
          servings: number
          difficulty: 'Easy' | 'Medium' | 'Hard'
          cuisine: string
          meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert'
          dietary_tags?: string[] | null
          tags?: string[] | null
          images?: string[] | null
          video_url?: string | null
          rating?: number
          review_count?: number
          likes_count?: number
          views_count?: number
          is_published?: boolean
          creator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          prep_time?: number
          cook_time?: number
          total_time?: number
          servings?: number
          difficulty?: 'Easy' | 'Medium' | 'Hard'
          cuisine?: string
          meal_type?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert'
          dietary_tags?: string[] | null
          tags?: string[] | null
          images?: string[] | null
          video_url?: string | null
          rating?: number
          review_count?: number
          likes_count?: number
          views_count?: number
          is_published?: boolean
          creator_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          name: string
          amount: number
          unit: string
          notes: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          name: string
          amount: number
          unit: string
          notes?: string | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          name?: string
          amount?: number
          unit?: string
          notes?: string | null
          order_index?: number
          created_at?: string
        }
      }
      instructions: {
        Row: {
          id: string
          recipe_id: string
          step_number: number
          instruction: string
          image_url: string | null
          video_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          step_number: number
          instruction: string
          image_url?: string | null
          video_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          step_number?: number
          instruction?: string
          image_url?: string | null
          video_url?: string | null
          created_at?: string
        }
      }
      recipe_likes: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          created_at?: string
        }
      }
      recipe_reviews: {
        Row: {
          id: string
          recipe_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          name: string
          description: string | null
          is_public: boolean
          cover_image: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_public?: boolean
          cover_image?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          cover_image?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      collection_recipes: {
        Row: {
          id: string
          collection_id: string
          recipe_id: string
          added_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          recipe_id: string
          added_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          recipe_id?: string
          added_at?: string
        }
      }
    }
  }
}
