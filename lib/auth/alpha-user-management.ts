// Alpha User Management System

import { supabase } from '@/lib/database/supabase'
import { logger } from '@/lib/logger'
import { FEATURES } from '@/lib/config/features'
import { alphaMetrics } from '@/lib/monitoring/alpha-metrics'

// Alpha User Types
export interface AlphaUser {
  id: string
  email: string
  inviteCode: string
  invitedBy?: string
  invitedAt: Date
  activatedAt?: Date
  status: 'pending' | 'active' | 'paused' | 'churned'
  
  // Onboarding Progress
  onboardingProgress: {
    profileSetup: boolean
    cookingAssessment: boolean
    firstRecipeView: boolean
    firstCookingSession: boolean
    feedbackProvided: boolean
  }
  onboardingCompletedAt?: Date
  
  // Alpha-specific data
  cohort: string // 'alpha-1', 'alpha-2', etc.
  priorityLevel: 'high' | 'medium' | 'low'
  feedbackContribution: number // Score based on feedback quality
  successMetrics: {
    totalSessions: number
    successfulSessions: number
    averageRating: number
    retentionDays: number
  }
  
  // Waitlist information
  waitlistPosition?: number
  waitlistJoinedAt?: Date
  waitlistSource: string
  
  metadata: {
    referralSource?: string
    cookingBackground?: string
    primaryUseCase?: string
    devicePreference?: string
    timezone?: string
  }
}

export interface AlphaInvite {
  id: string
  email: string
  inviteCode: string
  invitedBy: string
  status: 'sent' | 'opened' | 'activated' | 'expired'
  expiresAt: Date
  sentAt: Date
  openedAt?: Date
  activatedAt?: Date
  remindersSent: number
}

export interface AlphaOnboarding {
  userId: string
  currentStep: number
  totalSteps: number
  stepData: {
    [step: number]: {
      completed: boolean
      completedAt?: Date
      data?: any
      timeSpent?: number // seconds
    }
  }
  personalizedRecommendations: string[]
  assignedMentor?: string
  createdAt: Date
  updatedAt: Date
}

// Alpha User Management Service
class AlphaUserManagementService {
  private readonly MAX_ALPHA_USERS = FEATURES.alphaUserLimit
  
  // Check if alpha program is accepting new users
  async canAcceptNewAlphaUsers(): Promise<{ canAccept: boolean; waitlistPosition?: number; reason?: string }> {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_alpha_user', true)
        .in('alpha_status', ['active', 'pending'])

      if (error) throw error

      const currentCount = count || 0
      
      if (currentCount < this.MAX_ALPHA_USERS) {
        return { canAccept: true }
      }

      // Check waitlist position
      const { count: waitlistCount, error: waitlistError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting')

      if (waitlistError) throw waitlistError

      return {
        canAccept: false,
        waitlistPosition: (waitlistCount || 0) + 1,
        reason: `Alpha program is full (${currentCount}/${this.MAX_ALPHA_USERS} users)`
      }
    } catch (error) {
      logger.error('Failed to check alpha capacity:', error)
      throw error
    }
  }

