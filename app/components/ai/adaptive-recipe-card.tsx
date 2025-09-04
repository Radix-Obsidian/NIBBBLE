'use client'

import { useState, useEffect } from 'react'
import { Clock, ChefHat, Users, Zap, AlertTriangle, CheckCircle, Lightbulb, ArrowRight } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { aiRecipeAdapter } from '@/lib/services/ai-recipe-adapter'
import { mlPredictionService } from '@/lib/services/ml-prediction-service'
import { 
  VideoRecipe, 
  AICookingProfile, 
  RecipeAdaptation, 
  IngredientSubstitution, 
  CookingInsight 
} from '@/types'
import { logger } from '@/lib/logger'

export interface AdaptiveRecipeCardProps {
  recipe: VideoRecipe;
  onStartCooking?: (recipe: VideoRecipe, adaptations?: RecipeAdaptation[]) => void;
  className?: string;
}

export function AdaptiveRecipeCard({ recipe, onStartCooking, className }: AdaptiveRecipeCardProps) {
  const { user } = useAuth()
  const [adaptedData, setAdaptedData] = useState<{
    adaptedRecipe: VideoRecipe;
    adaptations: RecipeAdaptation[];
    substitutions: IngredientSubstitution[];
    insights: CookingInsight[];
    successPrediction: number;
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAdaptations, setShowAdaptations] = useState(false)
  const [selectedAdaptations, setSelectedAdaptations] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadAdaptedRecipe()
    }
  }, [user, recipe.id])

  const loadAdaptedRecipe = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await aiRecipeAdapter.getAdaptedRecipe(recipe.id, user.id)
      setAdaptedData(result)
    } catch (error) {
      logger.error('Failed to load adapted recipe:', error)
      // Set basic prediction if adaptation fails
      try {
        const prediction = await mlPredictionService.predictCookingSuccess({
          userId: user.id,
          recipeId: recipe.id
        })
        setAdaptedData({
          adaptedRecipe: recipe,
          adaptations: [],
          substitutions: [],
          insights: [],
          successPrediction: prediction.successScore
        })
      } catch (predError) {
        logger.error('Failed to get success prediction:', predError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStartCooking = () => {
    if (!adaptedData) {
      onStartCooking?.(recipe)
      return
    }

    const relevantAdaptations = adaptedData.adaptations.filter(a => 
      selectedAdaptations.includes(a.adaptationType)
    )

    onStartCooking?.(adaptedData.adaptedRecipe, relevantAdaptations)
  }

  const toggleAdaptation = (adaptationType: string) => {
    setSelectedAdaptations(prev => 
      prev.includes(adaptationType)
        ? prev.filter(a => a !== adaptationType)
        : [...prev, adaptationType]
    )
  }

  const getSuccessColor = (score: number) => {
    if (score >= 0.8) return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    if (score >= 0.6) return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle }
    return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle }
  }

  const getAdaptationColor = (adaptationType: string) => {
    const colorMap: Record<string, string> = {
      'skill_adjusted': 'bg-blue-100 text-blue-800',
      'dietary_modified': 'bg-green-100 text-green-800',
      'equipment_adapted': 'bg-purple-100 text-purple-800',
      'portion_scaled': 'bg-orange-100 text-orange-800',
      'ingredient_substituted': 'bg-pink-100 text-pink-800',
      'time_optimized': 'bg-indigo-100 text-indigo-800'
    }
    return colorMap[adaptationType] || 'bg-gray-100 text-gray-800'
  }

  const getAdaptationIcon = (adaptationType: string) => {
    switch (adaptationType) {
      case 'skill_adjusted': return <ChefHat className="w-4 h-4" />
      case 'dietary_modified': return <CheckCircle className="w-4 h-4" />
      case 'equipment_adapted': return <Zap className="w-4 h-4" />
      case 'time_optimized': return <Clock className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card className={`p-6 animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </Card>
    )
  }

  const displayRecipe = adaptedData?.adaptedRecipe || recipe
  const successData = adaptedData?.successPrediction ? getSuccessColor(adaptedData.successPrediction) : null

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Recipe Image */}
      {displayRecipe.thumbnailUrl && (
        <div className="aspect-video bg-gray-100">
          <img 
            src={displayRecipe.thumbnailUrl} 
            alt={displayRecipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Recipe Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900">{displayRecipe.title}</h3>
            {successData && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${successData.bg} ${successData.text}`}>
                <successData.icon className="w-3 h-3" />
                <span>{Math.round(adaptedData!.successPrediction * 100)}% success</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm">{displayRecipe.description}</p>
        </div>

        {/* Recipe Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{displayRecipe.totalTimeMinutes} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <ChefHat className="w-4 h-4" />
            <span className="capitalize">{displayRecipe.difficultyLevel}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{displayRecipe.servings} servings</span>
          </div>
        </div>

        {/* AI Insights */}
        {adaptedData?.insights && adaptedData.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">AI Insights</h4>
            <div className="space-y-2">
              {adaptedData.insights.slice(0, 2).map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{insight.insightContent}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adaptations Available */}
        {adaptedData?.adaptations && adaptedData.adaptations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">Available Adaptations</h4>
              <button
                onClick={() => setShowAdaptations(!showAdaptations)}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
              >
                <span>{showAdaptations ? 'Hide' : 'Show'} Details</span>
                <ArrowRight className={`w-4 h-4 transition-transform ${showAdaptations ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Adaptation Tags */}
            <div className="flex flex-wrap gap-2">
              {adaptedData.adaptations.map((adaptation, index) => (
                <button
                  key={index}
                  onClick={() => toggleAdaptation(adaptation.adaptationType)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedAdaptations.includes(adaptation.adaptationType)
                      ? getAdaptationColor(adaptation.adaptationType)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {getAdaptationIcon(adaptation.adaptationType)}
                  <span>{adaptation.adaptationType.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            {/* Detailed Adaptations */}
            {showAdaptations && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {adaptedData.adaptations.map((adaptation, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium ${getAdaptationColor(adaptation.adaptationType)}`}>
                        {getAdaptationIcon(adaptation.adaptationType)}
                        <span className="capitalize">{adaptation.adaptationType.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(adaptation.confidenceScore * 100)}% confidence
                      </span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <p className="text-sm text-gray-700">Reasons:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {adaptation.adaptationReasons.map((reason, reasonIndex) => (
                          <li key={reasonIndex} className="flex items-start space-x-1">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smart Substitutions */}
        {adaptedData?.substitutions && adaptedData.substitutions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Suggested Substitutions</h4>
            <div className="space-y-2">
              {adaptedData.substitutions.slice(0, 3).map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">{sub.originalIngredient}</span>
                    <ArrowRight className="w-4 h-4 inline mx-2 text-gray-400" />
                    <span className="font-medium text-green-700">{sub.substituteIngredient}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {Math.round(sub.successRate * 100)}% success rate
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <Button
            onClick={handleStartCooking}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Start Cooking
            {selectedAdaptations.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {selectedAdaptations.length} adaptations
              </span>
            )}
          </Button>
          <Button variant="outline" className="px-4">
            Save Recipe
          </Button>
        </div>

        {/* Success Prediction Details */}
        {adaptedData?.successPrediction && (
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Success prediction based on your cooking profile, skills, and preferences
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}