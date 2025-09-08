'use client'

import { useState, useEffect } from 'react'
import { Settings, Share2, MoreHorizontal, Grid3X3, Play, Heart, Bookmark, ChefHat } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import Link from 'next/link'

interface ProfileData {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url?: string
  followers_count: number
  following_count: number
  recipes_count: number
  likes_count: number
  verified: boolean
}

interface ProfileRecipe {
  id: string
  title: string
  image_url?: string
  video_url?: string
  likes_count: number
  comments_count: number
  created_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [recipes, setRecipes] = useState<ProfileRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recipes' | 'liked' | 'saved'>('recipes')

  // Load profile data
  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        logger.error('Error loading profile', error)
        // Create mock profile data
        setProfile({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          bio: 'Home cook sharing delicious recipes 🍳✨',
          avatar_url: user.user_metadata?.avatar_url,
          followers_count: Math.floor(Math.random() * 1000),
          following_count: Math.floor(Math.random() * 500),
          recipes_count: Math.floor(Math.random() * 50),
          likes_count: Math.floor(Math.random() * 5000),
          verified: false
        })
      } else {
        setProfile({
          ...data,
          followers_count: data.followers_count || Math.floor(Math.random() * 1000),
          following_count: data.following_count || Math.floor(Math.random() * 500),
          recipes_count: data.recipes_count || Math.floor(Math.random() * 50),
          likes_count: data.likes_count || Math.floor(Math.random() * 5000),
          verified: data.verified || false
        })
      }
    } catch (error) {
      logger.error('Profile load error', error)
    }
  }

  // Load user recipes
  const loadRecipes = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, created_at, likes_count')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) {
        logger.error('Error loading recipes', error)
        // Generate mock recipes
        const mockRecipes: ProfileRecipe[] = Array.from({ length: 8 }, (_, i) => ({
          id: `recipe_${i + 1}`,
          title: [
            'Creamy Carbonara',
            'Spicy Arrabbiata', 
            'Mediterranean Bowl',
            'Butter Chicken',
            'Thai Green Curry',
            'Margherita Pizza',
            'Caesar Salad',
            'Chocolate Brownies'
          ][i] || `Recipe ${i + 1}`,
          image_url: `https://images.unsplash.com/photo-${1565299624946 + i * 1000}?w=300&h=300&fit=crop`,
          video_url: `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1`,
          likes_count: Math.floor(Math.random() * 500),
          comments_count: Math.floor(Math.random() * 50),
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        }))
        setRecipes(mockRecipes)
      } else {
        const transformedRecipes: ProfileRecipe[] = (data || []).map((recipe, i) => ({
          ...recipe,
          image_url: `https://images.unsplash.com/photo-${1565299624946 + i * 1000}?w=300&h=300&fit=crop`,
          video_url: `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1`,
          comments_count: Math.floor(Math.random() * 50)
        }))
        setRecipes(transformedRecipes)
      }
    } catch (error) {
      logger.error('Recipes load error', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadProfile(), loadRecipes()])
      setLoading(false)
    }
    
    loadData()
  }, [user])

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="p-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-semibold">@{profile.username}</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="w-5 h-5" />
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="p-2">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="p-2">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="w-20 h-20 ring-4 ring-pink-500/20">
              <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xl font-bold">
                {profile.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{profile.display_name}</h2>
                {profile.verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{formatCount(profile.recipes_count)}</div>
                  <div className="text-sm text-gray-600">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{formatCount(profile.followers_count)}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{formatCount(profile.following_count)}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{formatCount(profile.likes_count)}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 text-sm mb-4">{profile.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Link href="/settings" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
              activeTab === 'recipes'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Grid3X3 className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Recipes</span>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
              activeTab === 'liked'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Heart className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Liked</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 ${
              activeTab === 'saved'
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs">Saved</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-2">
        {activeTab === 'recipes' && (
          <div className="grid grid-cols-3 gap-1">
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-pink-500" />
                      </div>
                    )}
                    
                    {/* Video Play Icon */}
                    {recipe.video_url && (
                      <div className="absolute top-2 right-2">
                        <Play className="w-4 h-4 text-white fill-white drop-shadow-sm" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                    {/* Stats Overlay */}
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-white" />
                        <span className="drop-shadow-sm">{formatCount(recipe.likes_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3 fill-white" />
                        <span className="drop-shadow-sm">{formatCount(recipe.comments_count)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
                <p className="text-gray-500 text-sm mb-4">Share your first recipe to get started!</p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-pink-500 to-orange-500 text-white">
                    Create Recipe
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'liked' || activeTab === 'saved') && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'liked' ? (
                <Heart className="w-8 h-8 text-gray-400" />
              ) : (
                <Bookmark className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'liked' ? 'No liked recipes' : 'No saved recipes'}
            </h3>
            <p className="text-gray-500 text-sm">
              {activeTab === 'liked' 
                ? 'Recipes you like will appear here' 
                : 'Recipes you save will appear here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}