'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Lightbulb, 
  MessageCircle,
  Thermometer,
  Timer,
  Volume2
} from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { aiRecipeAdapter } from '@/lib/services/ai-recipe-adapter'
import { VideoRecipe, RecipeAdaptation, CookingInsight } from '@/types'
import { logger } from '@/lib/logger'
import { alphaMetrics } from '@/lib/monitoring/alpha-metrics'
import { alphaFeedback } from '@/lib/feedback/alpha-feedback'
import { FEATURES } from '@/lib/config/features'
import { checkAlphaAccess } from '@/lib/auth/alpha-user-management'
import { AlphaFeedbackModal } from '@/app/components/alpha/alpha-feedback-modal'

export interface CookingAssistantProps {
  recipe: VideoRecipe;
  adaptations?: RecipeAdaptation[];
  onComplete?: (outcome: {
    success: 'success' | 'partial_success' | 'failure' | 'abandoned';
    rating: number;
    timeTaken: number;
    issues: string[];
    notes?: string;
  }) => void;
  className?: string;
}

interface CookingSession {
  currentStep: number;
  startTime: Date;
  stepStartTime: Date;
  isActive: boolean;
  isPaused: boolean;
  completedSteps: boolean[];
  stepTimings: number[];
  issues: {
    step: number;
    issue: string;
    resolved: boolean;
  }[];
}

