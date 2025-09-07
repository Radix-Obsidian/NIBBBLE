// Alpha User Management System
// Manages controlled access and onboarding for alpha launch

import { supabase } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { FEATURES } from '@/lib/config/features'
import { WaitlistService } from '@/lib/waitlist'
import { alphaMetrics } from '@/lib/monitoring/alpha-metrics'

// Alpha User Types
export interface AlphaUser {
  id: string
  email: string
  fullName: string
  userId?: string // Once they create an account
  inviteCode: string
  status: 'invited' | 'registered' | 'onboarded' | 'active' | 'inactive'
  userType: 'home_cook' | 'experienced_cook' | 'chef' | 'food_blogger'
  
  // Onboarding Progress
  onboardingStep: number
  onboardingCompleted: boolean
  firstCookingSession?: Date
  skillLevel: number // 1-10
  cookingGoals: string[]
  
  // Access Control
  invitedAt: Date
  registeredAt?: Date
  onboardedAt?: Date
  lastActiveAt?: Date
  expiresAt?: Date
  
  // Analytics
  sessionsCompleted: number
  averageSuccessRating: number
  featuresUsed: string[]
  
  // Metadata
  invitedBy: 'waitlist' | 'manual' | 'referral'
  source: string
  notes?: string
}

export interface AlphaOnboardingStep {
  id: number
  title: string
  description: string
  component: string
  required: boolean
  estimatedTime: number // minutes
  order: number
}

export interface AlphaInviteRequest {
  email: string
  fullName: string
  userType: AlphaUser['userType']
  source: string
  priority: 'low' | 'normal' | 'high'
  notes?: string
}

// Alpha User Management Service
class AlphaUserManagementService {
  private readonly ALPHA_USER_LIMIT = FEATURES.alphaUserLimit
  private readonly INVITE_EXPIRY_DAYS = 7
  
  // Get onboarding flow configuration
  getOnboardingSteps(): AlphaOnboardingStep[] {
    return [
      {
        id: 1,
        title: 'Welcome to NIBBBLE Alpha',
        description: 'Learn what makes NIBBBLE different and set your expectations',
        component: 'AlphaWelcomeStep',
        required: true,
        estimatedTime: 2,
        order: 1
      },
      {
        id: 2,
        title: 'Your Cooking Profile',
        description: 'Tell us about your cooking experience and goals',
        component: 'CookingProfileStep',
        required: true,
        estimatedTime: 3,
        order: 2
      },
      {
        id: 3,
        title: 'AI Cooking Intelligence',
        description: 'Discover how AI will personalize your cooking experience',
        component: 'AICookingIntroStep',
        required: true,
        estimatedTime: 2,
        order: 3
      },
      {
        id: 4,
        title: 'Your First Recipe',
        description: 'Try a simple recipe adapted to your skill level',
        component: 'FirstRecipeStep',
        required: true,
        estimatedTime: 5,
        order: 4
      },
      {
        id: 5,
        title: 'Feedback & Success Tracking',
        description: 'Learn how we measure and improve your cooking success',
        component: 'FeedbackIntroStep',
        required: true,
        estimatedTime: 2,
        order: 5
      }
    ]
  }

  // Check if user can access alpha
  async canAccessAlpha(email: string): Promise<{
    canAccess: boolean
    reason?: string
    alphaUser?: AlphaUser
  }> {
    try {
      // Check if alpha mode is enabled
      if (!FEATURES.alphaMode) {
        return { canAccess: true }
      }

      // Get alpha user record
      const { data: alphaUser, error } = await supabaseAdmin
        .from('alpha_users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (error || !alphaUser) {
        return { 
          canAccess: false, 
          reason: 'Not invited to alpha program' 
        }
      }

      // Check if invite has expired
      if (alphaUser.expires_at && new Date(alphaUser.expires_at) < new Date()) {
        return { 
          canAccess: false, 
          reason: 'Alpha invite has expired' 
        }
      }

      // Check if user is inactive
      if (alphaUser.status === 'inactive') {
        return { 
          canAccess: false, 
          reason: 'Alpha access revoked' 
        }
      }

      return { 
        canAccess: true, 
        alphaUser: alphaUser as unknown as AlphaUser 
      }
    } catch (error) {
      logger.error('Failed to check alpha access:', error)
      return { 
        canAccess: false, 
        reason: 'Unable to verify alpha access' 
      }
    }
  }

