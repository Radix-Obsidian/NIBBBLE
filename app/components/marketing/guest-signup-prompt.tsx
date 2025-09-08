'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Heart, Bookmark, MessageCircle, Share, Users, ChefHat, Sparkles } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useGuestBrowsing, ConversionTrigger, ConversionTriggers } from '@/hooks/useGuestBrowsing'
import { logger } from '@/lib/logger'
import { trackGuestBrowsing } from '@/lib/marketing-analytics'

interface GuestSignupPromptProps {
  trigger: ConversionTrigger
  recipeName?: string
  creatorName?: string
  onClose?: () => void
}

export function GuestSignupPrompt({ 
  trigger, 
  recipeName, 
  creatorName,
  onClose 
}: GuestSignupPromptProps) {
  const router = useRouter()
  const { viewCount, maxViews, setShowSignupPrompt } = useGuestBrowsing()
  const [isVisible, setIsVisible] = useState(true)
  const [animationClass, setAnimationClass] = useState('animate-slide-up')

  // Track when prompt is shown
  useEffect(() => {
    trackGuestBrowsing.showSignupPrompt(trigger, {
      recipe_name: recipeName,
      creator_name: creatorName,
      view_count: viewCount
    })
  }, [trigger, recipeName, creatorName, viewCount])

  // Marketing copy based on conversion trigger
  const getPromptContent = () => {
    switch (trigger) {
      case ConversionTriggers.RECIPE_VIEW_LIMIT:
        return {
          icon: <ChefHat className="w-8 h-8 text-orange-500" />,
          title: "Ready to cook?",
          subtitle: `You've viewed ${viewCount} recipes! Join NIBBBLE to save favorites, follow creators, and access our full recipe collection.`,
          primaryCTA: "Join NIBBBLE - It's Free",
          secondaryCTA: "Maybe Later",
          benefits: [
            "Save and organize recipes",
            "Follow your favorite creators", 
            "Get personalized recommendations",
            "Access exclusive content"
          ]
        }
      
      case ConversionTriggers.BOOKMARK_ATTEMPT:
        return {
          icon: <Bookmark className="w-8 h-8 text-pink-500" />,
          title: `Save "${recipeName}"?`,
          subtitle: "Join NIBBBLE to bookmark recipes and build your personal collection.",
          primaryCTA: "Sign Up to Save",
          secondaryCTA: "Continue Browsing",
          benefits: [
            "Save unlimited recipes",
            "Organize into collections",
            "Access from any device",
            "Share with friends"
          ]
        }

      case ConversionTriggers.LIKE_ATTEMPT:
        return {
          icon: <Heart className="w-8 h-8 text-red-500" />,
          title: "Love this recipe?",
          subtitle: `Join NIBBBLE to like recipes and support creators like ${creatorName}.`,
          primaryCTA: "Sign Up to Like",
          secondaryCTA: "Keep Browsing",
          benefits: [
            "Support your favorite creators",
            "Get personalized recommendations", 
            "Join the cooking community",
            "Discover similar recipes"
          ]
        }

      case ConversionTriggers.COMMENT_ATTEMPT:
        return {
          icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
          title: "Join the conversation",
          subtitle: "Share your cooking tips and questions with the NIBBBLE community.",
          primaryCTA: "Sign Up to Comment",
          secondaryCTA: "Continue Browsing",
          benefits: [
            "Ask questions to creators",
            "Share cooking tips",
            "Get recipe variations",
            "Connect with food lovers"
          ]
        }

      case ConversionTriggers.FOLLOW_ATTEMPT:
        return {
          icon: <Users className="w-8 h-8 text-purple-500" />,
          title: `Follow ${creatorName}?`,
          subtitle: "Stay updated with their latest recipes and cooking tips.",
          primaryCTA: "Sign Up to Follow",
          secondaryCTA: "Maybe Later",
          benefits: [
            "Never miss new recipes",
            "Get creator updates",
            "Build your feed",
            "Support creators you love"
          ]
        }

      default:
        return {
          icon: <Sparkles className="w-8 h-8 text-orange-500" />,
          title: "Join NIBBBLE",
          subtitle: "Unlock the full cooking experience with personalized recipes and community features.",
          primaryCTA: "Get Started - Free",
          secondaryCTA: "Continue Browsing",
          benefits: [
            "Personalized recipe feed",
            "Save and organize recipes",
            "Follow favorite creators",
            "Join cooking community"
          ]
        }
    }
  }

  const content = getPromptContent()

  const handleSignup = () => {
    logger.info('Guest signup triggered', { 
      trigger,
      viewCount,
      recipeName,
      creatorName 
    })

    // Track conversion event with marketing analytics
    trackGuestBrowsing.attemptSignup(trigger, 'email')

    // Navigate to simplified signup
    router.push(`/signin?trigger=${trigger}&from=${encodeURIComponent(window.location.pathname)}`)
  }

  const handleClose = () => {
    setAnimationClass('animate-slide-down')
    setTimeout(() => {
      setIsVisible(false)
      setShowSignupPrompt(false)
      onClose?.()
    }, 300)

    // Track dismissal with marketing analytics
    trackGuestBrowsing.dismissSignupPrompt(trigger, 'close_button')
    logger.info('Guest signup prompt closed', { trigger, viewCount })
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className={`bg-white rounded-2xl sm:rounded-3xl w-full max-w-md mx-auto shadow-2xl ${animationClass}`}>
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              {content.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {content.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">What you'll get:</h4>
            <div className="space-y-2">
              {content.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <Button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
          >
            {content.primaryCTA}
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full text-gray-600 font-medium py-3"
          >
            {content.secondaryCTA}
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Free Forever</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>No Credit Card</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>94% Success Rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}