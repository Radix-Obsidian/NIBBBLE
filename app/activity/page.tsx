'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, UserPlus, Share2, Bookmark, ChefHat } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'like' | 'comment' | 'follow' | 'share' | 'bookmark' | 'recipe_created'
  actor: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    verified?: boolean
  }
  target?: {
    id: string
    type: 'recipe' | 'comment'
    title?: string
    image_url?: string
  }
  message: string
  created_at: string
  isRead: boolean
}

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'like',
    actor: {
      id: '1',
      username: 'chef_marco',
      display_name: 'Chef Marco',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    target: {
      id: 'recipe_1',
      type: 'recipe',
      title: 'Creamy Carbonara',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop'
    },
    message: 'liked your recipe',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    isRead: false
  },
  {
    id: '2',
    type: 'comment',
    actor: {
      id: '2',
      username: 'pasta_queen',
      display_name: 'Pasta Queen',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    target: {
      id: 'recipe_2',
      type: 'recipe',
      title: 'Spicy Arrabbiata',
      image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100&h=100&fit=crop'
    },
    message: 'commented on your recipe: "This looks amazing! What brand of pasta do you recommend?"',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false
  },
  {
    id: '3',
    type: 'follow',
    actor: {
      id: '3',
      username: 'baking_betty',
      display_name: 'Baking Betty',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    message: 'started following you',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: true
  },
  {
    id: '4',
    type: 'share',
    actor: {
      id: '4',
      username: 'vegan_vibes',
      display_name: 'Vegan Vibes',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    target: {
      id: 'recipe_3',
      type: 'recipe',
      title: 'Mediterranean Bowl',
      image_url: 'https://images.unsplash.com/photo-1555939594-58e22ba0c4d1?w=100&h=100&fit=crop'
    },
    message: 'shared your recipe',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    isRead: true
  },
  {
    id: '5',
    type: 'recipe_created',
    actor: {
      id: '5',
      username: 'spice_master',
      display_name: 'Spice Master',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      verified: true
    },
    target: {
      id: 'recipe_4',
      type: 'recipe',
      title: 'Butter Chicken',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop'
    },
    message: 'posted a new recipe',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    isRead: true
  }
]

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setActivities(mockActivities)
      setLoading(false)
    }, 1000)
  }, [])

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconClass = "w-5 h-5"
    
    switch (type) {
      case 'like':
        return <Heart className={`${iconClass} text-red-500 fill-red-500`} />
      case 'comment':
        return <MessageCircle className={`${iconClass} text-blue-500`} />
      case 'follow':
        return <UserPlus className={`${iconClass} text-green-500`} />
      case 'share':
        return <Share2 className={`${iconClass} text-purple-500`} />
      case 'bookmark':
        return <Bookmark className={`${iconClass} text-yellow-500`} />
      case 'recipe_created':
        return <ChefHat className={`${iconClass} text-orange-500`} />
      default:
        return <Heart className={`${iconClass} text-gray-500`} />
    }
  }

  const markAsRead = (activityId: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, isRead: true }
          : activity
      )
    )
  }

  const markAllAsRead = () => {
    setActivities(prev => 
      prev.map(activity => ({ ...activity, isRead: true }))
    )
  }

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || !activity.isRead
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-600 mt-4">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-16 md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Activity</h1>
          
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                  filter === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                  filter === 'unread' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600'
                }`}
              >
                Unread
              </button>
            </div>

            {/* Mark All as Read */}
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-pink-600 hover:text-pink-700"
            >
              Mark all read
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="divide-y divide-gray-100">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !activity.isRead ? 'bg-pink-50/50' : ''
              }`}
              onClick={() => !activity.isRead && markAsRead(activity.id)}
            >
              <div className="flex items-start gap-3">
                {/* Actor Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.actor.avatar_url} alt={activity.actor.display_name} />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium text-sm">
                      {activity.actor.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Activity Type Icon */}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {activity.actor.display_name}
                    </span>
                    {activity.actor.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {!activity.isRead && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-2">
                    {activity.message}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Target Preview */}
                {activity.target && (
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {activity.target.image_url ? (
                        <img
                          src={activity.target.image_url}
                          alt={activity.target.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                          <ChefHat className="w-6 h-6 text-pink-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "When people interact with your recipes, you'll see it here."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}