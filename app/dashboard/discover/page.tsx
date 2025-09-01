'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { SearchInterface } from '@/app/components/dashboard/search-interface'
import { RecipeFilters, SearchParams } from '@/types'

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
  const [filters, setFilters] = useState<RecipeFilters>({})
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const runSearch = async (params: SearchParams) => {
    try {
      setLoading(true)
      let query = supabase
        .from('recipes')
        .select('id, title, description, cook_time, difficulty, rating, likes_count')
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
        query = query.lte('total_time', params.filters.maxTime)
      }

      const { data, error } = await query
      if (error) {
        logger.error('Discover search error', error)
        setRecipes([])
      } else {
        const mapped: RecipeCardProps[] = (data || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          cookTime: r.cook_time,
          difficulty: r.difficulty,
          rating: r.rating || 0,
          creator: { name: 'Creator', avatar: '', initials: 'CR' },
          isTrending: (r.likes_count || 0) > 100,
          isLiked: false
        }))
        setRecipes(mapped)
      }
    } catch (e) {
      logger.error('Discover load error', e)
    } finally {
      setLoading(false)
    }
  }

  const seedRecipes = async () => {
    try {
      setSeeding(true)
      console.log('Starting recipe seeding...')
      
      const response = await fetch('/api/recipes/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)
      
      if (response.ok) {
        console.log('Recipes seeded successfully:', result)
        // Refresh the recipes list
        await runSearch({ query: '', filters: {}, sortBy: 'newest', page: 1, limit: 12 })
      } else {
        console.error('Failed to seed recipes:', result)
        alert(`Failed to seed recipes: ${result.error || result.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error seeding recipes:', error)
      alert(`Error seeding recipes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    runSearch({ query: '', filters: {}, sortBy: 'newest', page: 1, limit: 12 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Discover</h2>
        {recipes.length === 0 && (
          <button
            onClick={seedRecipes}
            disabled={seeding}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {seeding ? 'Seeding Recipes...' : 'Seed Sample Recipes'}
          </button>
        )}
      </div>
      <SearchInterface onSearch={runSearch} filters={filters} onFilterChange={setFilters} />
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onLike={(id) => logger.info('Like', { id })} onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)} />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
