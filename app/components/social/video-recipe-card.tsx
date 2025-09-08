'use client'

import { useState, useRef, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause, Volume2, VolumeX, MoreHorizontal, Clock, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface VideoRecipeCardProps {
  recipe: {
    id: string
    title: string
    description: string
    cook_time: number
    difficulty: string
    video_url?: string
    image_url?: string
    creator: {
      id: string
      display_name: string
      username: string
      avatar_url?: string
      verified: boolean
      followers_count: number
    }
    likes_count: number
    comments_count: number
    shares_count: number
    nutrition: {
      calories: number
      protein: number
      fats: number
      carbs: number
    }
    isLiked: boolean
    isBookmarked: boolean
  }
  onLike: (recipeId: string) => void
  onComment: (recipeId: string) => void
  onShare: (recipeId: string) => void
  onBookmark: (recipeId: string) => void
  autoPlay?: boolean
}

export function VideoRecipeCard({
  recipe,
  onLike,
  onComment,
  onShare,
  onBookmark,
  autoPlay = false
}: VideoRecipeCardProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [showDescription, setShowDescription] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle video play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Auto-play when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && videoRef.current) {
            if (autoPlay) {
              videoRef.current.play()
              setIsPlaying(true)
            }
          } else if (videoRef.current && !entry.isIntersecting) {
            videoRef.current.pause()
            setIsPlaying(false)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [autoPlay])

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="relative w-full max-w-md mx-auto bg-white border-b border-gray-100">
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
        {recipe.video_url ? (
          <video
            ref={videoRef}
            src={recipe.video_url}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlayPause}
          />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center cursor-pointer flex items-center justify-center"
            style={{ backgroundImage: `url(${recipe.image_url})` }}
            onClick={togglePlayPause}
          >
            <div className="bg-black/30 rounded-full p-4">
              <Play className="w-12 h-12 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Video Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          {/* Creator Info & Recipe Details */}
          <div className="flex-1 min-w-0 pr-4">
            {/* Creator */}
            <Link href={`/creator/${recipe.creator.username}`} className="flex items-center gap-2 mb-2">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={recipe.creator.avatar_url} alt={recipe.creator.display_name} />
                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium">
                  {recipe.creator.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-white font-semibold text-sm">
                    @{recipe.creator.username}
                  </span>
                  {recipe.creator.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <span className="text-white/70 text-xs">
                  {formatCount(recipe.creator.followers_count)} followers
                </span>
              </div>
            </Link>

            {/* Recipe Title */}
            <h3 className="text-white font-bold text-lg mb-2 leading-tight">
              {recipe.title}
            </h3>

            {/* Recipe Stats */}
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.cook_time}min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.difficulty}</span>
              </div>
              <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {recipe.nutrition.calories} cal
              </div>
            </div>

            {/* Description (expandable) */}
            {showDescription && (
              <p className="text-white/90 text-sm mt-2 leading-relaxed">
                {recipe.description}
              </p>
            )}
            
            {recipe.description.length > 100 && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-white/70 text-sm mt-1 hover:text-white"
              >
                {showDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Video Control Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlayPause}
              className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-6">
          {/* Like */}
          <button
            onClick={() => onLike(recipe.id)}
            className="flex items-center gap-2 group"
          >
            <Heart 
              className={cn(
                "w-6 h-6 transition-all duration-200",
                recipe.isLiked 
                  ? "fill-red-500 text-red-500 scale-110" 
                  : "text-gray-700 group-hover:text-red-500 group-hover:scale-110"
              )} 
            />
            <span className={cn(
              "text-sm font-medium",
              recipe.isLiked ? "text-red-500" : "text-gray-600"
            )}>
              {formatCount(recipe.likes_count)}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => onComment(recipe.id)}
            className="flex items-center gap-2 group"
          >
            <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-200" />
            <span className="text-sm font-medium text-gray-600">
              {formatCount(recipe.comments_count)}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(recipe.id)}
            className="flex items-center gap-2 group"
          >
            <Share2 className="w-6 h-6 text-gray-700 group-hover:text-green-500 group-hover:scale-110 transition-all duration-200" />
            <span className="text-sm font-medium text-gray-600">
              {formatCount(recipe.shares_count)}
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={() => onBookmark(recipe.id)}
            className="p-2 group"
          >
            <Bookmark 
              className={cn(
                "w-5 h-5 transition-all duration-200",
                recipe.isBookmarked 
                  ? "fill-yellow-500 text-yellow-500" 
                  : "text-gray-600 group-hover:text-yellow-500"
              )} 
            />
          </button>

          {/* More Options */}
          <button className="p-2 group">
            <MoreHorizontal className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
      </div>
    </div>
  )
}