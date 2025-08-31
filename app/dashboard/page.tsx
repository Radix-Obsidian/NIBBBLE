'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase/client'
import { Activity } from '@/types'
import { RecipeCardProps as BaseCardProps } from '@/app/components/recipe/recipe-card'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { StatsCard } from '@/app/components/dashboard/stats-card'
import { TrendingUp, Heart, Users, Clock, BookOpen, Search, Folder } from 'lucide-react'
import { ActivityFeed } from '@/app/components/dashboard/activity-feed'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<BaseCardProps[]>([])
  const [favorites, setFavorites] = useState<BaseCardProps[]>([])
  const [topRated, setTopRated] = useState<BaseCardProps[]>([])
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
          .select('id, title, description, cook_time, difficulty, rating, creator_id, likes_count, created_at')
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

        // Favorites
        const { data: likeRows, error: likeErr } = await supabase
          .from('recipe_likes')
          .select('recipe_id')
          .eq('user_id', user.id)
        if (likeErr) {
          logger.error('Favorites fetch error', likeErr)
          setFavorites([])
        } else {
          const ids = (likeRows || []).map((r: any) => r.recipe_id)
          if (ids.length) {
            const { data: favData, error: favErr } = await supabase
              .from('recipes')
              .select('id, title, description, cook_time, difficulty, rating, likes_count')
              .in('id', ids)
            if (favErr) {
              logger.error('Favorites recipes error', favErr)
              setFavorites([])
            } else {
              const favMapped: BaseCardProps[] = (favData || []).map((r: any) => ({
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
              setFavorites(favMapped)
            }
          } else {
            setFavorites([])
          }
        }

        // Top rated
        const { data: topData, error: topErr } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, likes_count')
          .order('rating', { ascending: false })
          .order('likes_count', { ascending: false })
          .limit(6)
        if (topErr) {
          logger.error('Top rated fetch error', topErr)
          setTopRated([])
        } else {
          const topMapped: BaseCardProps[] = (topData || []).map((r: any) => ({
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
          setTopRated(topMapped)
        }

        // Initial activities
        await fetchActivities(1)
      } catch (e) {
        logger.error('Dashboard load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchActivities = async (pg: number) => {
    if (!user) return
    const from = (pg - 1) * perPage
    const to = from + perPage - 1
    const { data, error } = await supabase
      .from('recipes')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .range(from, to)
    if (error) {
      logger.error('Activities fetch error', error)
      return
    }
    const mapped: Activity[] = (data || []).map((r: any) => ({
      id: `r-${r.id}-${pg}`,
      type: 'recipe',
      actor: { id: user.id, name: user.email || 'User' },
      message: `New recipe: ${r.title}`,
      createdAt: new Date(r.created_at)
    }))
    setActivities((prev) => (pg === 1 ? mapped : [...prev, ...mapped]))
    setPage(pg)
  }

  const stats = useMemo(() => ([
    { title: 'Recipes', value: recipes.length, change: 0, icon: <BookOpen className="w-6 h-6" />, color: 'orange' as const },
    { title: 'Total Likes', value: 0, change: 0, icon: <Heart className="w-6 h-6" />, color: 'amber' as const },
    { title: 'Total Views', value: 0, icon: <Users className="w-6 h-6" />, color: 'green' as const },
    { title: 'Avg. Cook Time', value: recipes.length ? `${Math.round(recipes.reduce((a, r) => a + r.cookTime, 0) / recipes.length)} min` : '—', icon: <Clock className="w-6 h-6" />, color: 'blue' as const }
  ]), [recipes])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h2>
          <p className="text-gray-600">Ready to create some delicious recipes today?</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/recipes"><Button size="md" className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> New Recipe</Button></Link>
          <Link href="/dashboard/discover"><Button variant="outline" size="md" className="flex items-center"><Search className="w-4 h-4 mr-2" /> Discover</Button></Link>
          <Link href="/dashboard/collections"><Button variant="outline" size="md" className="flex items-center"><Folder className="w-4 h-4 mr-2" /> Collections</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} change={s.change as any} icon={s.icon} color={s.color} />
        ))}
      </div>

      <RecipeGrid
        recipes={recipes}
        title="Your Recent Recipes"
        subtitle={recipes.length ? 'Start where you left off' : ''}
        showViewAll={!!recipes.length}
        onViewAll={() => {}}
        onLike={(id) => logger.info('Like recipe', { id })}
      />

      <ActivityFeed activities={activities} onLoadMore={() => fetchActivities(page + 1)} isLoading={loading} />
    </div>
  )
}
