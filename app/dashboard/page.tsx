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
      } catch (e) {
        logger.error('Dashboard load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const fetchActivities = async (pg: number) => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((pg - 1) * perPage, pg * perPage - 1)

      if (error) {
        logger.error('Activities fetch error', error)
        return
      }

      const mapped: Activity[] = (data || []).map((a: any) => ({
        id: a.id,
        type: a.type,
        actor: { id: a.actor_id, name: a.actor_name, avatar: a.actor_avatar },
        target: a.target_id ? { id: a.target_id, type: a.target_type, title: a.target_title } : undefined,
        message: a.message,
        createdAt: new Date(a.created_at)
      }))

      setActivities(mapped)
      setPage(pg)
    } catch (e) {
      logger.error('Activities load error', e)
    }
  }

  const stats = useMemo(() => ([
    { title: 'Recipes', value: recipes.length, change: 0, icon: <BookOpen className="w-6 h-6" />, color: 'orange' as const },
    { title: 'Total Likes', value: 0, change: 0, icon: <Heart className="w-6 h-6" />, color: 'amber' as const },
    { title: 'Total Views', value: 0, icon: <Users className="w-6 h-6" />, color: 'green' as const },
    { title: 'Avg. Cook Time', value: recipes.length ? `${Math.round(recipes.reduce((a, r) => a + r.cookTime, 0) / recipes.length)} min` : '—', icon: <Clock className="w-6 h-6" />, color: 'blue' as const }
  ]), [recipes])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-responsive-xl font-bold text-gray-900">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h2>
          <p className="text-responsive text-gray-600 mt-1">
            Ready to create some delicious recipes today?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href="/dashboard/recipes" className="w-full sm:w-auto">
            <Button size="md" className="btn w-full sm:w-auto">
              <BookOpen className="w-4 h-4 mr-2" />
              New Recipe
            </Button>
          </Link>
          <Link href="/dashboard/discover" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="btn w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Discover
            </Button>
          </Link>
          <Link href="/dashboard/collections" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="btn w-full sm:w-auto">
              <Folder className="w-4 h-4 mr-2" />
              Collections
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} change={s.change as any} icon={s.icon} color={s.color} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Recipes */}
        <div className="space-y-4">
          <RecipeGrid
            recipes={recipes}
            title="Your Recent Recipes"
            subtitle="Latest recipes you've created"
            showViewAll={true}
            onViewAll={() => window.location.assign('/dashboard/recipes')}
            onLike={(id) => logger.info('Like', { id })}
            onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)}
          />
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <ActivityFeed
            activities={activities}
            onLoadMore={() => fetchActivities(page + 1)}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Favorites */}
        <div className="space-y-4">
          <RecipeGrid
            recipes={favorites}
            title="Your Favorites"
            subtitle="Recipes you've liked"
            showViewAll={true}
            onViewAll={() => window.location.assign('/dashboard/favorites')}
            onLike={(id) => logger.info('Like', { id })}
            onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)}
          />
        </div>

        {/* Top Rated */}
        <div className="space-y-4">
          <RecipeGrid
            recipes={topRated}
            title="Top Rated Recipes"
            subtitle="Highest rated recipes"
            showViewAll={true}
            onViewAll={() => window.location.assign('/dashboard/top-rated')}
            onLike={(id) => logger.info('Like', { id })}
            onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}