  // Invite user to alpha program
  async inviteUserToAlpha(request: AlphaInviteRequest): Promise<{
    success: boolean
    alphaUser?: AlphaUser
    inviteCode?: string
    error?: string
  }> {
    try {
      // Check alpha capacity
      const currentAlphaUsers = await this.getActiveAlphaUsersCount()
      if (currentAlphaUsers >= this.ALPHA_USER_LIMIT) {
        return { 
          success: false, 
          error: 'Alpha program is at capacity' 
        }
      }

      // Check if user is already invited
      const existingInvite = await this.getAlphaUser(request.email)
      if (existingInvite) {
        return { 
          success: false, 
          error: 'User already invited to alpha program' 
        }
      }

      // Generate unique invite code
      const inviteCode = this.generateInviteCode()
      const expiresAt = new Date(Date.now() + this.INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

      const alphaUserData: Partial<AlphaUser> = {
        email: request.email.toLowerCase(),
        fullName: request.fullName,
        inviteCode,
        status: 'invited',
        userType: request.userType,
        onboardingStep: 0,
        onboardingCompleted: false,
        skillLevel: this.getDefaultSkillLevel(request.userType),
        cookingGoals: [],
        invitedAt: new Date(),
        expiresAt,
        sessionsCompleted: 0,
        averageSuccessRating: 0,
        featuresUsed: [],
        invitedBy: 'manual',
        source: request.source,
        notes: request.notes
      }

      const { data, error } = await supabaseAdmin
        .from('alpha_users')
        .insert(alphaUserData)
        .select()
        .single()

      if (error) throw error

      // Send invite email (integration point for email service)
      await this.sendAlphaInviteEmail(request.email, request.fullName, inviteCode)

      // Track invitation
      await alphaMetrics.trackUserJourneyEvent({
        userId: data.id,
        event: 'signup',
        metadata: {
          alpha_invite: true,
          user_type: request.userType,
          source: request.source
        }
      })

      logger.info('Alpha user invited successfully', {
        email: request.email,
        userType: request.userType,
        inviteCode
      })

      return { 
        success: true, 
        alphaUser: data as unknown as AlphaUser, 
        inviteCode 
      }
    } catch (error) {
      logger.error('Failed to invite alpha user:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Process alpha user registration (when they create account)
  async processAlphaRegistration(email: string, userId: string): Promise<{
    success: boolean
    requiresOnboarding: boolean
    alphaUser?: AlphaUser
    error?: string
  }> {
    try {
      const { data: alphaUser, error } = await supabaseAdmin
        .from('alpha_users')
        .update({
          userId,
          status: 'registered',
          registeredAt: new Date()
        })
        .eq('email', email.toLowerCase())
        .select()
        .single()

      if (error) throw error

      // Update user profile to mark as alpha user
      await supabase
        .from('profiles')
        .update({ 
          is_alpha_user: true,
          alpha_user_id: alphaUser.id 
        })
        .eq('id', userId)

      // Track registration
      await alphaMetrics.trackUserJourneyEvent({
        userId,
        event: 'signup',
        metadata: {
          alpha_registration: true,
          invite_code: alphaUser.invite_code
        }
      })

      logger.info('Alpha user registered successfully', {
        email,
        userId,
        alphaUserId: alphaUser.id
      })

      return { 
        success: true, 
        requiresOnboarding: !alphaUser.onboarding_completed,
        alphaUser: alphaUser as unknown as AlphaUser 
      }
    } catch (error) {
      logger.error('Failed to process alpha registration:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  // Update onboarding progress
  async updateOnboardingProgress(userId: string, step: number, data?: any): Promise<{
    success: boolean
    nextStep?: AlphaOnboardingStep
    completed?: boolean
    error?: string
  }> {
    try {
      const { data: alphaUser, error } = await supabaseAdmin
        .from('alpha_users')
        .update({
          onboardingStep: step,
          onboardingCompleted: step >= this.getOnboardingSteps().length,
          onboardedAt: step >= this.getOnboardingSteps().length ? new Date() : null,
          status: step >= this.getOnboardingSteps().length ? 'onboarded' : 'registered',
          ...(data && { 
            skillLevel: data.skillLevel,
            cookingGoals: data.cookingGoals,
            userType: data.userType 
          })
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      const onboardingSteps = this.getOnboardingSteps()
      const completed = step >= onboardingSteps.length
      const nextStep = completed ? undefined : onboardingSteps.find(s => s.id === step + 1)

      // Track onboarding progress
      await alphaMetrics.trackUserJourneyEvent({
        userId,
        event: 'feature_discovery',
        metadata: {
          onboarding_step: step,
          completed,
          step_data: data
        }
      })

      logger.info('Onboarding progress updated', {
        userId,
        step,
        completed,
        nextStep: nextStep?.title
      })

      return { 
        success: true, 
        nextStep, 
        completed 
      }
    } catch (error) {
      logger.error('Failed to update onboarding progress:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      }
    }
  }

  // Batch invite users from waitlist
  async inviteFromWaitlist(count: number = 10): Promise<{
    invitedCount: number
    errors: string[]
  }> {
    try {
      // Get pending waitlist entries, prioritized
      const waitlistEntries = await WaitlistService.getEntriesByStatus('pending')
      const selectedEntries = waitlistEntries.slice(0, count)

      let invitedCount = 0
      const errors: string[] = []

      for (const entry of selectedEntries) {
        try {
          const result = await this.inviteUserToAlpha({
            email: entry.email,
            fullName: entry.name || entry.email,
            userType: this.mapWaitlistTypeToUserType(entry.type || 'cooker'),
            source: 'waitlist',
            priority: 'normal',
            notes: `Invited from waitlist. Interest: ${entry.interests?.join(', ')}`
          })

          if (result.success) {
            // Approve the waitlist entry
            await WaitlistService.approveEntry(entry.email)
            invitedCount++
          } else {
            errors.push(`${entry.email}: ${result.error}`)
          }
        } catch (error) {
          errors.push(`${entry.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      logger.info('Batch invite from waitlist completed', {
        totalRequested: count,
        invitedCount,
        errorCount: errors.length
      })

      return { invitedCount, errors }
    } catch (error) {
      logger.error('Failed to batch invite from waitlist:', error)
      return { 
        invitedCount: 0, 
        errors: [error instanceof Error ? error.message : 'Batch invite failed'] 
      }
    }
  }

  // Get alpha user analytics
  async getAlphaUserAnalytics(): Promise<{
    totalInvited: number
    totalRegistered: number
    totalOnboarded: number
    totalActive: number
    conversionRates: {
      inviteToRegistration: number
      registrationToOnboarding: number
      onboardingToActive: number
    }
    userTypeDistribution: { [key in AlphaUser['userType']]: number }
    onboardingDropoff: { [step: number]: number }
    averageOnboardingTime: number // hours
  }> {
    try {
      const { data: alphaUsers, error } = await supabaseAdmin
        .from('alpha_users')
        .select('*')

      if (error) throw error

      const totalInvited = alphaUsers.length
      const totalRegistered = alphaUsers.filter(u => u.status !== 'invited').length
      const totalOnboarded = alphaUsers.filter(u => u.onboarding_completed).length
      const totalActive = alphaUsers.filter(u => u.status === 'active').length

      // Calculate conversion rates
      const conversionRates = {
        inviteToRegistration: totalRegistered / totalInvited,
        registrationToOnboarding: totalOnboarded / Math.max(totalRegistered, 1),
        onboardingToActive: totalActive / Math.max(totalOnboarded, 1)
      }

      // User type distribution
      const userTypeDistribution = alphaUsers.reduce((acc, user) => {
        acc[user.user_type as AlphaUser['userType']] = (acc[user.user_type as AlphaUser['userType']] || 0) + 1
        return acc
      }, {} as { [key in AlphaUser['userType']]: number })

      // Onboarding dropoff by step
      const onboardingDropoff = alphaUsers.reduce((acc, user) => {
        if (!user.onboarding_completed && user.onboarding_step > 0) {
          acc[user.onboarding_step] = (acc[user.onboarding_step] || 0) + 1
        }
        return acc
      }, {} as { [step: number]: number })

      // Average onboarding time
      const completedOnboardings = alphaUsers.filter(u => 
        u.onboarded_at && u.registered_at
      )
      const averageOnboardingTime = completedOnboardings.length > 0
        ? completedOnboardings.reduce((acc, user) => {
            const startTime = new Date(user.registered_at!).getTime()
            const endTime = new Date(user.onboarded_at!).getTime()
            return acc + (endTime - startTime)
          }, 0) / completedOnboardings.length / (1000 * 60 * 60) // Convert to hours
        : 0

      return {
        totalInvited,
        totalRegistered,
        totalOnboarded,
        totalActive,
        conversionRates,
        userTypeDistribution,
        onboardingDropoff,
        averageOnboardingTime
      }
    } catch (error) {
      logger.error('Failed to get alpha user analytics:', error)
      throw error
    }
  }

  // Private helper methods
  private async getActiveAlphaUsersCount(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('alpha_users')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'inactive')

    if (error) throw error
    return count || 0
  }

  private async getAlphaUser(email: string): Promise<AlphaUser | null> {
    const { data, error } = await supabaseAdmin
      .from('alpha_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data as unknown as AlphaUser || null
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'ALPHA-'
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private getDefaultSkillLevel(userType: AlphaUser['userType']): number {
    switch (userType) {
      case 'home_cook': return 3
      case 'experienced_cook': return 6
      case 'chef': return 9
      case 'food_blogger': return 5
      default: return 3
    }
  }

  private mapWaitlistTypeToUserType(waitlistType: string): AlphaUser['userType'] {
    switch (waitlistType) {
      case 'creator': return 'food_blogger'
      case 'cooker': return 'home_cook'
      default: return 'home_cook'
    }
  }

  private async sendAlphaInviteEmail(email: string, name: string, inviteCode: string): Promise<void> {
    // Integration point for email service
    // This would send the actual invite email with the invite code
    logger.info('Alpha invite email would be sent', {
      email,
      name,
      inviteCode
    })
  }
}

// Export singleton instance
export const alphaUserManager = new AlphaUserManagementService()

// Utility functions
export const checkAlphaAccess = (email: string) => {
  return alphaUserManager.canAccessAlpha(email)
}

export const registerAlphaUser = (email: string, userId: string) => {
  return alphaUserManager.processAlphaRegistration(email, userId)
}

export const updateOnboarding = (userId: string, step: number, data?: any) => {
  return alphaUserManager.updateOnboardingProgress(userId, step, data)
}

export const batchInviteFromWaitlist = (count: number) => {
  return alphaUserManager.inviteFromWaitlist(count)
}