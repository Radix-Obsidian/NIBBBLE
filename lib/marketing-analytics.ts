/**
 * Marketing Analytics - Track conversion funnel events
 * Based on data-driven marketing approach from Alex Schultz (Meta)
 */

export interface MarketingEvent {
  event: string
  properties: Record<string, any>
  timestamp: number
  userId?: string
  sessionId?: string
}

export interface ConversionFunnelMetrics {
  // Guest browsing metrics
  guestViewsCount: number
  guestViewsPerSession: number
  viewsBeforeSignup: number
  
  // Conversion triggers
  signupTrigger: string
  conversionRate: number
  timeToConversion: number
  
  // Content engagement
  recipesViewed: number
  creatorsViewed: number
  engagementActions: string[]
  
  // User journey
  referralSource: string
  landingPage: string
  userAgent: string
}

class MarketingAnalytics {
  private sessionId: string
  private events: MarketingEvent[] = []
  
  constructor() {
    this.sessionId = this.generateSessionId()
    
    // Track initial session
    this.track('session_started', {
      referrer: typeof window !== 'undefined' ? document.referrer : '',
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    })
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Core tracking method
  track(event: string, properties: Record<string, any> = {}, userId?: string) {
    const marketingEvent: MarketingEvent = {
      event,
      properties: {
        ...properties,
        session_id: this.sessionId,
        timestamp: Date.now(),
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof document !== 'undefined' ? document.title : ''
      },
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId
    }

    this.events.push(marketingEvent)

    // Send to analytics platforms
    this.sendToGoogleAnalytics(marketingEvent)
    this.sendToVercelAnalytics(marketingEvent)
    this.logForDebug(marketingEvent)
  }

  // Guest browsing funnel events
  trackGuestView(recipeId: string, viewCount: number, maxViews: number) {
    this.track('guest_recipe_view', {
      recipe_id: recipeId,
      view_count: viewCount,
      max_views: maxViews,
      approaching_limit: viewCount >= maxViews - 2,
      conversion_stage: this.getConversionStage(viewCount, maxViews)
    })
  }

  trackGuestAction(action: string, recipeId?: string, creatorId?: string) {
    this.track('guest_action_attempt', {
      action_type: action,
      recipe_id: recipeId,
      creator_id: creatorId,
      conversion_trigger: true
    })
  }

  trackSignupPromptShown(trigger: string, context: Record<string, any> = {}) {
    this.track('signup_prompt_shown', {
      trigger_type: trigger,
      ...context,
      funnel_step: 'prompt_displayed'
    })
  }

  trackSignupPromptDismissed(trigger: string, method: 'close_button' | 'outside_click' | 'continue_browsing') {
    this.track('signup_prompt_dismissed', {
      trigger_type: trigger,
      dismissal_method: method,
      funnel_step: 'prompt_dismissed'
    })
  }

  trackSignupAttempt(trigger: string, method: 'email' | 'social' | 'google') {
    this.track('signup_attempt', {
      trigger_type: trigger,
      signup_method: method,
      funnel_step: 'signup_initiated'
    })
  }

  trackSignupSuccess(trigger: string, userId: string, timeToConversion: number) {
    this.track('signup_success', {
      trigger_type: trigger,
      user_id: userId,
      time_to_conversion_ms: timeToConversion,
      funnel_step: 'signup_completed',
      conversion_complete: true
    }, userId)
  }

  // Content engagement tracking
  trackContentEngagement(type: 'recipe_view' | 'creator_view' | 'video_play' | 'recipe_share', details: Record<string, any>) {
    this.track('content_engagement', {
      engagement_type: type,
      ...details
    })
  }

  // Conversion funnel analysis
  getConversionMetrics(): ConversionFunnelMetrics {
    const guestViews = this.events.filter(e => e.event === 'guest_recipe_view')
    const signupEvents = this.events.filter(e => e.event === 'signup_success')
    
    return {
      guestViewsCount: guestViews.length,
      guestViewsPerSession: guestViews.length,
      viewsBeforeSignup: guestViews.length,
      signupTrigger: signupEvents[0]?.properties.trigger_type || 'none',
      conversionRate: signupEvents.length > 0 ? 1 : 0,
      timeToConversion: signupEvents[0]?.properties.time_to_conversion_ms || 0,
      recipesViewed: new Set(guestViews.map(e => e.properties.recipe_id)).size,
      creatorsViewed: new Set(this.events.filter(e => e.event === 'content_engagement' && e.properties.engagement_type === 'creator_view').map(e => e.properties.creator_id)).size,
      engagementActions: this.events.filter(e => e.event === 'guest_action_attempt').map(e => e.properties.action_type),
      referralSource: this.events[0]?.properties.referrer || 'direct',
      landingPage: this.events[0]?.properties.landing_page || '/',
      userAgent: this.events[0]?.properties.user_agent || 'unknown'
    }
  }

  private getConversionStage(viewCount: number, maxViews: number): string {
    const percentage = viewCount / maxViews
    if (percentage < 0.4) return 'initial_browse'
    if (percentage < 0.8) return 'engaged_browse'
    if (percentage < 1.0) return 'approaching_limit'
    return 'limit_reached'
  }

  // Analytics platform integrations
  private sendToGoogleAnalytics(event: MarketingEvent) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, {
        ...event.properties,
        session_id: event.sessionId,
        user_id: event.userId,
        custom_map: {
          custom_session_id: 'session_id'
        }
      })
    }
  }

  private sendToVercelAnalytics(event: MarketingEvent) {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', event.event, event.properties)
    }
  }

  private logForDebug(event: MarketingEvent) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Marketing Event:', event.event, event.properties)
    }
  }

  // Batch reporting for performance analysis
  getSessionReport(): {
    sessionId: string
    totalEvents: number
    conversionMetrics: ConversionFunnelMetrics
    timeline: MarketingEvent[]
  } {
    return {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      conversionMetrics: this.getConversionMetrics(),
      timeline: this.events
    }
  }
}

