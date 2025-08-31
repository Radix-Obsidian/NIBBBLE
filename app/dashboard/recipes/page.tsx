'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { Button } from '@/app/components/ui/button'
export default function MyRecipesPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, likes_count')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Error fetching user recipes', error)
          setRecipes([])
        } else {
          const mapped: RecipeCardProps[] = (data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            creator: { name: 'You', avatar: '', initials: 'YO' },
            isTrending: (r.likes_count || 0) > 100,
            isLiked: false
          }))
          setRecipes(mapped)
        }
      } catch (e) {
        logger.error('My recipes load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>
        <Link href="/dashboard/recipes">
          <Button>New Recipe</Button>
        </Link>
      </div>
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onLike={(id) => logger.info('Like', { id })} />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
