'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Creator {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  hasStory: boolean
  isLive?: boolean
  storyCount?: number
}

// Mock creator data for stories
const mockCreators: Creator[] = [
  {
    id: 'your-story',
    username: 'your_story',
    display_name: 'Your Story',
    hasStory: false,
    storyCount: 0
  },
  {
    id: '1',
    username: 'chef_marco',
    display_name: 'Chef Marco',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    hasStory: true,
    isLive: true,
    storyCount: 3
  },
  {
    id: '2',
    username: 'pasta_queen',
    display_name: 'Pasta Queen',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    hasStory: true,
    storyCount: 5
  },
  {
    id: '3',
    username: 'baking_betty',
    display_name: 'Baking Betty',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    hasStory: true,
    storyCount: 2
  },
  {
    id: '4',
    username: 'vegan_vibes',
    display_name: 'Vegan Vibes',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    hasStory: true,
    storyCount: 4
  },
  {
    id: '5',
    username: 'spice_master',
    display_name: 'Spice Master',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    hasStory: true,
    storyCount: 1
  },
  {
    id: '6',
    username: 'dessert_dreams',
    display_name: 'Dessert Dreams',
    avatar_url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face',
    hasStory: true,
    storyCount: 6
  }
]

export function CreatorStoryBar() {
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const handleStoryClick = (creatorId: string) => {
    if (creatorId === 'your-story') {
      // Handle adding new story
      console.log('Add new story')
    } else {
      setSelectedStory(creatorId)
      // Open story viewer modal
      console.log('Open story for creator:', creatorId)
    }
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 p-0 bg-white/80 hover:bg-white/90 shadow-md rounded-full"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 p-0 bg-white/80 hover:bg-white/90 shadow-md rounded-full"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Stories Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 px-2 py-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mockCreators.map((creator) => (
          <div
            key={creator.id}
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
            onClick={() => handleStoryClick(creator.id)}
          >
            {/* Avatar with Story Ring */}
            <div className="relative">
              {/* Story Ring */}
              {creator.hasStory && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full p-0.5 bg-gradient-to-tr",
                    creator.isLive 
                      ? "from-red-500 to-red-600" 
                      : "from-pink-500 via-purple-500 to-orange-500"
                  )}
                >
                  <div className="bg-white rounded-full p-0.5">
                    <div className="w-14 h-14 rounded-full bg-gray-100" />
                  </div>
                </div>
              )}

              {/* Avatar */}
              <Avatar 
                className={cn(
                  "relative transition-transform duration-200 group-hover:scale-105",
                  creator.hasStory ? "w-16 h-16" : "w-14 h-14",
                  creator.id === 'your-story' && "border-2 border-gray-300 border-dashed"
                )}
              >
                <AvatarImage src={creator.avatar_url} alt={creator.display_name} />
                <AvatarFallback 
                  className={cn(
                    "font-medium text-sm",
                    creator.id === 'your-story' 
                      ? "bg-gray-100 text-gray-600" 
                      : "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                  )}
                >
                  {creator.id === 'your-story' ? (
                    <Plus className="w-6 h-6" />
                  ) : (
                    creator.display_name.charAt(0)
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Live Indicator */}
              {creator.isLive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  LIVE
                </div>
              )}

              {/* Story Count Indicator */}
              {creator.hasStory && creator.storyCount && creator.storyCount > 1 && !creator.isLive && (
                <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {creator.storyCount}
                </div>
              )}
            </div>

            {/* Username */}
            <span 
              className={cn(
                "text-xs font-medium text-center leading-tight max-w-[70px] truncate",
                creator.id === 'your-story' ? "text-gray-600" : "text-gray-800"
              )}
            >
              {creator.id === 'your-story' ? 'Your Story' : creator.username}
            </span>
          </div>
        ))}
      </div>

      {/* Add scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}