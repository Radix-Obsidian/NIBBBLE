import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase/client'
import { ShoppingCartService } from './shopping-cart-service'
import * as EnhancedGrocery from './enhanced-grocery-service'

/**
 * Service to integrate commerce features with existing user profiles
 * This connects shopping preferences with AI cooking profiles and user data
 */

export interface UserShoppingProfile {
  user_id: string
  dietary_restrictions: string[]
  preferred_stores: string[]
  budget_range: {
    min: number
    max: number
  }
  shopping_preferences: {
    organic: boolean
    local: boolean
    bulk_buying: boolean
    brand_loyalty: boolean
  }
  location: {
    zipCode?: string
    latitude?: number
    longitude?: number
  }
  created_at: string
  updated_at: string
}

export interface UserShoppingStats {
  total_spent: number
  total_savings: number
  recipes_shopped: number
  favorite_categories: string[]
  avg_cart_size: number
  preferred_stores: Array<{
    store_id: string
    store_name: string
    visit_count: number
    avg_spending: number
  }>
}

export class UserCommerceIntegration {
  /**
   * Get user's shopping profile, creating one if it doesn't exist
   */
  static async getUserShoppingProfile(userId: string): Promise<UserShoppingProfile | null> {
    try {
      // First try to get existing profile
      const { data: existingProfile, error } = await supabase
        .from('user_shopping_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingProfile) {
        return existingProfile
      }

      // If no profile exists, create one with defaults
      if (error?.code === 'PGRST116') { // Row not found
        return await this.createDefaultShoppingProfile(userId)
      }

      throw error

    } catch (error) {
      logger.error('Failed to get user shopping profile', { userId, error })
      return null
    }
  }

  /**
   * Create a default shopping profile based on user's AI cooking profile
   */
  static async createDefaultShoppingProfile(userId: string): Promise<UserShoppingProfile | null> {
    try {
      // Get user's AI cooking profile to infer shopping preferences
      const { data: cookingProfile } = await supabase
        .from('ai_cooking_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Extract dietary preferences from cooking profile
      const dietaryRestrictions = cookingProfile?.dietary_restrictions || []
      const cuisinePreferences = cookingProfile?.cuisine_preferences || []

      const defaultProfile: Partial<UserShoppingProfile> = {
        user_id: userId,
        dietary_restrictions: dietaryRestrictions,
        preferred_stores: [],
        budget_range: {
          min: 50,
          max: 200
        },
        shopping_preferences: {
          organic: dietaryRestrictions.includes('organic'),
          local: false,
          bulk_buying: false,
          brand_loyalty: false
        },
        location: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_shopping_profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (error) throw error

      logger.info('Created default shopping profile for user', { userId })
      return data

    } catch (error) {
      logger.error('Failed to create default shopping profile', { userId, error })
      return null
    }
  }

  /**
   * Update user shopping profile
   */
  static async updateShoppingProfile(
    userId: string, 
    updates: Partial<UserShoppingProfile>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_shopping_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      logger.info('Updated user shopping profile', { userId })
      return true

    } catch (error) {
      logger.error('Failed to update shopping profile', { userId, error })
      return false
    }
  }

  /**
   * Get personalized product recommendations based on user profile
   */
  static async getPersonalizedRecommendations(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const profile = await this.getUserShoppingProfile(userId)
      if (!profile) {
        // Fall back to basic search
        return await EnhancedGrocery.searchEnhancedProducts(query, undefined, undefined, limit)
      }

      // Use profile data to enhance search filters
      const filters = {
        organic: profile.shopping_preferences.organic,
        dietaryRestrictions: profile.dietary_restrictions,
        maxPrice: profile.budget_range.max / 10 // Rough per-item budget
      }

      const locationId = profile.preferred_stores[0] // Use preferred store if available

      return await EnhancedGrocery.searchEnhancedProducts(
        query,
        locationId,
        filters,
        limit
      )

    } catch (error) {
      logger.error('Failed to get personalized recommendations', { userId, query, error })
      // Fall back to basic search
      return await EnhancedGrocery.searchEnhancedProducts(query, undefined, undefined, limit)
    }
  }

