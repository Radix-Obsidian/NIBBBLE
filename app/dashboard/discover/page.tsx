'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { SearchInterface } from '@/app/components/dashboard/search-interface'
import { RecipeFilters, SearchParams } from '@/types'
import { useAuth } from '@/hooks/useAuth'

export default function DiscoverPage() {
  const router = useRouter()
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

  const estimateNutrition = (recipe: any) => {
    const title = recipe.title?.toLowerCase() || ''
    const cuisine = recipe.cuisine?.toLowerCase() || ''
    const tags = Array.isArray(recipe.tags) ? recipe.tags : []
    
    // Base estimates for different recipe types
    let baseCalories = 300
    let baseProtein = 15
    let baseFat = 12
    let baseCarbs = 35
    
    // Adjust based on cuisine
    if (cuisine.includes('italian')) {
      baseCalories = 450
      baseProtein = 18
      baseFat = 16
      baseCarbs = 55
    } else if (cuisine.includes('mexican')) {
      baseCalories = 380
      baseProtein = 16
      baseFat = 14
      baseCarbs = 48
    } else if (cuisine.includes('chinese')) {
      baseCalories = 320
      baseProtein = 14
      baseFat = 10
      baseCarbs = 42
    } else if (cuisine.includes('indian')) {
      baseCalories = 350
      baseProtein = 12
      baseFat = 18
      baseCarbs = 38
    } else if (cuisine.includes('french')) {
      baseCalories = 420
      baseProtein = 16
      baseFat = 20
      baseCarbs = 45
    } else if (cuisine.includes('mediterranean')) {
      baseCalories = 280
      baseProtein = 18
      baseFat = 8
      baseCarbs = 32
    }
    
    // Adjust based on recipe title/keywords
    if (title.includes('pasta') || title.includes('noodle')) {
      baseCalories += 100
      baseCarbs += 20
    } else if (title.includes('salad')) {
      baseCalories -= 80
      baseFat -= 6
      baseCarbs -= 15
    } else if (title.includes('soup')) {
      baseCalories -= 120
      baseFat -= 8
      baseCarbs -= 20
    } else if (title.includes('bread') || title.includes('bun')) {
      baseCalories += 80
      baseCarbs += 25
      baseFat += 3
    } else if (title.includes('chicken') || title.includes('poultry')) {
      baseProtein += 8
      baseFat -= 2
    } else if (title.includes('beef') || title.includes('steak')) {
      baseProtein += 6
      baseFat += 4
    } else if (title.includes('fish') || title.includes('seafood')) {
      baseProtein += 4
      baseFat -= 3
    } else if (title.includes('vegetarian') || title.includes('vegan')) {
      baseProtein -= 4
      baseFat -= 3
      baseCarbs += 8
    }
    
    // Adjust based on difficulty (harder = more complex = more calories)
    if (recipe.difficulty === 'Hard') {
      baseCalories += 50
      baseProtein += 3
      baseFat += 2
      baseCarbs += 5
    } else if (recipe.difficulty === 'Easy') {
      baseCalories -= 30
      baseProtein -= 2
      baseFat -= 1
      baseCarbs -= 3
    }
    
    // Add some realistic variation (±15%)
    const variation = 0.85 + (Math.random() * 0.3)
    
    return {
      calories: Math.round(baseCalories * variation),
      protein: Math.round(baseProtein * variation),
      fats: Math.round(baseFat * variation),
      carbs: Math.round(baseCarbs * variation)
    }
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
        const summarize = (r: any) => {
          const clip = (s: string) => s.length > 120 ? s.slice(0, 117).trimEnd() + '…' : s
          const desc = (r.description || '').trim()
          if (desc && !/^delicious\b/i.test(desc)) return clip(desc)
          const ingredients: string[] = Array.isArray(r.ingredients) ? r.ingredients : []
          const main = ingredients.slice(0, 3).join(', ')
          const base = main ? `with ${main}` : ''
          const lead = r.cuisine ? `${r.cuisine} ${r.title}` : r.title
          return clip([lead, base].filter(Boolean).join(' '))
        }

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
            description: summarize(r),
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            cuisine: r.cuisine || undefined,
            image: r.image_url && !/edamam-product-images/.test(r.image_url) ? r.image_url.split('?')[0] : undefined,
            creator: { 
              name: 'Creator', 
              avatar: '', 
              initials: 'CR' 
            },
            resource: {
              name: 'Edamam',
              initials: 'ED'
            },
            isTrending: (r.likes_count || 0) > 100,
            isLiked: likedRecipeIds.includes(r.id),
            nutrition: estimateNutrition(r)
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
    runSearch({ query: '', filters: {}, sortBy: 'newest', page: 1, limit: 50 })
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
        onView={(id) => router.push(`/dashboard/recipes/${id}`)} 
      />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
