// Alpha Feedback Collection System

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { alphaMetrics } from '@/lib/monitoring/alpha-metrics'

// Feedback Types
export interface CookingFeedback {
  id: string
  userId: string
  sessionId: string
  recipeId: string
  
  // Core Rating (1-5)
  overallRating: number
  difficultyRating: number
  aiHelpfulnessRating: number
  
  // Specific Feedback
  whatWorkedWell: string[]
  whatWasConfusing: string[]
  suggestedImprovements: string[]
  
  // Experience Metrics
  timeSpent: number // minutes
  stepsCompleted: number
  totalSteps: number
  adaptationsUsed: string[]
  issuesEncountered: string[]
  
  // AI-specific feedback
  aiFeatures: {
    recipeAdaptation: {
      used: boolean
      helpful: number // 1-5
      suggestions: string[]
    }
    cookingAssistant: {
      used: boolean
      helpful: number // 1-5
      mostValuableFeature: string
    }
    successPrediction: {
      used: boolean
      accurate: boolean
      confidence: number
    }
  }
  
  // Free-form feedback
  additionalComments: string
  wouldRecommend: boolean
  likelyToReturnRating: number // 1-5 (Net Promoter Score style)
  
  // Metadata
  deviceType: 'mobile' | 'tablet' | 'desktop'
  cookingContext: string // 'weeknight dinner', 'weekend experiment', etc.
  skillLevel: number // 1-10
  previousExperience: string
  
  createdAt: Date
  submittedAt: Date
}

export interface MicroSurvey {
  id: string
  type: 'quick_rating' | 'feature_specific' | 'onboarding' | 'retention'
  questions: MicroSurveyQuestion[]
  targetCriteria: {
    userType?: 'new' | 'returning' | 'at_risk'
    sessionCount?: number
    lastActivity?: string
    featureUsage?: string[]
  }
  active: boolean
  priority: number
  createdAt: Date
}

export interface MicroSurveyQuestion {
  id: string
  type: 'rating' | 'multiple_choice' | 'text' | 'boolean'
  question: string
  options?: string[]
  required: boolean
  followupCondition?: any
}

export interface FeedbackResponse {
  id: string
  userId: string
  surveyId: string
  sessionId?: string
  responses: { [questionId: string]: any }
  context: {
    page: string
    feature: string
    sessionData?: any
  }
  submittedAt: Date
}

// Feedback Collection Service
class AlphaFeedbackService {
  
  // Post-cooking detailed survey
  async submitCookingFeedback(feedback: Omit<CookingFeedback, 'id' | 'createdAt' | 'submittedAt'>): Promise<string> {
    try {
      const feedbackData: Partial<CookingFeedback> = {
        ...feedback,
        createdAt: new Date(),
        submittedAt: new Date()
      }

      const { data, error } = await supabase
        .from('cooking_feedback')
        .insert(feedbackData)
        .select('id')
        .single()

      if (error) throw error

      // Update session metrics with detailed feedback
      await alphaMetrics.updateCookingSession(feedback.sessionId, {
        successRating: feedback.overallRating,
        difficultyRating: feedback.difficultyRating,
        issuesEncountered: feedback.issuesEncountered,
        status: 'completed',
        endTime: new Date()
      })

      // Track AI feature effectiveness
      await this.trackAIFeatureFeedback(feedback)

      // Check for critical feedback that needs immediate attention
      await this.checkCriticalFeedback(data.id, feedback)

      logger.info('Cooking feedback submitted successfully', { 
        feedbackId: data.id, 
        userId: feedback.userId, 
        rating: feedback.overallRating 
      })

      return data.id
    } catch (error) {
      logger.error('Failed to submit cooking feedback:', error)
      throw error
    }
  }

  // Quick micro-survey for immediate insights
  async submitMicroSurvey(response: Omit<FeedbackResponse, 'id' | 'submittedAt'>): Promise<void> {
    try {
      const responseData = {
        ...response,
        submittedAt: new Date()
      }

      const { error } = await supabase
        .from('micro_survey_responses')
        .insert(responseData)

      if (error) throw error

      // Process response for real-time insights
      await this.processMicroSurveyResponse(response)

      logger.info('Micro survey response submitted', { 
        surveyId: response.surveyId, 
        userId: response.userId 
      })
    } catch (error) {
      logger.error('Failed to submit micro survey response:', error)
      throw error
    }
  }