  /**
   * Generate smart shopping list based on user's cooking history and preferences
   */
  static async generatePersonalizedShoppingList(
    userId: string,
    recipeIds: string[]
  ): Promise<any> {
    try {
      const profile = await this.getUserShoppingProfile(userId)
      
      // Get recipe ingredients
      const { data: recipes } = await supabase
        .from('recipes')
        .select('ingredients')
        .in('id', recipeIds)

      if (!recipes) return null

      // Flatten ingredients
      const allIngredients = recipes.flatMap(recipe => 
        recipe.ingredients || []
      ).map(ingredient => 
        typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient.ingredient
      )

      // Generate smart shopping list with user preferences
      const shoppingList = await EnhancedGrocery.generateSmartShoppingList(
        allIngredients,
        profile?.location || {},
        {
          budget: profile?.budget_range.max,
          dietary: profile?.dietary_restrictions,
          preferredStores: profile?.preferred_stores
        }
      )

      return shoppingList

    } catch (error) {
      logger.error('Failed to generate personalized shopping list', { userId, recipeIds, error })
      return null
    }
  }

  /**
   * Track user shopping activity and update stats
   */
  static async trackShoppingActivity(
    userId: string,
    activity: {
      type: 'cart_item_added' | 'recipe_added_to_cart' | 'cart_optimized' | 'order_placed'
      data: any
    }
  ): Promise<void> {
    try {
      // Log activity for analytics
      await supabase
        .from('user_shopping_activities')
        .insert({
          user_id: userId,
          activity_type: activity.type,
          activity_data: activity.data,
          created_at: new Date().toISOString()
        })

      // Update user shopping stats
      await this.updateShoppingStats(userId, activity)

      logger.info('Tracked shopping activity', { userId, activityType: activity.type })

    } catch (error) {
      logger.error('Failed to track shopping activity', { userId, activity, error })
    }
  }

  /**
   * Get user shopping statistics
   */
  static async getUserShoppingStats(userId: string): Promise<UserShoppingStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_shopping_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data || {
        total_spent: 0,
        total_savings: 0,
        recipes_shopped: 0,
        favorite_categories: [],
        avg_cart_size: 0,
        preferred_stores: []
      }

    } catch (error) {
      logger.error('Failed to get user shopping stats', { userId, error })
      return null
    }
  }

  /**
   * Sync shopping preferences with cooking profile changes
   */
  static async syncWithCookingProfile(userId: string): Promise<void> {
    try {
      // Get latest cooking profile
      const { data: cookingProfile } = await supabase
        .from('ai_cooking_profiles')
        .select('dietary_restrictions, cuisine_preferences, health_goals')
        .eq('user_id', userId)
        .single()

      if (!cookingProfile) return

      // Update shopping profile with cooking preferences
      await this.updateShoppingProfile(userId, {
        dietary_restrictions: cookingProfile.dietary_restrictions || [],
        shopping_preferences: {
          organic: (cookingProfile.health_goals || []).includes('organic'),
          local: (cookingProfile.health_goals || []).includes('local'),
          bulk_buying: false,
          brand_loyalty: false
        }
      })

      logger.info('Synced shopping profile with cooking profile', { userId })

    } catch (error) {
      logger.error('Failed to sync shopping profile with cooking profile', { userId, error })
    }
  }

  /**
   * Get shopping insights for dashboard
   */
  static async getShoppingInsights(userId: string): Promise<{
    weeklySpending: number
    topCategories: string[]
    savingsOpportunities: string[]
    preferredStores: string[]
  }> {
    try {
      const stats = await this.getUserShoppingStats(userId)
      const profile = await this.getUserShoppingProfile(userId)

      return {
        weeklySpending: (stats?.total_spent || 0) / 4, // Rough weekly estimate
        topCategories: stats?.favorite_categories.slice(0, 3) || [],
        savingsOpportunities: [
          'Switch to store brands for 15% savings',
          'Buy in bulk for non-perishables',
          'Use digital coupons'
        ],
        preferredStores: stats?.preferred_stores.map(s => s.store_name) || []
      }

    } catch (error) {
      logger.error('Failed to get shopping insights', { userId, error })
      return {
        weeklySpending: 0,
        topCategories: [],
        savingsOpportunities: [],
        preferredStores: []
      }
    }
  }

  // Private helper methods

  private static async updateShoppingStats(
    userId: string,
    activity: { type: string; data: any }
  ): Promise<void> {
    try {
      // This would implement complex stats updates based on activity type
      // For now, just log the activity
      logger.debug('Shopping stats update triggered', { userId, activityType: activity.type })

    } catch (error) {
      logger.error('Failed to update shopping stats', { userId, error })
    }
  }
}