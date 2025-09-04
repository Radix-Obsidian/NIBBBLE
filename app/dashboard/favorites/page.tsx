'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { Recipe } from '@/types'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data: likes, error: lErr } = await supabase
          .from('recipe_likes')
          .select('recipe_id')
          .eq('user_id', user.id)
        if (lErr) throw lErr
        const ids = (likes || []).map((r: any) => r.recipe_id)
        if (ids.length === 0) { setRecipes([]); return }
        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, likes_count')
          .in('id', ids)
        if (error) throw error
        const mapped: Recipe[] = (data || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          ingredients: [], // Empty array as we don't have ingredients
          instructions: [], // Empty array as we don't have instructions
          prepTime: 0, // Default value
          cookTime: r.cook_time || 0,
          totalTime: (r.cook_time || 0) + 0, // prepTime + cookTime
          servings: 4, // Default value
          difficulty: (r.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
          cuisine: 'Unknown', // Default value
          mealType: 'Dinner' as const, // Default value
          dietaryTags: [], // Empty array
          tags: [], // Empty array
          images: [], // Empty array
          videoUrl: undefined,
          rating: r.rating || 0,
          reviewCount: 0, // Default value
          likesCount: r.likes_count || 0,
          isPublished: true, // Default value
          creatorId: 'unknown', // Default value
          creator: {
            id: 'unknown',
            username: 'unknown',
            email: 'unknown@example.com',
            displayName: 'Unknown Creator',
            avatar: '',
            bio: '',
            favoriteCuisines: [],
            followersCount: 0,
            followingCount: 0,
            recipesCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }))
        setRecipes(mapped)
      } catch (e) {
        logger.error('Favorites load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Favorites</h2>
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)} />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