export function CookingAssistant({ recipe, adaptations, onComplete, className }: CookingAssistantProps) {
  const { user } = useAuth()
  const [hasAlphaAccess, setHasAlphaAccess] = useState<boolean>(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<CookingSession>({
    currentStep: 0,
    startTime: new Date(),
    stepStartTime: new Date(),
    isActive: false,
    isPaused: false,
    completedSteps: new Array(recipe.instructions.length).fill(false),
    stepTimings: [],
    issues: []
  })
  const [guidance, setGuidance] = useState<{
    guidance: string;
    tips: string[];
    warnings: string[];
    alternatives: string[];
    nextStepPreparation: string[];
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionData, setCompletionData] = useState({
    rating: 5,
    issues: [] as string[],
    notes: ''
  })
  const [timers, setTimers] = useState<{ [key: string]: { duration: number; remaining: number; active: boolean } }>({})
  const [currentTimer, setCurrentTimer] = useState<string | null>(null)
  const [showAlphaFeedback, setShowAlphaFeedback] = useState(false)

  // Check alpha access on mount
  useEffect(() => {
    const checkAccess = async () => {
      if (user && FEATURES.alphaMode) {
        const access = await checkAlphaAccess(user.id)
        setHasAlphaAccess(access)
      } else {
        setHasAlphaAccess(true) // Non-alpha mode, allow all users
      }
    }
    checkAccess()
  }, [user])

  useEffect(() => {
    if (session.isActive && session.currentStep < recipe.instructions.length) {
      loadStepGuidance()
    }
  }, [session.currentStep, session.isActive])

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTimer && timers[currentTimer]?.active) {
        setTimers(prev => {
          const timer = prev[currentTimer]
          if (timer && timer.remaining > 0) {
            return {
              ...prev,
              [currentTimer]: { ...timer, remaining: timer.remaining - 1 }
            }
          } else if (timer && timer.remaining <= 0) {
            // Timer finished - notify user
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer finished!', {
                body: `Your ${currentTimer} timer has finished.`,
                icon: '/favicon.ico'
              })
            }
            return {
              ...prev,
              [currentTimer]: { ...timer, active: false }
            }
          }
          // Return unchanged state if no timer or other conditions
          return prev
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentTimer, timers])

  const loadStepGuidance = async () => {
    if (!user) return

    setLoading(true)
    try {
      const stepGuidance = await aiRecipeAdapter.getCookingGuidance(
        user.id,
        recipe.id,
        session.currentStep + 1,
        {
          issuesEncountered: session.issues.filter(i => !i.resolved).map(i => i.issue),
          timeElapsed: Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)
        }
      )
      setGuidance(stepGuidance)
    } catch (error) {
      logger.error('Failed to load step guidance:', error)
    } finally {
      setLoading(false)
    }
  }

  const startCooking = async () => {
    if (!user) return

    const now = new Date()
    setSession({
      ...session,
      isActive: true,
      isPaused: false,
      startTime: now,
      stepStartTime: now,
      currentStep: 0
    })

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Track cooking session start for alpha metrics
    if (FEATURES.alphaMode || FEATURES.enableAnalytics) {
      try {
        const newSessionId = await alphaMetrics.startCookingSession({
          userId: user.id,
          recipeId: recipe.id,
          adaptationId: adaptations?.[0]?.id,
          aiGuidanceEnabled: FEATURES.enableCookingAssistant
        })
        setSessionId(newSessionId)

        // Track user journey event
        await alphaMetrics.trackUserJourneyEvent({
          userId: user.id,
          event: 'first_cooking_session',
          metadata: {
            recipeId: recipe.id,
            hasAdaptations: Boolean(adaptations?.length),
            sessionId: newSessionId
          }
        })
      } catch (error) {
        logger.error('Failed to track cooking session start:', error)
      }
    }
  }

  const pauseCooking = () => {
    setSession(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const completeStep = () => {
    const stepTime = Math.floor((Date.now() - session.stepStartTime.getTime()) / 1000)
    const newTimings = [...session.stepTimings, stepTime]
    const newCompleted = [...session.completedSteps]
    newCompleted[session.currentStep] = true

    setSession(prev => ({
      ...prev,
      completedSteps: newCompleted,
      stepTimings: newTimings,
      stepStartTime: new Date()
    }))

    if (session.currentStep < recipe.instructions.length - 1) {
      nextStep()
    } else {
      finishCooking()
    }
  }

  const nextStep = () => {
    if (session.currentStep < recipe.instructions.length - 1) {
      setSession(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        stepStartTime: new Date()
      }))
    }
  }

  const previousStep = () => {
    if (session.currentStep > 0) {
      setSession(prev => ({ ...prev, currentStep: prev.currentStep - 1 }))
    }
  }

  const reportIssue = (issue: string) => {
    setSession(prev => ({
      ...prev,
      issues: [...prev.issues, { step: prev.currentStep, issue, resolved: false }]
    }))
  }

  const resolveIssue = (issueIndex: number) => {
    setSession(prev => ({
      ...prev,
      issues: prev.issues.map((issue, index) => 
        index === issueIndex ? { ...issue, resolved: true } : issue
      )
    }))
  }

  const startTimer = (name: string, minutes: number) => {
    const duration = minutes * 60
    setTimers(prev => ({
      ...prev,
      [name]: { duration, remaining: duration, active: true }
    }))
    setCurrentTimer(name)
  }

  const finishCooking = () => {
    const totalTime = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)
    
    // For alpha mode, show enhanced feedback modal
    if (FEATURES.alphaMode && FEATURES.enableFeedbackCollection) {
      setShowAlphaFeedback(true)
    } else {
      setShowCompletionModal(true)
    }
    
    setCompletionData(prev => ({
      ...prev,
      issues: session.issues.filter(i => !i.resolved).map(i => i.issue)
    }))
  }

  const submitCompletion = async () => {
    if (!user) return

    const totalTime = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)
    const completedStepsCount = session.completedSteps.filter(Boolean).length
    const success: "success" | "partial_success" | "failure" | "abandoned" = completedStepsCount === recipe.instructions.length ? 'success' :
                   completedStepsCount > recipe.instructions.length * 0.7 ? 'partial_success' : 'failure'

    const outcome = {
      success,
      rating: completionData.rating,
      timeTaken: totalTime,
      issues: completionData.issues,
      notes: completionData.notes
    }

    try {
      // Record in existing system
      await aiRecipeAdapter.recordCookingOutcome(user.id, recipe.id, {
        success,
        rating: completionData.rating,
        timeTaken: totalTime,
        difficultyExperienced: Math.max(1, Math.min(5, completionData.issues.length + 1)),
        issuesEncountered: completionData.issues,
        notes: completionData.notes
      })

      // Update alpha metrics if session ID exists
      if (sessionId && (FEATURES.alphaMode || FEATURES.enableAnalytics)) {
        await alphaMetrics.updateCookingSession(sessionId, {
          status: 'completed',
          successRating: completionData.rating,
          difficultyRating: Math.max(1, Math.min(5, completionData.issues.length + 1)),
          issuesEncountered: completionData.issues,
          stepsCompleted: completedStepsCount,
          totalSteps: recipe.instructions.length,
          duration: totalTime,
          endTime: new Date()
        })
      }
    } catch (error) {
      logger.error('Failed to record cooking outcome:', error)
    }

    onComplete?.(outcome)
    setShowCompletionModal(false)
  }

  const submitAlphaFeedback = async (feedbackData: any) => {
    if (!user || !sessionId) return

    const totalTime = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)
    const completedStepsCount = session.completedSteps.filter(Boolean).length

    try {
      await alphaFeedback.submitCookingFeedback({
        userId: user.id,
        sessionId,
        recipeId: recipe.id,
        overallRating: feedbackData.overallRating,
        difficultyRating: feedbackData.difficultyRating,
        aiHelpfulnessRating: feedbackData.aiHelpfulnessRating,
        whatWorkedWell: feedbackData.whatWorkedWell || [],
        whatWasConfusing: feedbackData.whatWasConfusing || [],
        suggestedImprovements: feedbackData.suggestedImprovements || [],
        timeSpent: totalTime,
        stepsCompleted: completedStepsCount,
        totalSteps: recipe.instructions.length,
        adaptationsUsed: adaptations?.map(a => a.id) || [],
        issuesEncountered: session.issues.filter(i => !i.resolved).map(i => i.issue),
        aiFeatures: {
          recipeAdaptation: {
            used: Boolean(adaptations?.length),
            helpful: feedbackData.aiFeatures?.recipeAdaptation?.helpful || 0,
            suggestions: feedbackData.aiFeatures?.recipeAdaptation?.suggestions || []
          },
          cookingAssistant: {
            used: FEATURES.enableCookingAssistant,
            helpful: feedbackData.aiFeatures?.cookingAssistant?.helpful || 0,
            mostValuableFeature: feedbackData.aiFeatures?.cookingAssistant?.mostValuableFeature || ''
          },
          successPrediction: {
            used: FEATURES.enableSuccessPrediction,
            accurate: feedbackData.aiFeatures?.successPrediction?.accurate || false,
            confidence: feedbackData.aiFeatures?.successPrediction?.confidence || 0
          }
        },
        additionalComments: feedbackData.additionalComments || '',
        wouldRecommend: feedbackData.wouldRecommend || false,
        likelyToReturnRating: feedbackData.likelyToReturnRating || 3,
        deviceType: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 
                   typeof window !== 'undefined' && window.innerWidth < 1024 ? 'tablet' : 'desktop',
        cookingContext: feedbackData.cookingContext || 'general',
        skillLevel: feedbackData.skillLevel || 5,
        previousExperience: feedbackData.previousExperience || ''
      })

      const outcome = {
        success: completedStepsCount === recipe.instructions.length ? 'success' as const :
                completedStepsCount > recipe.instructions.length * 0.7 ? 'partial_success' as const : 'failure' as const,
        rating: feedbackData.overallRating,
        timeTaken: totalTime,
        issues: session.issues.filter(i => !i.resolved).map(i => i.issue),
        notes: feedbackData.additionalComments
      }

      onComplete?.(outcome)
      setShowAlphaFeedback(false)
    } catch (error) {
      logger.error('Failed to submit alpha feedback:', error)
    }
  }

  const currentInstruction = recipe.instructions[session.currentStep]
  const progress = ((session.currentStep + 1) / recipe.instructions.length) * 100
  const totalElapsedMinutes = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)

  const extractTimingInfo = (instruction: string) => {
    const timeMatches = instruction.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/gi)
    return timeMatches || []
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Alpha access gate
  if (FEATURES.alphaMode && !hasAlphaAccess) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Alpha Access Required</h3>
        <p className="text-gray-600 mb-4">
          The AI cooking assistant is currently in alpha testing. 
          You'll need an alpha invite to access this feature.
        </p>
        <Button 
          onClick={() => window.open('/waitlist', '_blank')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Join Waitlist
        </Button>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Alpha Mode Indicator */}
      {FEATURES.alphaMode && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Alpha Feature - Help us improve by providing feedback!
            </span>
          </div>
        </div>
      )}

      {/* Session Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg text-gray-900">{recipe.title}</h2>
            <p className="text-sm text-gray-600">
              Step {session.currentStep + 1} of {recipe.instructions.length}
              {session.isActive && ` • ${totalElapsedMinutes} min elapsed`}
            </p>
          </div>
          {!session.isActive ? (
            <Button onClick={startCooking} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Start Cooking
            </Button>
          ) : (
            <Button 
              onClick={pauseCooking} 
              variant={session.isPaused ? 'default' : 'outline'}
            >
              {session.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {session.isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {recipe.instructions.map((_, index) => (
            <button
              key={index}
              onClick={() => setSession(prev => ({ ...prev, currentStep: index }))}
              className={`flex-shrink-0 w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                session.completedSteps[index] 
                  ? 'bg-green-100 text-green-800'
                  : index === session.currentStep
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600'
              }`}
              disabled={!session.isActive}
            >
              {session.completedSteps[index] ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </button>
          ))}
        </div>
      </Card>

      {session.isActive && (
        <>
          {/* Active Timers */}
          {Object.entries(timers).filter(([_, timer]) => timer.active).length > 0 && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Active Timers</span>
                </div>
                <div className="flex space-x-4">
                  {Object.entries(timers)
                    .filter(([_, timer]) => timer.active)
                    .map(([name, timer]) => (
                      <div key={name} className="text-center">
                        <div className="font-mono text-lg text-orange-800">
                          {formatTime(timer.remaining)}
                        </div>
                        <div className="text-xs text-orange-600">{name}</div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          )}

          {/* Current Step */}
          <Card className="p-6">
            <div className="space-y-4">
              {/* Step Content */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Step {session.currentStep + 1}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {currentInstruction}
                </p>
              </div>

              {/* Timing Suggestions */}
              {extractTimingInfo(currentInstruction).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {extractTimingInfo(currentInstruction).map((timing, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const minutes = parseInt(timing.match(/\d+/)?.[0] || '0')
                        startTimer(`Step ${session.currentStep + 1}`, minutes)
                      }}
                      className="text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Set {timing} timer
                    </Button>
                  ))}
                </div>
              )}

              {/* AI Guidance */}
              {guidance && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {/* Tips */}
                  {guidance.tips.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">AI Tips</span>
                      </div>
                      <ul className="space-y-1">
                        {guidance.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start space-x-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {guidance.warnings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-900">Safety Reminders</span>
                      </div>
                      <ul className="space-y-1">
                        {guidance.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-orange-700 flex items-start space-x-2">
                            <span className="text-orange-400 mt-1">⚠</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternatives */}
                  {guidance.alternatives.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Alternatives</span>
                      </div>
                      <ul className="space-y-1">
                        {guidance.alternatives.map((alt, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start space-x-2">
                            <span className="text-green-400 mt-1">→</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Step Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    disabled={session.currentStep === 0}
                  >
                    <SkipBack className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => reportIssue('Had trouble with this step')}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>

                <div className="flex space-x-2">
                  {session.currentStep < recipe.instructions.length - 1 ? (
                    <>
                      <Button variant="outline" onClick={nextStep}>
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip Step
                      </Button>
                      <Button onClick={completeStep} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Step
                      </Button>
                    </>
                  ) : (
                    <Button onClick={completeStep} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Finish Recipe
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Issues */}
          {session.issues.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Issues Encountered</h4>
              <div className="space-y-2">
                {session.issues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <span className={`text-sm ${issue.resolved ? 'text-gray-600 line-through' : 'text-yellow-800'}`}>
                      Step {issue.step + 1}: {issue.issue}
                    </span>
                    {!issue.resolved && (
                      <Button size="sm" variant="outline" onClick={() => resolveIssue(index)}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Standard Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">How did it go?</h3>
            
            <div>
              <label className="block text-sm text-gray-700 mb-2">Rating (1-5 stars)</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setCompletionData(prev => ({ ...prev, rating }))}
                    className={`text-2xl ${rating <= completionData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={completionData.notes}
                onChange={(e) => setCompletionData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional comments about your cooking experience..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowCompletionModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitCompletion} className="flex-1">
                Submit Feedback
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Alpha Feedback Modal */}
      <AlphaFeedbackModal
        isOpen={showAlphaFeedback}
        onClose={() => setShowAlphaFeedback(false)}
        onSubmit={submitAlphaFeedback}
        recipeTitle={recipe.title}
        totalTime={Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60)}
        stepsCompleted={session.completedSteps.filter(Boolean).length}
        totalSteps={recipe.instructions.length}
        aiFeatures={{
          hasAdaptations: Boolean(adaptations?.length),
          usedCookingAssistant: FEATURES.enableCookingAssistant,
          usedSuccessPrediction: FEATURES.enableSuccessPrediction
        }}
      />
    </div>
  )
}