// Singleton instance for global usage
let analyticsInstance: MarketingAnalytics | null = null

export function getMarketingAnalytics(): MarketingAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new MarketingAnalytics()
  }
  return analyticsInstance
}

// Convenience methods for common tracking
export const trackGuestBrowsing = {
  viewRecipe: (recipeId: string, viewCount: number, maxViews: number) => {
    getMarketingAnalytics().trackGuestView(recipeId, viewCount, maxViews)
  },
  
  attemptAction: (action: string, recipeId?: string, creatorId?: string) => {
    getMarketingAnalytics().trackGuestAction(action, recipeId, creatorId)
  },
  
  showSignupPrompt: (trigger: string, context?: Record<string, any>) => {
    getMarketingAnalytics().trackSignupPromptShown(trigger, context)
  },
  
  dismissSignupPrompt: (trigger: string, method: 'close_button' | 'outside_click' | 'continue_browsing') => {
    getMarketingAnalytics().trackSignupPromptDismissed(trigger, method)
  },
  
  attemptSignup: (trigger: string, method: 'email' | 'social' | 'google') => {
    getMarketingAnalytics().trackSignupAttempt(trigger, method)
  },
  
  completeSignup: (trigger: string, userId: string, timeToConversion: number) => {
    getMarketingAnalytics().trackSignupSuccess(trigger, userId, timeToConversion)
  }
}

// Conversion funnel constants for consistent tracking
export const ConversionTriggers = {
  RECIPE_VIEW_LIMIT: 'recipe_view_limit_reached',
  BOOKMARK_ATTEMPT: 'bookmark_attempt_guest', 
  LIKE_ATTEMPT: 'like_attempt_guest',
  COMMENT_ATTEMPT: 'comment_attempt_guest',
  SHARE_ATTEMPT: 'share_attempt_guest',
  FOLLOW_ATTEMPT: 'follow_attempt_guest',
  CONTENT_PREVIEW: 'content_preview'
} as const

export type ConversionTriggerType = typeof ConversionTriggers[keyof typeof ConversionTriggers]