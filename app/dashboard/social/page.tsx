'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'

export default function SocialPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data: follows, error: followsErr } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id)

        if (followsErr) {
          logger.error('Follows fetch error', followsErr)
          setRecipes([])
          return
        }

        const followingIds = (follows || []).map((f: any) => f.following_id)
        if (followingIds.length === 0) {
          setRecipes([])
          return
        }

        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, likes_count')
          .in('creator_id', followingIds)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Following feed fetch error', error)
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
        logger.error('Social feed error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Following Feed</h2>
      <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onLike={(id) => logger.info('Like', { id })} />
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
