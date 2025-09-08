'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './useAuth'
import { logger } from '@/lib/logger'
import { trackGuestBrowsing } from '@/lib/marketing-analytics'

interface GuestBrowsingState {
  viewCount: number
  maxViews: number
  isGuestUser: boolean
  hasReachedLimit: boolean
  canView: boolean
  trackView: () => void
  resetViewCount: () => void
  showSignupPrompt: boolean
  setShowSignupPrompt: (show: boolean) => void
}

const GuestBrowsingContext = createContext<GuestBrowsingState | undefined>(undefined)

interface GuestBrowsingProviderProps {
  children: ReactNode
  maxViews?: number
}

export function GuestBrowsingProvider({ 
  children, 
  maxViews = 5 
}: GuestBrowsingProviderProps) {
  const { user } = useAuth()
  const [viewCount, setViewCount] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  
  const isGuestUser = !user
  const hasReachedLimit = viewCount >= maxViews
  const canView = !isGuestUser || !hasReachedLimit

  // Load view count from localStorage for guests
  useEffect(() => {
    if (isGuestUser) {
      const savedCount = localStorage.getItem('nibbble_guest_views')
      if (savedCount) {
        const count = parseInt(savedCount, 10)
        setViewCount(count)
        
        // Show signup prompt if approaching limit
        if (count >= maxViews - 1) {
          setShowSignupPrompt(true)
        }
      }
    } else {
      // Reset for authenticated users
      setViewCount(0)
      setShowSignupPrompt(false)
    }
  }, [isGuestUser, maxViews])

  const trackView = () => {
    if (isGuestUser && !hasReachedLimit) {
      const newCount = viewCount + 1
      setViewCount(newCount)
      localStorage.setItem('nibbble_guest_views', newCount.toString())
      
      logger.info('Guest view tracked', { 
        viewCount: newCount, 
        maxViews, 
        approaching_limit: newCount >= maxViews - 2 
      })

      // Show signup prompt when approaching limit
      if (newCount >= maxViews - 2) {
        setShowSignupPrompt(true)
      }

      // Track conversion funnel metrics
      trackGuestBrowsing.viewRecipe('current_recipe', newCount, maxViews)
    }
  }

  const resetViewCount = () => {
    setViewCount(0)
    localStorage.removeItem('nibbble_guest_views')
    setShowSignupPrompt(false)
  }

  const value: GuestBrowsingState = {
    viewCount,
    maxViews,
    isGuestUser,
    hasReachedLimit,
    canView,
    trackView,
    resetViewCount,
    showSignupPrompt,
    setShowSignupPrompt
  }

  return (
    <GuestBrowsingContext.Provider value={value}>
      {children}
    </GuestBrowsingContext.Provider>
  )
}

export function useGuestBrowsing() {
  const context = useContext(GuestBrowsingContext)
  if (context === undefined) {
    throw new Error('useGuestBrowsing must be used within a GuestBrowsingProvider')
  }
  return context
}

// Marketing conversion triggers
export const ConversionTriggers = {
  RECIPE_VIEW_LIMIT: 'recipe_view_limit_reached',
  BOOKMARK_ATTEMPT: 'bookmark_attempt_guest',
  COMMENT_ATTEMPT: 'comment_attempt_guest',
  SHARE_ATTEMPT: 'share_attempt_guest',
  FOLLOW_ATTEMPT: 'follow_attempt_guest',
  LIKE_ATTEMPT: 'like_attempt_guest'
} as const

export type ConversionTrigger = typeof ConversionTriggers[keyof typeof ConversionTriggers]