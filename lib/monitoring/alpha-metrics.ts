// Alpha Launch Metrics & Monitoring System

import { supabase } from '@/lib/database/supabase'
import { logger } from '@/lib/logger'
import { FEATURES } from '@/lib/config/features'

// Core Alpha Metrics Types
export interface AlphaMetrics {
  // User Engagement
  totalAlphaUsers: number
  activeUsers: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  userRetention: {
    day1: number
    day7: number
    day14: number
  }
  
  // Cooking Session Metrics
  cookingSessions: {
    total: number
    completed: number
    abandoned: number
    averageDuration: number
  }
  
  // AI Features Usage
  aiFeatureUsage: {
    recipeAdaptations: number
    cookingAssistantSessions: number
    successPredictions: number
    adaptationAcceptanceRate: number
  }
  
  // Success Rates (Primary KPI)
  cookingSuccessRate: number
  averageUserRating: number
  issuesPerSession: number
  
  // Performance Metrics
  performance: {
    averagePageLoad: number
    averageAiResponseTime: number
    errorRate: number
    uptime: number
  }
  
  // Business Metrics
  conversionMetrics: {
    waitlistToAlpha: number
    recipeCompletionRate: number
    averageRecipesPerUser: number
  }
}

export interface CookingSessionMetrics {
  id: string
  userId: string
  recipeId: string
  adaptationId?: string
  startTime: Date
  endTime?: Date
  duration?: number // minutes
  status: 'preparing' | 'cooking' | 'completed' | 'abandoned'
  successRating?: number // 1-5
  difficultyRating?: number // 1-5
  aiGuidanceUsed: boolean
  adaptationsUsed: string[]
  issuesEncountered: string[]
  stepsCompleted: number
  totalSteps: number
  userNotes?: string
  sessionData: any // Detailed step-by-step data
}

export interface UserJourneyMetrics {
  userId: string
  signupDate: Date
  firstCookingSession?: Date
  totalSessions: number
  successfulSessions: number
  averageRating: number
  skillProgressions: number
  featuresUsed: string[]
  lastActiveDate: Date
  retentionStatus: 'active' | 'at_risk' | 'churned'
}

// Alpha Metrics Service
class AlphaMetricsService {
  private metricsCache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Track cooking session start
  async startCookingSession(data: {
    userId: string
    recipeId: string
    adaptationId?: string
    aiGuidanceEnabled: boolean
  }): Promise<string> {
    try {
      const sessionData: Partial<CookingSessionMetrics> = {
        userId: data.userId,
        recipeId: data.recipeId,
        adaptationId: data.adaptationId,
        startTime: new Date(),
        status: 'preparing',
        aiGuidanceUsed: data.aiGuidanceEnabled,
        adaptationsUsed: [],
        issuesEncountered: [],
        stepsCompleted: 0
      }

      const { data: session, error } = await supabase
        .from('cooking_sessions')
        .insert(sessionData)
        .select('id')
        .single()

      if (error) throw error

      // Track real-time metric
      await this.incrementMetric('cooking_sessions_started')
      
      return session.id
    } catch (error) {
      logger.error('Failed to start cooking session tracking:', error)
      throw error
    }
  }

