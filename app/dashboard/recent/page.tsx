'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'

export default function RecentPage() {
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])

  useEffect(() => {
    const load = async () => {
      const ids: string[] = JSON.parse(localStorage.getItem('pp_recently_viewed') || '[]')
      if (!ids.length) { setRecipes([]); return }
      const { data } = await supabase
        .from('recipes')
        .select('id, title, description, cook_time, difficulty, rating, likes_count')
        .in('id', ids.slice(0, 24))
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
      // Keep original order by ids
      mapped.sort((a,b) => ids.indexOf(a.id) - ids.indexOf(b.id))
      setRecipes(mapped)
    }
    load()
  }, [])

  const clear = () => {
    localStorage.removeItem('pp_recently_viewed')
    setRecipes([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
        <button onClick={clear} className="text-sm text-gray-600 hover:text-orange-600">Clear</button>
      </div>
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)} />
      {recipes.length === 0 && (
        <div className="text-sm text-gray-600">No recently viewed recipes yet.</div>
      )}
    </div>
  )
}