  // Get contextual micro-survey for user
  async getMicroSurveyForUser(userId: string, context: {
    page: string
    feature?: string
    sessionData?: any
  }): Promise<MicroSurvey | null> {
    try {
      // Get user profile and activity to determine appropriate survey
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) return null

      const { data: surveys, error } = await supabase
        .from('micro_surveys')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })

      if (error) throw error

      // Find most relevant survey based on user context
      for (const survey of surveys) {
        if (await this.isSurveyRelevant(survey, userProfile, context)) {
          // Check if user hasn't seen this survey recently
          const recentResponse = await this.hasRecentResponse(userId, survey.id, 24); // 24 hours
          if (!recentResponse) {
            return survey
          }
        }
      }

      return null
    } catch (error) {
      logger.error('Failed to get micro survey for user:', error)
      return null
    }
  }

  // Get cooking feedback form configuration
  getCookingFeedbackForm(recipeComplexity: 'simple' | 'intermediate' | 'complex'): {
    questions: Array<{
      id: string
      type: 'rating' | 'multiple_choice' | 'text' | 'checkbox'
      question: string
      required: boolean
      options?: string[]
      conditionalDisplay?: any
    }>
    estimatedTime: number // seconds
  } {
    const baseQuestions = [
      {
        id: 'overall_rating',
        type: 'rating' as const,
        question: 'How would you rate your overall cooking experience?',
        required: true
      },
      {
        id: 'difficulty_rating',
        type: 'rating' as const,
        question: 'How difficult was this recipe compared to what you expected?',
        required: true
      },
      {
        id: 'what_worked_well',
        type: 'checkbox' as const,
        question: 'What worked well for you?',
        required: false,
        options: [
          'Clear instructions',
          'AI guidance was helpful',
          'Recipe adaptation fit my skills',
          'Timing predictions were accurate',
          'Ingredients were easy to find',
          'Final result matched expectations'
        ]
      },
      {
        id: 'issues_encountered',
        type: 'checkbox' as const,
        question: 'What challenges did you face?',
        required: false,
        options: [
          'Instructions were unclear',
          'Timing was off',
          'Missing equipment',
          'Ingredient substitution needed',
          'Recipe was too difficult',
          'AI guidance was confusing',
          'Technical issues with the app'
        ]
      }
    ]

    const aiFeatureQuestions = [
      {
        id: 'ai_helpfulness',
        type: 'rating' as const,
        question: 'How helpful was the AI cooking assistant?',
        required: false,
        conditionalDisplay: { used_ai_features: true }
      },
      {
        id: 'ai_most_valuable',
        type: 'multiple_choice' as const,
        question: 'Which AI feature was most valuable?',
        required: false,
        options: [
          'Recipe adaptation for my skill level',
          'Step-by-step guidance',
          'Timing and alerts',
          'Troubleshooting help',
          'Success prediction'
        ],
        conditionalDisplay: { used_ai_features: true }
      }
    ]

    const complexRecipeQuestions = recipeComplexity === 'complex' ? [
      {
        id: 'skill_development',
        type: 'text' as const,
        question: 'What new skills or techniques did you learn?',
        required: false
      },
      {
        id: 'adaptation_suggestions',
        type: 'text' as const,
        question: 'How could we better adapt complex recipes for your skill level?',
        required: false
      }
    ] : []

    const finalQuestions = [
      {
        id: 'would_recommend',
        type: 'rating' as const,
        question: 'How likely are you to recommend NIBBBLE to a friend?',
        required: true
      },
      {
        id: 'additional_comments',
        type: 'text' as const,
        question: 'Any additional feedback or suggestions?',
        required: false
      }
    ]

    return {
      questions: [
        ...baseQuestions,
        ...aiFeatureQuestions,
        ...complexRecipeQuestions,
        ...finalQuestions
      ],
      estimatedTime: 90 // seconds
    }
  }

  // Get feedback analytics for alpha optimization
  async getFeedbackAnalytics(timeRange: '24h' | '7d' | '30d' = '7d'): Promise<{
    overallSatisfaction: number
    aiHelpfulnessScore: number
    commonIssues: Array<{ issue: string; frequency: number }>
    improvementSuggestions: Array<{ suggestion: string; priority: number }>
    userSegmentInsights: {
      newUsers: { satisfaction: number; commonIssues: string[] }
      experiencedUsers: { satisfaction: number; commonIssues: string[] }
    }
    criticalFeedback: Array<{
      id: string
      userId: string
      issue: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      actionTaken: boolean
    }>
  }> {
    try {
      const timeFilter = this.getTimeFilter(timeRange)
      
      const { data: feedback, error } = await supabase
        .from('cooking_feedback')
        .select(`
          *,
          profiles!inner(skill_level, cooking_experience_years)
        `)
        .gte('created_at', timeFilter)

      if (error) throw error

      // Calculate overall satisfaction
      const overallSatisfaction = feedback.reduce((acc, f) => acc + f.overall_rating, 0) / feedback.length || 0

      // Calculate AI helpfulness
      const aiRatings = feedback.filter(f => f.ai_helpfulness_rating > 0)
      const aiHelpfulnessScore = aiRatings.reduce((acc, f) => acc + f.ai_helpfulness_rating, 0) / aiRatings.length || 0

      // Analyze common issues
      const allIssues = feedback.flatMap(f => f.issues_encountered || [])
      const issueFrequency: { [key: string]: number } = {}
      allIssues.forEach(issue => {
        issueFrequency[issue] = (issueFrequency[issue] || 0) + 1
      })
      
      const commonIssues = Object.entries(issueFrequency)
        .map(([issue, frequency]) => ({ issue, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)

      // Analyze by user segments
      const newUsers = feedback.filter(f => f.profiles.cooking_experience_years < 2)
      const experiencedUsers = feedback.filter(f => f.profiles.cooking_experience_years >= 2)

      const userSegmentInsights = {
        newUsers: {
          satisfaction: newUsers.reduce((acc, f) => acc + f.overall_rating, 0) / newUsers.length || 0,
          commonIssues: this.getTopIssues(newUsers, 3)
        },
        experiencedUsers: {
          satisfaction: experiencedUsers.reduce((acc, f) => acc + f.overall_rating, 0) / experiencedUsers.length || 0,
          commonIssues: this.getTopIssues(experiencedUsers, 3)
        }
      }

      // Get critical feedback
      const { data: criticalFeedback, error: criticalError } = await supabase
        .from('critical_feedback_alerts')
        .select('*')
        .gte('created_at', timeFilter)
        .order('created_at', { ascending: false })

      if (criticalError) throw criticalError

      return {
        overallSatisfaction,
        aiHelpfulnessScore,
        commonIssues,
        improvementSuggestions: this.generateImprovementSuggestions(commonIssues, feedback),
        userSegmentInsights,
        criticalFeedback: criticalFeedback || []
      }
    } catch (error) {
      logger.error('Failed to get feedback analytics:', error)
      throw error
    }
  }

  // Private helper methods
  private async trackAIFeatureFeedback(feedback: Omit<CookingFeedback, 'id' | 'createdAt' | 'submittedAt'>): Promise<void> {
    const aiFeatures = feedback.aiFeatures

    if (aiFeatures.recipeAdaptation.used) {
      await alphaMetrics.trackAIFeatureUsage({
        userId: feedback.userId,
        feature: 'recipe_adaptation',
        recipeId: feedback.recipeId,
        metadata: {
          helpful: aiFeatures.recipeAdaptation.helpful,
          suggestions: aiFeatures.recipeAdaptation.suggestions
        }
      })
    }

    if (aiFeatures.cookingAssistant.used) {
      await alphaMetrics.trackAIFeatureUsage({
        userId: feedback.userId,
        feature: 'cooking_assistant',
        sessionId: feedback.sessionId,
        metadata: {
          helpful: aiFeatures.cookingAssistant.helpful,
          mostValuable: aiFeatures.cookingAssistant.mostValuableFeature
        }
      })
    }

    if (aiFeatures.successPrediction.used) {
      await alphaMetrics.trackAIFeatureUsage({
        userId: feedback.userId,
        feature: 'success_prediction',
        recipeId: feedback.recipeId,
        metadata: {
          accurate: aiFeatures.successPrediction.accurate,
          confidence: aiFeatures.successPrediction.confidence
        }
      })
    }
  }

  private async checkCriticalFeedback(feedbackId: string, feedback: Omit<CookingFeedback, 'id' | 'createdAt' | 'submittedAt'>): Promise<void> {
    // Check for critical issues that need immediate attention
    const criticalConditions = [
      { condition: feedback.overallRating <= 2, severity: 'high', message: 'Very low overall rating' },
      { condition: feedback.aiHelpfulnessRating <= 2, severity: 'medium', message: 'AI features not helpful' },
      { condition: feedback.issuesEncountered.length >= 3, severity: 'medium', message: 'Multiple issues encountered' },
      { condition: feedback.wouldRecommend === false, severity: 'high', message: 'User would not recommend' },
      { condition: feedback.likelyToReturnRating <= 2, severity: 'high', message: 'Low retention likelihood' }
    ]

    for (const { condition, severity, message } of criticalConditions) {
      if (condition) {
        await supabase.from('critical_feedback_alerts').insert({
          feedback_id: feedbackId,
          user_id: feedback.userId,
          issue: message,
          severity,
          action_taken: false,
          created_at: new Date()
        })

        // Send real-time alert to monitoring system
        logger.error('Critical feedback alert', {
          feedbackId,
          userId: feedback.userId,
          issue: message,
          severity,
          rating: feedback.overallRating
        })
      }
    }
  }

  private async processMicroSurveyResponse(response: Omit<FeedbackResponse, 'id' | 'submittedAt'>): Promise<void> {
    // Process response for immediate insights and triggers
    const responses = response.responses

    // Check for negative feedback that needs immediate attention
    Object.entries(responses).forEach(async ([questionId, answer]) => {
      if (typeof answer === 'number' && answer <= 2) {
        // Low rating - track and potentially trigger follow-up
        await this.handleLowRating(response.userId, questionId, answer, response.context)
      }
    })

    // Update user engagement metrics
    await alphaMetrics.trackUserJourneyEvent({
      userId: response.userId,
      event: 'feature_discovery',
      metadata: {
        survey_completed: response.surveyId,
        context: response.context
      }
    })
  }

  private async handleLowRating(userId: string, questionId: string, rating: number, context: any): Promise<void> {
    // Log low rating for follow-up
    logger.warn('Low rating received in micro survey', {
      userId,
      questionId,
      rating,
      context
    })

    // Potentially trigger a follow-up survey or support outreach
    // This could integrate with customer success tools
  }

  private async getUserProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      logger.error('Failed to get user profile:', error)
      return null
    }

    return data
  }

  private async isSurveyRelevant(survey: MicroSurvey, userProfile: any, context: any): Promise<boolean> {
    // Logic to determine if survey is relevant to user
    const criteria = survey.targetCriteria
    
    if (criteria.userType && !this.matchesUserType(userProfile, criteria.userType)) {
      return false
    }

    // Add more relevance checks as needed
    return true
  }

  private matchesUserType(profile: any, targetType: string): boolean {
    // Logic to match user type based on profile
    const daysSinceSignup = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    
    switch (targetType) {
      case 'new':
        return daysSinceSignup <= 7
      case 'returning':
        return daysSinceSignup > 7 && profile.last_sign_in_at
      case 'at_risk':
        return daysSinceSignup > 14 && !profile.recent_activity
      default:
        return true
    }
  }

  private async hasRecentResponse(userId: string, surveyId: string, hours: number): Promise<boolean> {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('micro_survey_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('survey_id', surveyId)
      .gte('submitted_at', timeThreshold.toISOString())
      .limit(1)

    return !error && data && data.length > 0
  }

  private getTimeFilter(range: string): string {
    const now = new Date()
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  private getTopIssues(feedbackList: any[], count: number): string[] {
    const allIssues = feedbackList.flatMap(f => f.issues_encountered || [])
    const issueFreq: { [key: string]: number } = {}
    
    allIssues.forEach(issue => {
      issueFreq[issue] = (issueFreq[issue] || 0) + 1
    })
    
    return Object.entries(issueFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([issue]) => issue)
  }

  private generateImprovementSuggestions(commonIssues: Array<{ issue: string; frequency: number }>, allFeedback: any[]): Array<{ suggestion: string; priority: number }> {
    const suggestions: Array<{ suggestion: string; priority: number }> = []

    // Generate suggestions based on common issues
    commonIssues.forEach(({ issue, frequency }) => {
      const priority = Math.min(10, Math.floor(frequency / allFeedback.length * 10))
      
      switch (issue.toLowerCase()) {
        case 'instructions were unclear':
          suggestions.push({ 
            suggestion: 'Improve recipe instruction clarity and add more detailed steps', 
            priority 
          })
          break
        case 'timing was off':
          suggestions.push({ 
            suggestion: 'Enhance AI timing predictions and add more cooking time guidance', 
            priority 
          })
          break
        case 'ai guidance was confusing':
          suggestions.push({ 
            suggestion: 'Simplify AI guidance language and improve contextual help', 
            priority 
          })
          break
        // Add more suggestion mappings
      }
    })

    return suggestions.sort((a, b) => b.priority - a.priority)
  }
}

// Export singleton instance
export const alphaFeedback = new AlphaFeedbackService()

// Utility functions for easy feedback collection
export const submitQuickRating = (userId: string, sessionId: string, rating: number, context: string) => {
  return alphaFeedback.submitMicroSurvey({
    userId,
    surveyId: 'quick_rating',
    responses: { rating, context },
    context: { page: 'post_cooking', feature: 'quick_rating' }
  })
}

export const collectDetailedFeedback = (cookingSession: any, userResponses: any) => {
  return alphaFeedback.submitCookingFeedback({
    ...cookingSession,
    ...userResponses
  })
}