  // Update cooking session progress
  async updateCookingSession(
    sessionId: string, 
    updates: Partial<CookingSessionMetrics>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('cooking_sessions')
        .update({
          ...updates,
          updatedAt: new Date()
        })
        .eq('id', sessionId)

      if (error) throw error

      // Update real-time metrics based on status
      if (updates.status === 'completed') {
        await this.incrementMetric('cooking_sessions_completed')
        if (updates.successRating && updates.successRating >= 4) {
          await this.incrementMetric('successful_cooking_sessions')
        }
      } else if (updates.status === 'abandoned') {
        await this.incrementMetric('cooking_sessions_abandoned')
      }
    } catch (error) {
      logger.error('Failed to update cooking session:', error)
      throw error
    }
  }

  // Track AI feature usage
  async trackAIFeatureUsage(data: {
    userId: string
    feature: 'recipe_adaptation' | 'success_prediction' | 'cooking_assistant' | 'smart_search'
    recipeId?: string
    sessionId?: string
    metadata?: any
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_feature_usage')
        .insert({
          userId: data.userId,
          feature: data.feature,
          recipeId: data.recipeId,
          sessionId: data.sessionId,
          metadata: data.metadata,
          timestamp: new Date()
        })

      if (error) throw error

      await this.incrementMetric(`ai_feature_${data.feature}`)
    } catch (error) {
      logger.error('Failed to track AI feature usage:', error)
    }
  }

  // Track user journey events
  async trackUserJourneyEvent(data: {
    userId: string
    event: 'signup' | 'first_recipe_view' | 'first_cooking_session' | 'first_success' | 'skill_progression' | 'feature_discovery'
    metadata?: any
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_journey_events')
        .insert({
          userId: data.userId,
          event: data.event,
          metadata: data.metadata,
          timestamp: new Date()
        })

      if (error) throw error

      // Update user journey metrics
      await this.updateUserJourneyMetrics(data.userId)
    } catch (error) {
      logger.error('Failed to track user journey event:', error)
    }
  }

  // Get real-time alpha metrics
  async getAlphaMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<AlphaMetrics> {
    const cacheKey = `alpha_metrics_${timeRange}`
    const cached = this.metricsCache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      return cached.data
    }

    try {
      const timeFilter = this.getTimeFilter(timeRange)
      
      // Parallel metric queries for performance
      const [
        userMetrics,
        sessionMetrics,
        aiUsageMetrics,
        successMetrics,
        performanceMetrics
      ] = await Promise.all([
        this.getUserMetrics(timeFilter),
        this.getSessionMetrics(timeFilter),
        this.getAIUsageMetrics(timeFilter),
        this.getSuccessMetrics(timeFilter),
        this.getPerformanceMetrics(timeFilter)
      ])

      const metrics: AlphaMetrics = {
        totalAlphaUsers: userMetrics.totalUsers,
        activeUsers: userMetrics.activeUsers,
        dailyActiveUsers: userMetrics.dailyActive,
        weeklyActiveUsers: userMetrics.weeklyActive,
        userRetention: userMetrics.retention,
        
        cookingSessions: sessionMetrics,
        aiFeatureUsage: aiUsageMetrics,
        
        cookingSuccessRate: successMetrics.successRate,
        averageUserRating: successMetrics.averageRating,
        issuesPerSession: successMetrics.averageIssues,
        
        performance: performanceMetrics,
        
        conversionMetrics: {
          waitlistToAlpha: userMetrics.conversionRate,
          recipeCompletionRate: sessionMetrics.completed / sessionMetrics.total,
          averageRecipesPerUser: sessionMetrics.total / userMetrics.totalUsers
        }
      }

      // Cache the results
      this.metricsCache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now()
      })

      return metrics
    } catch (error) {
      logger.error('Failed to get alpha metrics:', error)
      throw error
    }
  }

  // Get critical alerts for real-time monitoring
  async getCriticalAlerts(): Promise<{
    alerts: Array<{
      type: 'performance' | 'success_rate' | 'error_rate' | 'user_feedback'
      severity: 'low' | 'medium' | 'high' | 'critical'
      message: string
      value: number
      threshold: number
      timestamp: Date
    }>
  }> {
    try {
      const alerts = []
      const metrics = await this.getAlphaMetrics('1h')

      // Success rate alert
      if (metrics.cookingSuccessRate < 0.75) {
        alerts.push({
          type: 'success_rate' as const,
          severity: metrics.cookingSuccessRate < 0.50 ? 'critical' as const : 'high' as const,
          message: `Cooking success rate dropped to ${(metrics.cookingSuccessRate * 100).toFixed(1)}%`,
          value: metrics.cookingSuccessRate,
          threshold: 0.75,
          timestamp: new Date()
        })
      }

      // Performance alert
      if (metrics.performance.averageAiResponseTime > 500) {
        alerts.push({
          type: 'performance' as const,
          severity: metrics.performance.averageAiResponseTime > 1000 ? 'high' as const : 'medium' as const,
          message: `AI response time increased to ${metrics.performance.averageAiResponseTime}ms`,
          value: metrics.performance.averageAiResponseTime,
          threshold: 500,
          timestamp: new Date()
        })
      }

      // Error rate alert
      if (metrics.performance.errorRate > 0.01) {
        alerts.push({
          type: 'error_rate' as const,
          severity: metrics.performance.errorRate > 0.05 ? 'critical' as const : 'high' as const,
          message: `Error rate increased to ${(metrics.performance.errorRate * 100).toFixed(2)}%`,
          value: metrics.performance.errorRate,
          threshold: 0.01,
          timestamp: new Date()
        })
      }

      // Low user rating alert
      if (metrics.averageUserRating < 4.0) {
        alerts.push({
          type: 'user_feedback' as const,
          severity: metrics.averageUserRating < 3.0 ? 'critical' as const : 'medium' as const,
          message: `Average user rating dropped to ${metrics.averageUserRating.toFixed(1)}`,
          value: metrics.averageUserRating,
          threshold: 4.0,
          timestamp: new Date()
        })
      }

      return { alerts }
    } catch (error) {
      logger.error('Failed to get critical alerts:', error)
      return { alerts: [] }
    }
  }

  // Internal helper methods
  private async getUserMetrics(timeFilter: string) {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, created_at, last_sign_in_at')
      .eq('is_alpha_user', true)
      .gte('created_at', timeFilter)

    if (error) throw error

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => new Date(u.last_sign_in_at) > oneDayAgo).length,
      dailyActive: users.filter(u => new Date(u.last_sign_in_at) > oneDayAgo).length,
      weeklyActive: users.filter(u => new Date(u.last_sign_in_at) > sevenDaysAgo).length,
      retention: {
        day1: 0.85, // Placeholder - calculate from actual retention data
        day7: 0.70,
        day14: 0.60
      },
      conversionRate: 0.75 // Placeholder - calculate from waitlist data
    }
  }

  private async getSessionMetrics(timeFilter: string) {
    const { data: sessions, error } = await supabase
      .from('cooking_sessions')
      .select('*')
      .gte('start_time', timeFilter)

    if (error) throw error

    return {
      total: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      abandoned: sessions.filter(s => s.status === 'abandoned').length,
      averageDuration: sessions
        .filter(s => s.duration)
        .reduce((acc, s) => acc + s.duration, 0) / sessions.filter(s => s.duration).length || 0
    }
  }

  private async getAIUsageMetrics(timeFilter: string) {
    const { data: usage, error } = await supabase
      .from('ai_feature_usage')
      .select('feature')
      .gte('timestamp', timeFilter)

    if (error) throw error

    return {
      recipeAdaptations: usage.filter(u => u.feature === 'recipe_adaptation').length,
      cookingAssistantSessions: usage.filter(u => u.feature === 'cooking_assistant').length,
      successPredictions: usage.filter(u => u.feature === 'success_prediction').length,
      adaptationAcceptanceRate: 0.85 // Placeholder - calculate from actual data
    }
  }

  private async getSuccessMetrics(timeFilter: string) {
    const { data: sessions, error } = await supabase
      .from('cooking_sessions')
      .select('success_rating, issues_encountered')
      .gte('start_time', timeFilter)
      .not('success_rating', 'is', null)

    if (error) throw error

    const successfulSessions = sessions.filter(s => s.success_rating >= 4).length
    const totalRated = sessions.length
    const averageRating = sessions.reduce((acc, s) => acc + s.success_rating, 0) / totalRated || 0
    const averageIssues = sessions.reduce((acc, s) => acc + (s.issues_encountered?.length || 0), 0) / sessions.length || 0

    return {
      successRate: successfulSessions / totalRated || 0,
      averageRating,
      averageIssues
    }
  }

  private async getPerformanceMetrics(timeFilter: string) {
    // This would integrate with your performance monitoring service
    return {
      averagePageLoad: 1200, // ms
      averageAiResponseTime: 350, // ms
      errorRate: 0.005, // 0.5%
      uptime: 0.999 // 99.9%
    }
  }

  private getTimeFilter(range: string): string {
    const now = new Date()
    switch (range) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    }
  }

  private async incrementMetric(metric: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('real_time_metrics')
        .upsert({
          metric_name: metric,
          count: 1,
          timestamp: new Date()
        }, { onConflict: 'metric_name,date_bucket' })

      if (error) throw error
    } catch (error) {
      logger.error(`Failed to increment metric ${metric}:`, error)
    }
  }

  private async updateUserJourneyMetrics(userId: string): Promise<void> {
    // Implementation for updating user journey aggregate metrics
    // This would calculate retention, progression, feature adoption, etc.
  }
}

// Export singleton instance
export const alphaMetrics = new AlphaMetricsService()

// Utility functions for easy metric tracking
export const trackCookingSuccess = (sessionId: string, rating: number, issues: string[]) => {
  return alphaMetrics.updateCookingSession(sessionId, {
    status: 'completed',
    successRating: rating,
    issuesEncountered: issues,
    endTime: new Date()
  })
}

export const trackAIAdaptation = (userId: string, recipeId: string, adaptationAccepted: boolean) => {
  return alphaMetrics.trackAIFeatureUsage({
    userId,
    feature: 'recipe_adaptation',
    recipeId,
    metadata: { accepted: adaptationAccepted }
  })
}

export const trackUserOnboarding = (userId: string, step: string) => {
  return alphaMetrics.trackUserJourneyEvent({
    userId,
    event: 'feature_discovery',
    metadata: { onboarding_step: step }
  })
}