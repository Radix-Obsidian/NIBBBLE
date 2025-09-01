'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { SearchInterface } from '@/app/components/dashboard/search-interface'
import { RecipeFilters, SearchParams } from '@/types'
import { useAuth } from '@/hooks/useAuth'

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
  const [filters, setFilters] = useState<RecipeFilters>({})
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const parseNutritionTag = (tags: string[], key: string) => {
    const found = tags.find((t) => t.startsWith(`${key}:`))
    if (!found) return 0
    const v = Number(found.split(':')[1])
    return Number.isFinite(v) ? v : 0
  }

  const runSearch = async (params: SearchParams) => {
    try {
      setLoading(true)
      let query = supabase
        .from('recipes')
        .select(`
          id, 
          title, 
          description, 
          cook_time, 
          prep_time,
          difficulty, 
          rating, 
          likes_count,
          cuisine,
          image_url,
          tags,
          creator_id
        `)
        .order(params.sortBy === 'newest' ? 'created_at' : params.sortBy === 'rating' ? 'rating' : 'likes_count', { ascending: false })
        .limit(params.limit)

      if (params.query) {
        query = query.ilike('title', `%${params.query}%`)
      }
      if (params.filters.cuisine && params.filters.cuisine.length) {
        query = query.in('cuisine', params.filters.cuisine as any)
      }
      if (params.filters.difficulty && params.filters.difficulty.length) {
        query = query.in('difficulty', params.filters.difficulty as any)
      }
      if (params.filters.maxTime) {
        query = query.lte('cook_time', params.filters.maxTime)
      }

      const { data, error } = await query
      if (error) {
        logger.error('Discover search error', error)
        setRecipes([])
      } else {
        // Get user's liked recipes if authenticated
        let likedRecipeIds: string[] = []
        if (user) {
          const { data: likes } = await supabase
            .from('recipe_likes')
            .select('recipe_id')
            .eq('user_id', user.id)
          likedRecipeIds = (likes || []).map((l: any) => l.recipe_id)
        }

        const mapped: RecipeCardProps[] = (data || []).map((r: any) => {
          const tags = Array.isArray(r.tags) ? r.tags : []
          
          return {
            id: r.id,
            title: r.title,
            description: r.description,
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            cuisine: r.cuisine,
            image: r.image_url,
            creator: { 
              name: 'Creator', 
              avatar: '', 
              initials: 'CR' 
            },
            isTrending: (r.likes_count || 0) > 100,
            isLiked: likedRecipeIds.includes(r.id),
            nutrition: {
              calories: parseNutritionTag(tags, 'calories'),
              protein: parseNutritionTag(tags, 'protein_g'),
              fats: parseNutritionTag(tags, 'fats_g'),
              carbs: parseNutritionTag(tags, 'carbs_g')
            }
          }
        })
        setRecipes(mapped)
      }
    } catch (e) {
      logger.error('Discover load error', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (recipeId: string) => {
    if (!user) {
      logger.info('User not authenticated, cannot like recipe')
      return
    }

    try {
      // Optimistically update UI first
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isLiked: !recipe.isLiked }
            : recipe
        )
      )

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('recipe_likes')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Unlike
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id)
        
        // Update likes count manually
        const { data: recipe } = await supabase
          .from('recipes')
          .select('likes_count')
          .eq('id', recipeId)
          .single()
        
        if (recipe) {
          await supabase
            .from('recipes')
            .update({ likes_count: Math.max(0, recipe.likes_count - 1) })
            .eq('id', recipeId)
        }

        // Update local state with new likes count
        setRecipes(prevRecipes => 
          prevRecipes.map(recipe => 
            recipe.id === recipeId 
              ? { ...recipe, isLiked: false }
              : recipe
          )
        )
      } else {
        // Like
        await supabase
          .from('recipe_likes')
          .insert({ recipe_id: recipeId, user_id: user.id })
        
        // Update likes count manually
        const { data: recipe } = await supabase
          .from('recipes')
          .select('likes_count')
          .eq('id', recipeId)
          .single()
        
        if (recipe) {
          await supabase
            .from('recipes')
            .update({ likes_count: recipe.likes_count + 1 })
            .eq('id', recipeId)
        }

        // Update local state with new likes count
        setRecipes(prevRecipes => 
          prevRecipes.map(recipe => 
            recipe.id === recipeId 
              ? { ...recipe, isLiked: true }
              : recipe
          )
        )
      }
    } catch (error) {
      logger.error('Error handling like', error)
      // Revert optimistic update on error
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isLiked: !recipe.isLiked }
            : recipe
        )
      )
    }
  }

  useEffect(() => {
    runSearch({ query: '', filters: {}, sortBy: 'newest', page: 1, limit: 12 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Discover</h2>
      <SearchInterface onSearch={runSearch} filters={filters} onFilterChange={setFilters} />
      <RecipeGrid 
        recipes={recipes} 
        title="" 
        subtitle="" 
        showViewAll={false} 
        onViewAll={() => {}} 
        onLike={handleLike} 
        onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)} 
      />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