  // Convert waitlist user to alpha user
  async inviteFromWaitlist(
    count: number = 1,
    criteria: {
      prioritizeHighEngagement?: boolean
      prioritizeEarlySignups?: boolean
      prioritizeSpecificSources?: string[]
    } = {}
  ): Promise<AlphaInvite[]> {
    try {
      // Check capacity
      const capacity = await this.canAcceptNewAlphaUsers()
      if (!capacity.canAccept) {
        throw new Error('Alpha program at capacity')
      }

      // Get waitlist candidates
      let query = supabase
        .from('waitlist')
        .select('*')
        .eq('status', 'waiting')
        .limit(count)

      // Apply criteria-based ordering
      if (criteria.prioritizeEarlySignups) {
        query = query.order('created_at', { ascending: true })
      } else if (criteria.prioritizeHighEngagement) {
        query = query.order('engagement_score', { ascending: false })
      }

      const { data: waitlistUsers, error } = await query

      if (error) throw error
      if (!waitlistUsers || waitlistUsers.length === 0) {
        throw new Error('No waitlist users available for invitation')
      }

      // Create invites
      const invites: AlphaInvite[] = []
      const invitePromises = waitlistUsers.map(async (user) => {
        const inviteCode = this.generateInviteCode()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        const invite: Omit<AlphaInvite, 'id'> = {
          email: user.email,
          inviteCode,
          invitedBy: 'system',
          status: 'sent',
          expiresAt,
          sentAt: new Date(),
          remindersSent: 0
        }

        const { data, error: inviteError } = await supabase
          .from('alpha_invites')
          .insert(invite)
          .select()
          .single()

        if (inviteError) throw inviteError

        // Update waitlist status
        await supabase
          .from('waitlist')
          .update({ 
            status: 'invited',
            invited_at: new Date(),
            invite_code: inviteCode
          })
          .eq('id', user.id)

        // Send invitation email
        await this.sendInviteEmail(user.email, inviteCode)

        invites.push(data)
        return data
      })

      await Promise.all(invitePromises)

      logger.info('Alpha invites sent successfully', { 
        count: invites.length,
        emails: invites.map(i => i.email)
      })

      return invites
    } catch (error) {
      logger.error('Failed to invite users from waitlist:', error)
      throw error
    }
  }

