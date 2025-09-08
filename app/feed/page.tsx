'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase/client'
import { VideoRecipeCard } from '@/app/components/social/video-recipe-card'
import { CreatorStoryBar } from '@/app/components/social/creator-story-bar'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'

interface FeedRecipe {
  id: string
  title: string
  description: string
  cook_time: number
  difficulty: string
  rating: number
  cuisine: string
  creator_id: string
  likes_count: number
  comments_count: number
  shares_count: number
  video_url?: string
  image_url?: string
  created_at: string
  creator: {
    id: string
    display_name: string
    username: string
    avatar_url?: string
    verified: boolean
    followers_count: number
  }
  nutrition: {
    calories: number
    protein: number
    fats: number
    carbs: number
  }
  isLiked: boolean
  isBookmarked: boolean
}

export default function FeedPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<FeedRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Load feed recipes with infinite scroll
  const loadFeedRecipes = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!user) return

    try {
      if (pageNum === 0) setLoading(true)

      const { data, error } = await supabase
        .from('recipes')
        .select(`
          id, title, description, cook_time, difficulty, rating, cuisine, 
          creator_id, likes_count, comments_count, shares_count, created_at,
          profiles:creator_id (
            id, display_name, username, avatar_url, followers_count
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageNum * 10, pageNum * 10 + 9)

      if (error) {
        logger.error('Error fetching feed recipes', error)
        return
      }

      // Transform data to match our interface
      const transformedRecipes: FeedRecipe[] = (data || []).map((recipe: any) => {
        const profile = recipe.profiles || {}
        
        return {
          id: recipe.id,
          title: recipe.title,
          description: recipe.description,
          cook_time: recipe.cook_time,
          difficulty: recipe.difficulty,
          rating: recipe.rating || 0,
          cuisine: recipe.cuisine,
          creator_id: recipe.creator_id,
          likes_count: recipe.likes_count || 0,
          comments_count: recipe.comments_count || 0,
          shares_count: recipe.shares_count || 0,
          video_url: generateVideoUrl(recipe),
          image_url: generateImageUrl(recipe),
          created_at: recipe.created_at,
          creator: {
            id: profile.id || recipe.creator_id,
            display_name: profile.display_name || 'Anonymous Chef',
            username: profile.username || `chef${Math.random().toString(36).substr(2, 6)}`,
            avatar_url: profile.avatar_url,
            verified: Math.random() > 0.7, // Simulate verification
            followers_count: profile.followers_count || Math.floor(Math.random() * 10000)
          },
          nutrition: estimateNutrition(recipe),
          isLiked: false, // Will be updated with actual user data
          isBookmarked: false // Will be updated with actual user data
        }
      })

      if (append) {
        setRecipes(prev => [...prev, ...transformedRecipes])
      } else {
        setRecipes(transformedRecipes)
      }

      setHasMore(transformedRecipes.length === 10)
    } catch (error) {
      logger.error('Feed load error', error)
    } finally {
      if (pageNum === 0) setLoading(false)
    }
  }, [user])

  // Generate video URL for recipe
  const generateVideoUrl = (recipe: any): string => {
    // In a real app, this would be actual video URLs from your storage
    const videoIds = [
      'dQw4w9WgXcQ', 'ScMzIvxBSi4', 'fJ9rUzIMcZQ', 'SQoA_wjmE9w', 
      'QOJOPdHgMEA', 'f4F8UdYs2bM', 'oP7TcX6tGVg', 'uHB8BN4p2x0'
    ]
    const randomId = videoIds[Math.floor(Math.random() * videoIds.length)]
    return `https://www.youtube.com/embed/${randomId}?autoplay=1&mute=1&loop=1&controls=0`
  }

  // Generate image URL for recipe
  const generateImageUrl = (recipe: any): string => {
    const imageBaseUrls = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
      'https://images.unsplash.com/photo-1555939594-58e22ba0c4d1',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
      'https://images.unsplash.com/photo-1563379091339-03246963d29b'
    ]
    const randomImage = imageBaseUrls[Math.floor(Math.random() * imageBaseUrls.length)]
    return `${randomImage}?w=400&h=600&fit=crop`
  }

  // Estimate nutrition information
  const estimateNutrition = (recipe: any) => {
    const title = recipe.title?.toLowerCase() || ''
    const cuisine = recipe.cuisine?.toLowerCase() || ''
    
    let baseCalories = 350
    let baseProtein = 18
    let baseFat = 14
    let baseCarbs = 42
    
    // Cuisine adjustments
    if (cuisine.includes('italian')) {
      baseCalories = 420; baseProtein = 20; baseFat = 16; baseCarbs = 55
    } else if (cuisine.includes('asian')) {
      baseCalories = 310; baseProtein = 16; baseFat = 12; baseCarbs = 38
    } else if (cuisine.includes('mexican')) {
      baseCalories = 380; baseProtein = 18; baseFat = 15; baseCarbs = 45
    }
    
    // Add variation
    const variation = 0.85 + (Math.random() * 0.3)
    
    return {
      calories: Math.round(baseCalories * variation),
      protein: Math.round(baseProtein * variation),
      fats: Math.round(baseFat * variation),
      carbs: Math.round(baseCarbs * variation)
    }
  }

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prevPage => {
            const nextPage = prevPage + 1
            loadFeedRecipes(nextPage, true)
            return nextPage
          })
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadFeedRecipes])

  // Load initial feed
  useEffect(() => {
    loadFeedRecipes(0, false)
  }, [loadFeedRecipes])

  // Handle recipe interactions
  const handleLike = async (recipeId: string) => {
    if (!user) return

    try {
      // Optimistic update
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { 
              ...recipe, 
              isLiked: !recipe.isLiked,
              likes_count: recipe.isLiked ? recipe.likes_count - 1 : recipe.likes_count + 1
            }
          : recipe
      ))

      // TODO: Implement actual like API call
      logger.info('Like toggled', { recipeId, userId: user.id })
    } catch (error) {
      logger.error('Like error', error)
    }
  }

  const handleComment = (recipeId: string) => {
    logger.info('Comment clicked', { recipeId })
    // TODO: Open comments modal
  }

  const handleShare = (recipeId: string) => {
    logger.info('Share clicked', { recipeId })
    // TODO: Open share modal
  }

  const handleBookmark = (recipeId: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, isBookmarked: !recipe.isBookmarked }
        : recipe
    ))
    logger.info('Bookmark toggled', { recipeId })
  }

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-600 mt-4">Loading your feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Creator Stories Bar */}
      <div className="sticky top-16 md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4">
        <CreatorStoryBar />
      </div>

      {/* Feed Content */}
      <div className="space-y-0">
        {recipes.map((recipe, index) => (
          <VideoRecipeCard
            key={recipe.id}
            recipe={recipe}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onBookmark={handleBookmark}
            autoPlay={index === 0} // Auto-play first video
          />
        ))}

        {/* Loading More Indicator */}
        {hasMore && (
          <div ref={observerTarget} className="py-8 flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && recipes.length > 0 && (
          <div className="py-8 text-center text-gray-500">
            <p className="text-sm">You're all caught up! 🎉</p>
            <p className="text-xs mt-2">Follow more creators to see more recipes</p>
          </div>
        )}
      </div>
    </div>
  )
}