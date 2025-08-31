'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'

export default function TopRatedPage() {
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('recipes')
        .select('id, title, description, cook_time, difficulty, rating, likes_count')
        .order('rating', { ascending: false })
        .order('likes_count', { ascending: false })
        .limit(24)
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
    load()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Top Rated</h2>
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} />
    </div>
  )
}