  // Activate alpha user with invite code
  async activateAlphaUser(userId: string, inviteCode: string): Promise<{
    success: boolean
    user?: AlphaUser
    onboarding?: AlphaOnboarding
    error?: string
  }> {
    try {
      // Validate invite code
      const { data: invite, error: inviteError } = await supabase
        .from('alpha_invites')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'sent')
        .single()

      if (inviteError || !invite) {
        return { success: false, error: 'Invalid or expired invite code' }
      }

      if (new Date() > new Date(invite.expiresAt)) {
        return { success: false, error: 'Invite code has expired' }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        return { success: false, error: 'User profile not found' }
      }

      if (profile.email !== invite.email) {
        return { success: false, error: 'Email does not match invite' }
      }

      // Activate alpha user
      const activatedAt = new Date()
      const cohort = this.getCurrentCohort()

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_alpha_user: true,
          alpha_status: 'active',
          alpha_cohort: cohort,
          alpha_activated_at: activatedAt,
          alpha_invite_code: inviteCode,
          alpha_priority_level: 'medium' // Default priority
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Update invite status
      await supabase
        .from('alpha_invites')
        .update({
          status: 'activated',
          activatedAt
        })
        .eq('invite_code', inviteCode)

      // Initialize onboarding
      const onboarding = await this.initializeOnboarding(userId)

      // Track activation
      await alphaMetrics.trackUserJourneyEvent({
        userId,
        event: 'signup',
        metadata: {
          source: 'alpha_invite',
          cohort,
          inviteCode
        }
      })

      const alphaUser: AlphaUser = {
        id: userId,
        email: profile.email,
        inviteCode,
        invitedAt: new Date(invite.sentAt),
        activatedAt,
        status: 'active',
        onboardingProgress: {
          profileSetup: false,
          cookingAssessment: false,
          firstRecipeView: false,
          firstCookingSession: false,
          feedbackProvided: false
        },
        cohort,
        priorityLevel: 'medium',
        feedbackContribution: 0,
        successMetrics: {
          totalSessions: 0,
          successfulSessions: 0,
          averageRating: 0,
          retentionDays: 0
        },
        waitlistJoinedAt: profile.waitlist_joined_at,
        waitlistSource: profile.waitlist_source || 'unknown',
        metadata: {}
      }

      logger.info('Alpha user activated successfully', {
        userId,
        email: profile.email,
        cohort
      })

      return {
        success: true,
        user: alphaUser,
        onboarding
      }
    } catch (error) {
      logger.error('Failed to activate alpha user:', error)
      return { success: false, error: 'Activation failed' }
    }
  }

  // Initialize personalized onboarding
  async initializeOnboarding(userId: string): Promise<AlphaOnboarding> {
    try {
      const onboardingSteps = [
        { step: 1, title: 'Welcome & Expectations', description: 'Alpha program introduction' },
        { step: 2, title: 'Cooking Profile Setup', description: 'Skill assessment and preferences' },
        { step: 3, title: 'AI Features Tour', description: 'Introduction to AI cooking assistant' },
        { step: 4, title: 'First Recipe Experience', description: 'Guided first recipe with AI' },
        { step: 5, title: 'Feedback Setup', description: 'How to provide valuable feedback' }
      ]

      const onboardingData: Omit<AlphaOnboarding, 'userId'> = {
        currentStep: 1,
        totalSteps: onboardingSteps.length,
        stepData: onboardingSteps.reduce((acc, step) => {
          acc[step.step] = { completed: false }
          return acc
        }, {} as any),
        personalizedRecommendations: await this.generatePersonalizedRecommendations(userId),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const { data, error } = await supabase
        .from('alpha_onboarding')
        .insert({ userId, ...onboardingData })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      logger.error('Failed to initialize onboarding:', error)
      throw error
    }
  }

  // Update onboarding progress
  async updateOnboardingProgress(
    userId: string, 
    step: number, 
    data?: any
  ): Promise<void> {
    try {
      const { data: onboarding, error: fetchError } = await supabase
        .from('alpha_onboarding')
        .select('*')
        .eq('userId', userId)
        .single()

      if (fetchError) throw fetchError

      const updatedStepData = {
        ...onboarding.stepData,
        [step]: {
          completed: true,
          completedAt: new Date(),
          data
        }
      }

      const newCurrentStep = step < onboarding.totalSteps ? step + 1 : step

      const { error } = await supabase
        .from('alpha_onboarding')
        .update({
          currentStep: newCurrentStep,
          stepData: updatedStepData,
          updatedAt: new Date()
        })
        .eq('userId', userId)

      if (error) throw error

      // Track onboarding progress
      await alphaMetrics.trackUserJourneyEvent({
        userId,
        event: 'feature_discovery',
        metadata: {
          onboarding_step: step,
          step_completed: true
        }
      })

      // Check if onboarding is complete
      if (step === onboarding.totalSteps) {
        await this.completeOnboarding(userId)
      }
    } catch (error) {
      logger.error('Failed to update onboarding progress:', error)
      throw error
    }
  }

  // Get alpha user dashboard data
  async getAlphaUserDashboard(userId: string): Promise<{
    userProfile: AlphaUser
    onboardingStatus: AlphaOnboarding
    recentActivity: any[]
    achievements: string[]
    nextRecommendations: string[]
    feedbackImpact: {
      submittedCount: number
      helpfulnessRating: number
      featuresInfluenced: string[]
    }
  }> {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('is_alpha_user', true)
        .single()

      if (profileError) throw profileError

      // Get onboarding status
      const { data: onboarding, error: onboardingError } = await supabase
        .from('alpha_onboarding')
        .select('*')
        .eq('userId', userId)
        .single()

      if (onboardingError) throw onboardingError

      // Get recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('cooking_sessions')
        .select(`
          *,
          recipes(title, image_url)
        `)
        .eq('userId', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (activityError) throw activityError

      // Calculate user achievements and feedback impact
      const achievements = await this.calculateUserAchievements(userId)
      const feedbackImpact = await this.calculateFeedbackImpact(userId)

      const userProfile: AlphaUser = {
        id: profile.id,
        email: profile.email,
        inviteCode: profile.alpha_invite_code,
        activatedAt: profile.alpha_activated_at,
        status: profile.alpha_status,
        onboardingProgress: this.calculateOnboardingProgress(onboarding),
        onboardingCompletedAt: profile.alpha_onboarding_completed_at,
        cohort: profile.alpha_cohort,
        priorityLevel: profile.alpha_priority_level,
        feedbackContribution: profile.alpha_feedback_score || 0,
        successMetrics: await this.calculateSuccessMetrics(userId),
        waitlistJoinedAt: profile.waitlist_joined_at,
        waitlistSource: profile.waitlist_source || 'unknown',
        metadata: profile.alpha_metadata || {}
      }

      return {
        userProfile,
        onboardingStatus: onboarding,
        recentActivity: recentActivity || [],
        achievements,
        nextRecommendations: onboarding.personalizedRecommendations,
        feedbackImpact
      }
    } catch (error) {
      logger.error('Failed to get alpha user dashboard:', error)
      throw error
    }
  }

  // Private helper methods
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private getCurrentCohort(): string {
    const now = new Date()
    const month = now.toLocaleString('default', { month: 'short' })
    const year = now.getFullYear()
    return `alpha-${month.toLowerCase()}-${year}`
  }

  private async sendInviteEmail(email: string, inviteCode: string): Promise<void> {
    // Integration with email service would go here
    // For now, just log the invite
    logger.info('Alpha invite email would be sent', {
      email,
      inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/alpha/activate?code=${inviteCode}`
    })
  }

  private async generatePersonalizedRecommendations(userId: string): Promise<string[]> {
    // This would analyze user data to generate personalized recommendations
    return [
      'Start with simple 15-minute recipes to build confidence',
      'Try the AI recipe adaptation feature for skill-appropriate recipes',
      'Use the cooking assistant for real-time guidance',
      'Explore the feedback system to help improve the platform'
    ]
  }

  private async completeOnboarding(userId: string): Promise<void> {
    await supabase
      .from('profiles')
      .update({
        alpha_onboarding_completed_at: new Date()
      })
      .eq('id', userId)

    await alphaMetrics.trackUserJourneyEvent({
      userId,
      event: 'feature_discovery',
      metadata: { onboarding_completed: true }
    })
  }

  private calculateOnboardingProgress(onboarding: AlphaOnboarding) {
    const completedSteps = Object.values(onboarding.stepData).filter(step => step.completed).length
    return {
      profileSetup: onboarding.stepData[2]?.completed || false,
      cookingAssessment: onboarding.stepData[2]?.completed || false,
      firstRecipeView: onboarding.stepData[3]?.completed || false,
      firstCookingSession: onboarding.stepData[4]?.completed || false,
      feedbackProvided: onboarding.stepData[5]?.completed || false
    }
  }

  private async calculateSuccessMetrics(userId: string) {
    const { data: sessions, error } = await supabase
      .from('cooking_sessions')
      .select('success_rating, status')
      .eq('userId', userId)

    if (error) {
      logger.error('Failed to calculate success metrics:', error)
      return {
        totalSessions: 0,
        successfulSessions: 0,
        averageRating: 0,
        retentionDays: 0
      }
    }

    const totalSessions = sessions.length
    const successfulSessions = sessions.filter(s => s.success_rating >= 4).length
    const ratings = sessions.filter(s => s.success_rating).map(s => s.success_rating)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0

    return {
      totalSessions,
      successfulSessions,
      averageRating,
      retentionDays: 0 // Calculate based on activity pattern
    }
  }

  private async calculateUserAchievements(userId: string): Promise<string[]> {
    // Calculate achievements based on user activity
    return [
      'First Recipe Completed',
      'AI Features Explorer',
      'Feedback Contributor'
    ]
  }

  private async calculateFeedbackImpact(userId: string) {
    const { data: feedback, error } = await supabase
      .from('cooking_feedback')
      .select('*')
      .eq('userId', userId)

    if (error) {
      return {
        submittedCount: 0,
        helpfulnessRating: 0,
        featuresInfluenced: []
      }
    }

    return {
      submittedCount: feedback.length,
      helpfulnessRating: 4.2, // Placeholder
      featuresInfluenced: ['Recipe Adaptation', 'Cooking Assistant']
    }
  }
}

// Export singleton instance
export const alphaUserManager = new AlphaUserManagementService()

// Utility functions
export const checkAlphaAccess = async (userId: string): Promise<boolean> => {
  if (!FEATURES.alphaMode) return true
  
  const { data, error } = await supabase
    .from('profiles')
    .select('is_alpha_user, alpha_status')
    .eq('id', userId)
    .single()

  if (error) return false
  
  return data.is_alpha_user && data.alpha_status === 'active'
}

export const requireAlphaAccess = async (userId: string): Promise<void> => {
  const hasAccess = await checkAlphaAccess(userId)
  if (!hasAccess) {
    throw new Error('Alpha access required')
  }
}