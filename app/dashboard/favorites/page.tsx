'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
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
        const mapped: RecipeCardProps[] = (data || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          cookTime: r.cook_time,
          difficulty: r.difficulty,
          rating: r.rating || 0,
          creator: { name: 'Creator', avatar: '', initials: 'CR' },
          isTrending: (r.likes_count || 0) > 100,
          isLiked: true
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
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
