'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase/client'
import { Activity } from '@/types'
import { RecipeCardProps as BaseCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { StatsCard } from '@/app/components/dashboard/stats-card'
import { TrendingUp, Heart, Users, Clock } from 'lucide-react'
import { ActivityFeed } from '@/app/components/dashboard/activity-feed'

export default function DashboardPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<BaseCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [page, setPage] = useState(1)
  const perPage = 5

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, creator_id, likes_count')
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          logger.error('Error fetching recipes', error)
          setRecipes([])
        } else {
          const mapped: BaseCardProps[] = (data || []).map((r: any) => ({
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

        const baseActivity: Activity[] = user ? [{
          id: 'signin',
          type: 'recipe',
          actor: { id: user.id, name: user.email || 'User' },
          message: 'Signed in to PantryPals',
          createdAt: new Date()
        }] : []
        setActivities(baseActivity)
      } catch (e) {
        logger.error('Dashboard load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const stats = useMemo(() => ([
    { title: 'Total Recipes', value: recipes.length, change: 0, icon: <TrendingUp className="w-6 h-6" />, color: 'orange' as const },
    { title: 'Your Favorites', value: 0, change: 0, icon: <Heart className="w-6 h-6" />, color: 'amber' as const },
    { title: 'Active Chefs', value: '—', icon: <Users className="w-6 h-6" />, color: 'green' as const },
    { title: 'Avg. Cook Time', value: recipes.length ? `${Math.round(recipes.reduce((a, r) => a + r.cookTime, 0) / recipes.length)} min` : '—', icon: <Clock className="w-6 h-6" />, color: 'blue' as const }
  ]), [recipes])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} change={s.change as any} icon={s.icon} color={s.color} />
        ))}
      </div>

      <RecipeGrid
        recipes={recipes}
        title="Recent Recipes"
        subtitle="Latest from the community"
        showViewAll={false}
        onViewAll={() => {}}
        onLike={(id) => logger.info('Like recipe', { id })}
      />

      <ActivityFeed activities={activities} onLoadMore={() => {}} isLoading={loading} />
    </div>
  )
}
