'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase/client'
import { Activity } from '@/types'

// Simple interface for dashboard recipe cards
interface DashboardRecipeCard {
  id: any;
  title: any;
  description: any;
  cookTime: any;
  difficulty: any;
  rating: any;
  creator: { name: string; avatar: string; initials: string };
  resource: { name: string; initials: string };
  cuisine: any;
  isTrending: boolean;
  isLiked: boolean;
  nutrition: any;
}

import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { StatsCard } from '@/app/components/dashboard/stats-card'
import { TrendingUp, Heart, Users, Clock, BookOpen, Search, Folder } from 'lucide-react'
import { ActivityFeed } from '@/app/components/dashboard/activity-feed'
import { Button } from '@/app/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<DashboardRecipeCard[]>([])
  const [favorites, setFavorites] = useState<DashboardRecipeCard[]>([])
  const [topRated, setTopRated] = useState<DashboardRecipeCard[]>([])
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<Activity[]>([])
  const [page, setPage] = useState(1)
  const perPage = 5

  // Add the same nutritional estimation function from discover page
  const estimateNutrition = (recipe: any) => {
    const title = recipe.title?.toLowerCase() || ''
    const cuisine = recipe.cuisine?.toLowerCase() || ''
    
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

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, creator_id, likes_count, created_at, cuisine')
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          logger.error('Error fetching recipes', error)
          setRecipes([])
        } else {
          const mapped: DashboardRecipeCard[] = (data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            creator: { name: 'Creator', avatar: '', initials: 'CR' },
            resource: {
              name: 'Edamam',
              initials: 'ED'
            },
            cuisine: r.cuisine,
            isTrending: (r.likes_count || 0) > 100,
            isLiked: false,
            nutrition: estimateNutrition(r) // Add nutritional facts
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
              .select('id, title, description, cook_time, difficulty, rating, likes_count, cuisine')
              .in('id', ids)
            if (favErr) {
              logger.error('Favorites recipes error', favErr)
              setFavorites([])
            } else {
              const favMapped: DashboardRecipeCard[] = (favData || []).map((r: any) => ({
                id: r.id,
                title: r.title,
                description: r.description,
                cookTime: r.cook_time,
                difficulty: r.difficulty,
                rating: r.rating || 0,
                creator: { name: 'Creator', avatar: '', initials: 'CR' },
                resource: {
                  name: 'Edamam',
                  initials: 'ED'
                },
                cuisine: r.cuisine,
                isTrending: (r.likes_count || 0) > 100,
                isLiked: true,
                nutrition: estimateNutrition(r) // Add nutritional facts
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
          .select('id, title, description, cook_time, difficulty, rating, likes_count, cuisine')
          .order('rating', { ascending: false })
          .order('likes_count', { ascending: false })
          .limit(6)
        if (topErr) {
          logger.error('Top rated fetch error', topErr)
          setTopRated([])
        } else {
          const topMapped: DashboardRecipeCard[] = (topData || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            creator: { name: 'Creator', avatar: '', initials: 'CR' },
            resource: {
              name: 'Edamam',
              initials: 'ED'
            },
            cuisine: r.cuisine,
            isTrending: (r.likes_count || 0) > 100,
            isLiked: false,
            nutrition: estimateNutrition(r) // Add nutritional facts
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-2">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 🎉✨
            </h2>
            <p className="text-responsive text-gray-600">
              Ready to create some delicious recipes today? 🍳👨‍🍳
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:flex-shrink-0">
            <Link href="/dashboard/recipes" className="w-full sm:w-auto">
              <Button size="md" className="btn w-full sm:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-medium">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">New Recipe</span>
                <span className="xs:hidden">New</span>
              </Button>
            </Link>
            <Link href="/dashboard/discover" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="btn w-full sm:w-auto border-gray-200 hover:bg-gray-50">
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Discover</span>
                <span className="xs:hidden">Explore</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Recipes */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Recipes</h3>
          <Link href="/dashboard/recipes" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-soft border border-white/20 animate-pulse">
                <div className="w-full aspect-video bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <RecipeGrid 
            recipes={recipes} 
            title="" 
            subtitle="" 
            showViewAll={false} 
            onViewAll={() => router.push('/dashboard/recipes')} 
            onLike={(id) => logger.info('Like', { id })} 
            onView={(id) => router.push(`/dashboard/recipes/${id}`)} 
          />
        )}
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Your Favorites</h3>
            <Link href="/dashboard/favorites" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <RecipeGrid 
            recipes={favorites} 
            title="" 
            subtitle="" 
            showViewAll={false} 
            onViewAll={() => router.push('/dashboard/favorites')} 
            onLike={(id) => logger.info('Like', { id })} 
            onView={(id) => router.push(`/dashboard/recipes/${id}`)} 
          />
        </div>
      )}

      {/* Top Rated */}
      {topRated.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Top Rated Recipes</h3>
            <Link href="/dashboard/top-rated" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          <RecipeGrid 
            recipes={topRated} 
            title="" 
            subtitle="" 
            showViewAll={false} 
            onViewAll={() => router.push('/dashboard/top-rated')} 
            onLike={(id) => logger.info('Like', { id })} 
            onView={(id) => router.push(`/dashboard/recipes/${id}`)} 
          />
        </div>
      )}

      {/* Activity Feed */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Activity</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchActivities(page + 1)}
            disabled={activities.length < perPage}
          >
            Load More
          </Button>
        </div>
        <ActivityFeed 
          activities={activities} 
          onLoadMore={() => fetchActivities(page + 1)}
          isLoading={loading}
        />
      </div>
    </div>
  )
}
