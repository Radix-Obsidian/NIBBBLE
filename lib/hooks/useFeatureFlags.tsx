// Feature Flag Hook for Easy Component Integration

import React, { useState, useEffect } from 'react'
import { FEATURES, FeatureFlag } from '@/lib/config/features'
import { useAuth } from '@/hooks/useAuth'
import { checkAlphaAccess } from '@/lib/services/alpha-user-management'

// Custom hook for feature flags
export function useFeatureFlags() {
  const { user } = useAuth()
  const [alphaAccess, setAlphaAccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // Check alpha access on user change
  useEffect(() => {
    const checkAccess = async () => {
      if (user && FEATURES.alphaMode) {
        setLoading(true)
        try {
          const { canAccess } = await checkAlphaAccess(user.email)
          setAlphaAccess(canAccess)
        } catch (error) {
          console.error('Failed to check alpha access:', error)
          setAlphaAccess(false)
        } finally {
          setLoading(false)
        }
      } else {
        setAlphaAccess(!FEATURES.alphaMode) // If not in alpha mode, grant access
        setLoading(false)
      }
    }
    
    checkAccess()
  }, [user])

  // Check if a feature is enabled
  const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return FEATURES[flag] as boolean
  }

  // Check if user has alpha access (for alpha-specific features)
  const hasAlphaAccess = (): boolean => {
    return !FEATURES.alphaMode || alphaAccess
  }

  // Combined check for alpha features
  const canUseAlphaFeature = (flag: FeatureFlag): boolean => {
    return isFeatureEnabled(flag) && hasAlphaAccess()
  }

  // Get current feature set based on alpha status
  const getEnabledFeatures = (): FeatureFlag[] => {
    return Object.keys(FEATURES).filter(key => 
      FEATURES[key as FeatureFlag] === true
    ) as FeatureFlag[]
  }

  return {
    // Basic feature checks
    isFeatureEnabled,
    hasAlphaAccess,
    canUseAlphaFeature,
    getEnabledFeatures,
    
    // Alpha-specific states
    alphaMode: FEATURES.alphaMode,
    alphaAccess,
    loading,
    
    // Common feature shortcuts
    ai: {
      recipeAdaptation: isFeatureEnabled('enableAIRecipeAdaptation'),
      cookingIntelligence: isFeatureEnabled('enableCookingIntelligence'),
      successPrediction: isFeatureEnabled('enableSuccessPrediction'),
      cookingAssistant: isFeatureEnabled('enableCookingAssistant'),
      personalProfile: isFeatureEnabled('enablePersonalCookingProfile')
    },
    
    social: {
      features: isFeatureEnabled('enableSocialFeatures'),
      sharing: isFeatureEnabled('enableSocialSharing'),
      following: isFeatureEnabled('enableFollowSystem'),
      reviews: isFeatureEnabled('enableReviews')
    },
    
    commerce: {
      enabled: isFeatureEnabled('enableCommerce'),
      shopping: isFeatureEnabled('enableShopping'),
      inventory: isFeatureEnabled('enableInventoryManagement'),
      collections: isFeatureEnabled('enableNibbleCollections')
    },
    
    creator: {
      economy: isFeatureEnabled('enableCreatorEconomy'),
      monetization: isFeatureEnabled('enableMonetization'),
      dashboard: isFeatureEnabled('enableCreatorDashboard')
    },
    
    analytics: {
      enabled: isFeatureEnabled('enableAnalytics'),
      errorTracking: isFeatureEnabled('enableErrorTracking'),
      performance: isFeatureEnabled('enablePerformanceMonitoring'),
      realTime: isFeatureEnabled('enableRealTimeMetrics')
    }
  }
}

// Component wrapper for feature gating
interface FeatureGateProps {
  feature: FeatureFlag
  fallback?: React.ReactNode
  children: React.ReactNode
  requiresAlpha?: boolean
}

export function FeatureGate({ 
  feature, 
  fallback = null, 
  children, 
  requiresAlpha = false 
}: FeatureGateProps) {
  const { isFeatureEnabled, canUseAlphaFeature } = useFeatureFlags()
  
  const shouldRender = requiresAlpha 
    ? canUseAlphaFeature(feature)
    : isFeatureEnabled(feature)
  
  return shouldRender ? <>{children}</> : <>{fallback}</>
}

// Higher-order component for feature gating
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: FeatureFlag,
  options: {
    requiresAlpha?: boolean
    fallback?: React.ComponentType<P> | React.ReactNode
  } = {}
) {
  const { requiresAlpha = false, fallback = null } = options
  
  return function FeatureGatedComponent(props: P) {
    const { isFeatureEnabled, canUseAlphaFeature } = useFeatureFlags()
    
    const shouldRender = requiresAlpha 
      ? canUseAlphaFeature(feature)
      : isFeatureEnabled(feature)
    
    if (!shouldRender) {
      if (typeof fallback === 'function') {
        const FallbackComponent = fallback as React.ComponentType<P>
        return <FallbackComponent {...props} />
      }
      return fallback as React.ReactElement
    }
    
    return <WrappedComponent {...props} />
  }
}

// Alpha access loading component
export function AlphaAccessCheck({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const { loading, hasAlphaAccess, alphaMode } = useFeatureFlags()
  
  if (loading && alphaMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }
  
  if (alphaMode && !hasAlphaAccess()) {
    return fallback || (
      <div className="text-center p-8 bg-purple-50 rounded-lg">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="text-lg font-semibold text-purple-900 mb-2">
          Alpha Access Required
        </h3>
        <p className="text-purple-700 mb-4">
          This feature is currently in alpha testing. You need an alpha invite to access it.
        </p>
        <button
          onClick={() => window.open('/waitlist', '_blank')}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Join Waitlist
        </button>
      </div>
    )
  }
  
  return <>{children}</>
}