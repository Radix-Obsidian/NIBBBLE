'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, TrendingUp, Clock, Heart } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { VideoRecipeCard } from '@/app/components/social/video-recipe-card'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

interface DiscoverRecipe {
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

export default function DiscoverPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<DiscoverRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('trending')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'recent', label: 'Recent', icon: <Clock className="w-4 h-4" /> },
    { id: 'popular', label: 'Popular', icon: <Heart className="w-4 h-4" /> },
    { id: 'following', label: 'Following', icon: <Heart className="w-4 h-4" /> }
  ]

  const cuisineFilters = [
    'Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 
    'Indian', 'Thai', 'French', 'Japanese', 'Chinese'
  ]

  const difficultyFilters = ['Easy', 'Medium', 'Hard']
  const timeFilters = ['Under 15min', '15-30min', '30-60min', '60+ min']

  // Load discover recipes - now works for both authenticated and guest users
  const loadDiscoverRecipes = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('recipes')
        .select(`
          id, title, description, cook_time, difficulty, rating, cuisine, 
          creator_id, likes_count, comments_count, shares_count, created_at,
          profiles:creator_id (
            id, display_name, username, avatar_url, followers_count
          )
        `)

      // Apply category-based ordering
      switch (selectedCategory) {
        case 'trending':
          query = query.order('likes_count', { ascending: false })
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('rating', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query.limit(20)

      if (error) {
        logger.error('Error fetching discover recipes', error)
        return
      }

      // Transform data
      const transformedRecipes: DiscoverRecipe[] = (data || []).map((recipe: any) => {
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
          comments_count: recipe.comments_count || Math.floor(Math.random() * 50),
          shares_count: recipe.shares_count || Math.floor(Math.random() * 20),
          video_url: generateVideoUrl(recipe),
          image_url: generateImageUrl(recipe),
          created_at: recipe.created_at,
          creator: {
            id: profile.id || recipe.creator_id,
            display_name: profile.display_name || 'Anonymous Chef',
            username: profile.username || `chef${Math.random().toString(36).substr(2, 6)}`,
            avatar_url: profile.avatar_url,
            verified: Math.random() > 0.7,
            followers_count: profile.followers_count || Math.floor(Math.random() * 10000)
          },
          nutrition: estimateNutrition(recipe),
          isLiked: false,
          isBookmarked: false
        }
      })

      setRecipes(transformedRecipes)
    } catch (error) {
      logger.error('Discover load error', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate video/image URLs (same as feed)
  const generateVideoUrl = (recipe: any): string => {
    const videoIds = [
      'dQw4w9WgXcQ', 'ScMzIvxBSi4', 'fJ9rUzIMcZQ', 'SQoA_wjmE9w'
    ]
    const randomId = videoIds[Math.floor(Math.random() * videoIds.length)]
    return `https://www.youtube.com/embed/${randomId}?autoplay=1&mute=1&loop=1&controls=0`
  }

  const generateImageUrl = (recipe: any): string => {
    const imageBaseUrls = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
      'https://images.unsplash.com/photo-1555939594-58e22ba0c4d1'
    ]
    const randomImage = imageBaseUrls[Math.floor(Math.random() * imageBaseUrls.length)]
    return `${randomImage}?w=400&h=600&fit=crop`
  }

  const estimateNutrition = (recipe: any) => {
    const variation = 0.85 + (Math.random() * 0.3)
    return {
      calories: Math.round(350 * variation),
      protein: Math.round(18 * variation),
      fats: Math.round(14 * variation),
      carbs: Math.round(42 * variation)
    }
  }

  // Handle interactions
  const handleLike = (recipeId: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { 
            ...recipe, 
            isLiked: !recipe.isLiked,
            likes_count: recipe.isLiked ? recipe.likes_count - 1 : recipe.likes_count + 1
          }
        : recipe
    ))
  }

  const handleComment = (recipeId: string) => {
    logger.info('Comment clicked', { recipeId })
  }

  const handleShare = (recipeId: string) => {
    logger.info('Share clicked', { recipeId })
  }

  const handleBookmark = (recipeId: string) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, isBookmarked: !recipe.isBookmarked }
        : recipe
    ))
  }

  // Load recipes on category change
  useEffect(() => {
    loadDiscoverRecipes()
  }, [selectedCategory])

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="sticky top-16 md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes, creators, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category.icon}
              {category.label}
            </Button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">Cuisine</h4>
              <div className="flex gap-2 flex-wrap">
                {cuisineFilters.map((cuisine) => (
                  <Button
                    key={cuisine}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {cuisine}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">Difficulty</h4>
              <div className="flex gap-2">
                {difficultyFilters.map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">Cook Time</h4>
              <div className="flex gap-2">
                {timeFilters.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-0">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : recipes.length > 0 ? (
          recipes.map((recipe) => (
            <VideoRecipeCard
              key={recipe.id}
              recipe={recipe}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onBookmark={handleBookmark}
            />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No recipes found</p>
            <p className="text-sm text-gray-400 mt-2">Try different search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}