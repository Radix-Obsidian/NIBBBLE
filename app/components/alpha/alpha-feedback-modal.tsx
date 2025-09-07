'use client'

import { useState } from 'react'
import { 
  Star, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  MessageSquare,
  X
} from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { alphaFeedback } from '@/lib/feedback/alpha-feedback'

interface AlphaFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedbackData: any) => void
  recipeTitle: string
  totalTime: number
  stepsCompleted: number
  totalSteps: number
  aiFeatures?: {
    hasAdaptations: boolean
    usedCookingAssistant: boolean
    usedSuccessPrediction: boolean
  }
}

export function AlphaFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  recipeTitle,
  totalTime,
  stepsCompleted,
  totalSteps,
  aiFeatures = { hasAdaptations: false, usedCookingAssistant: true, usedSuccessPrediction: false }
}: AlphaFeedbackModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 5,
    difficultyRating: 3,
    aiHelpfulnessRating: 5,
    whatWorkedWell: [] as string[],
    whatWasConfusing: [] as string[],
    suggestedImprovements: [] as string[],
    aiFeatures: {
      recipeAdaptation: {
        helpful: 5,
        suggestions: [] as string[]
      },
      cookingAssistant: {
        helpful: 5,
        mostValuableFeature: ''
      },
      successPrediction: {
        accurate: true,
        confidence: 5
      }
    },
    additionalComments: '',
    wouldRecommend: true,
    likelyToReturnRating: 5,
    cookingContext: 'general',
    skillLevel: 5,
    previousExperience: ''
  })

  if (!isOpen) return null

  const totalSteps = 5
  const isLastStep = currentStep === totalSteps
  const completionRate = (stepsCompleted / totalSteps) * 100

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number
    onChange: (rating: number) => void
    label: string 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`text-2xl transition-colors ${
              rating <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            ★
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {value === 1 ? 'Poor' : value === 2 ? 'Fair' : value === 3 ? 'Good' : value === 4 ? 'Very Good' : 'Excellent'}
      </p>
    </div>
  )

  const MultiSelect = ({
    options,
    selected,
    onChange,
    label,
    placeholder = 'Select all that apply'
  }: {
    options: string[]
    selected: string[]
    onChange: (selected: string[]) => void
    label: string
    placeholder?: string
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, option])
                } else {
                  onChange(selected.filter(item => item !== option))
                }
              }}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Great job cooking!</h3>
              <p className="text-gray-600 mt-2">
                You completed {stepsCompleted} of {totalSteps} steps ({completionRate.toFixed(0)}%) in {totalTime} minutes
              </p>
            </div>

            <StarRating
              value={feedbackData.overallRating}
              onChange={(rating) => setFeedbackData(prev => ({ ...prev, overallRating: rating }))}
              label="How would you rate your overall cooking experience?"
            />

            <StarRating
              value={feedbackData.difficultyRating}
              onChange={(rating) => setFeedbackData(prev => ({ ...prev, difficultyRating: rating }))}
              label="How difficult was this recipe compared to what you expected?"
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">What worked well?</h3>
            </div>

            <MultiSelect
              label="What aspects of your cooking experience worked well?"
              options={[
                'Instructions were clear and easy to follow',
                'AI guidance was helpful and timely',
                'Recipe adaptation fit my skill level perfectly',
                'Timing predictions were accurate',
                'Ingredients were easy to find',
                'Final result matched my expectations',
                'App was responsive and easy to use',
                'Step-by-step guidance kept me on track'
              ]}
              selected={feedbackData.whatWorkedWell}
              onChange={(selected) => setFeedbackData(prev => ({ ...prev, whatWorkedWell: selected }))}
            />

            <MultiSelect
              label="What was confusing or challenging?"
              options={[
                'Instructions were unclear or ambiguous',
                'Timing estimates were off',
                'Missing equipment I needed',
                'Ingredients were hard to find',
                'Recipe was more difficult than expected',
                'AI guidance was confusing',
                'App had technical issues',
                'Steps felt rushed or too fast'
              ]}
              selected={feedbackData.whatWasConfusing}
              onChange={(selected) => setFeedbackData(prev => ({ ...prev, whatWasConfusing: selected }))}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">AI Features Feedback</h3>
              <p className="text-gray-600">Help us improve our AI cooking assistant</p>
            </div>

            <StarRating
              value={feedbackData.aiHelpfulnessRating}
              onChange={(rating) => setFeedbackData(prev => ({ ...prev, aiHelpfulnessRating: rating }))}
              label="Overall, how helpful was the AI cooking assistant?"
            />

            {aiFeatures.hasAdaptations && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Recipe Adaptation</h4>
                <StarRating
                  value={feedbackData.aiFeatures.recipeAdaptation.helpful}
                  onChange={(rating) => setFeedbackData(prev => ({
                    ...prev,
                    aiFeatures: {
                      ...prev.aiFeatures,
                      recipeAdaptation: { ...prev.aiFeatures.recipeAdaptation, helpful: rating }
                    }
                  }))}
                  label="How helpful was the recipe adaptation for your skill level?"
                />
              </div>
            )}

            {aiFeatures.usedCookingAssistant && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Cooking Assistant</h4>
                <StarRating
                  value={feedbackData.aiFeatures.cookingAssistant.helpful}
                  onChange={(rating) => setFeedbackData(prev => ({
                    ...prev,
                    aiFeatures: {
                      ...prev.aiFeatures,
                      cookingAssistant: { ...prev.aiFeatures.cookingAssistant, helpful: rating }
                    }
                  }))}
                  label="How helpful was the step-by-step cooking guidance?"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which cooking assistant feature was most valuable?
                  </label>
                  <select
                    value={feedbackData.aiFeatures.cookingAssistant.mostValuableFeature}
                    onChange={(e) => setFeedbackData(prev => ({
                      ...prev,
                      aiFeatures: {
                        ...prev.aiFeatures,
                        cookingAssistant: { ...prev.aiFeatures.cookingAssistant, mostValuableFeature: e.target.value }
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Select most valuable feature</option>
                    <option value="step_guidance">Step-by-step guidance</option>
                    <option value="timing_alerts">Timing alerts and reminders</option>
                    <option value="troubleshooting">Troubleshooting help</option>
                    <option value="tips_warnings">Cooking tips and safety warnings</option>
                    <option value="alternatives">Alternative suggestions</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Help Us Improve</h3>
              <p className="text-gray-600">Your suggestions help make NIBBBLE better</p>
            </div>

            <MultiSelect
              label="What improvements would be most helpful?"
              options={[
                'More detailed cooking instructions',
                'Better timing predictions',
                'More recipe adaptations for my skill level',
                'Visual cues or images for cooking steps',
                'Better ingredient substitution suggestions',
                'More cooking tips and techniques',
                'Improved app performance',
                'Better mobile experience',
                'More recipe variety',
                'Nutritional information'
              ]}
              selected={feedbackData.suggestedImprovements}
              onChange={(selected) => setFeedbackData(prev => ({ ...prev, suggestedImprovements: selected }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any additional comments or suggestions?
              </label>
              <textarea
                value={feedbackData.additionalComments}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, additionalComments: e.target.value }))}
                placeholder="Tell us anything else about your experience..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                rows={3}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Final Questions</h3>
              <p className="text-gray-600">Help us understand your overall experience</p>
            </div>

            <StarRating
              value={feedbackData.likelyToReturnRating}
              onChange={(rating) => setFeedbackData(prev => ({ ...prev, likelyToReturnRating: rating }))}
              label="How likely are you to use NIBBBLE for cooking again?"
            />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Would you recommend NIBBBLE to a friend?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={feedbackData.wouldRecommend === true}
                    onChange={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: true }))}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={feedbackData.wouldRecommend === false}
                    onChange={() => setFeedbackData(prev => ({ ...prev, wouldRecommend: false }))}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">No</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What was the context for your cooking today?
              </label>
              <select
                value={feedbackData.cookingContext}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, cookingContext: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="general">General cooking</option>
                <option value="weeknight_dinner">Quick weeknight dinner</option>
                <option value="weekend_experiment">Weekend cooking experiment</option>
                <option value="meal_prep">Meal prep</option>
                <option value="special_occasion">Special occasion</option>
                <option value="learning_new_skill">Learning new cooking skill</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate your cooking skill level? (1 = Beginner, 5 = Expert)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={feedbackData.skillLevel}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, skillLevel: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 - Beginner</span>
                <span className="font-medium">{feedbackData.skillLevel}</span>
                <span>10 - Expert</span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(feedbackData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Alpha Feedback</h2>
              <p className="text-sm text-gray-600">{recipeTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < currentStep ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Submit Feedback
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}