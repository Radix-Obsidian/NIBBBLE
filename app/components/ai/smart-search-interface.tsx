'use client'

import { useState, useEffect } from 'react'
import { Search, Brain, Clock, ChefHat, Zap, Sparkles } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useAuth } from '@/hooks/useAuth'
import { aiRecipeAdapter } from '@/lib/services/ai-recipe-adapter'
import { aiCookingService } from '@/lib/services/ai-cooking-service'
import { AICookingProfile, VideoRecipe } from '@/types'
import { logger } from '@/lib/logger'

export interface SmartSearchResult {
  recipe: VideoRecipe;
  matchScore: number;
  adaptations: string[];
  predictedSuccess: number;
  reasoning: string[];
}

export interface SmartSearchProps {
  onRecipeSelect?: (recipe: VideoRecipe) => void;
  className?: string;
}

export function SmartSearchInterface({ onRecipeSelect, className }: SmartSearchProps) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SmartSearchResult[]>([])
  const [aiProfile, setAiProfile] = useState<AICookingProfile | null>(null)
  const [searchMode, setSearchMode] = useState<'traditional' | 'smart'>('smart')
  const [context, setContext] = useState({
    timeAvailable: '',
    mood: '',
    ingredientsOnHand: ''
  })
  const [suggestions, setSuggestions] = useState<{
    quickMeals: string[];
    skillBuilding: string[];
    seasonal: string[];
    trending: string[];
  }>({
    quickMeals: [],
    skillBuilding: [],
    seasonal: [],
    trending: []
  })

  useEffect(() => {
    loadAIProfile()
    loadSearchSuggestions()
  }, [user])

  const loadAIProfile = async () => {
    if (!user) return
    try {
      const profile = await aiCookingService.getAICookingProfile(user.id)
      setAiProfile(profile)
    } catch (error) {
      logger.error('Failed to load AI profile:', error)
    }
  }

  const loadSearchSuggestions = async () => {
    if (!user || !aiProfile) return
    try {
      // Get personalized suggestions based on user profile
      const quickMeals = [
        '15-minute pasta dishes',
        'One-pan meals',
        'Quick stir-fries',
        'Microwave meals'
      ]
      const skillBuilding = [
        'Knife skills practice',
        'Basic sauce making',
        'Bread baking basics',
        'Flavor pairing'
      ]
      const seasonal = [
        'Winter comfort foods',
        'Fresh spring dishes',
        'Summer grilling',
        'Fall harvest recipes'
      ]
      const trending = [
        'Air fryer recipes',
        'Plant-based proteins',
        'Fermented foods',
        'Global fusion'
      ]

      setSuggestions({ quickMeals, skillBuilding, seasonal, trending })
    } catch (error) {
      logger.error('Failed to load suggestions:', error)
    }
  }

  const handleSmartSearch = async (searchQuery?: string) => {
    if (!user || !aiProfile) {
      alert('Please complete your AI cooking profile first')
      return
    }

    const finalQuery = searchQuery || query
    if (!finalQuery.trim() && !context.mood && !context.ingredientsOnHand) return

    setSearching(true)
    try {
      const recommendations = await aiRecipeAdapter.getSmartRecommendations(
        user.id,
        {
          timeAvailable: context.timeAvailable ? parseInt(context.timeAvailable) : undefined,
          mood: context.mood || undefined,
          ingredientsOnHand: context.ingredientsOnHand 
            ? context.ingredientsOnHand.split(',').map(i => i.trim())
            : undefined
        }
      )

      // Filter by search query if provided
      let filteredResults = recommendations
      if (finalQuery.trim()) {
        filteredResults = recommendations.filter(r => 
          r.recipe.title.toLowerCase().includes(finalQuery.toLowerCase()) ||
          r.recipe.description?.toLowerCase().includes(finalQuery.toLowerCase()) ||
          r.recipe.tags.some(tag => tag.toLowerCase().includes(finalQuery.toLowerCase()))
        )
      }

      setResults(filteredResults.map(r => ({
        recipe: r.recipe,
        matchScore: r.matchScore,
        adaptations: r.adaptations.map(a => a.adaptationType),
        predictedSuccess: r.predictedSuccess,
        reasoning: r.reasoning
      })))
    } catch (error) {
      logger.error('Smart search failed:', error)
      alert('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    handleSmartSearch(suggestion)
  }

  const getSuccessColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800'
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Profile Status */}
      {!aiProfile && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">Complete your AI cooking profile for personalized recommendations</p>
              <p className="text-sm text-orange-600">Get recipe suggestions tailored to your skills, preferences, and equipment</p>
            </div>
          </div>
        </Card>
      )}

      {/* Search Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recipe Discovery</h2>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setSearchMode('traditional')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              searchMode === 'traditional'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Traditional
          </button>
          <button
            onClick={() => setSearchMode('smart')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
              searchMode === 'smart'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered</span>
          </button>
        </div>
      </div>

      {/* Smart Search Interface */}
      {searchMode === 'smart' && (
        <>
          {/* Main Search */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    icon={<Search className="w-5 h-5" />}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What would you like to cook? (e.g., 'something quick and healthy')"
                    onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
                  />
                </div>
                <Button 
                  onClick={() => handleSmartSearch()} 
                  disabled={searching}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {searching ? 'Searching...' : 'Find Recipes'}
                </Button>
              </div>

              {/* Context Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Time Available</label>
                  <select
                    value={context.timeAvailable}
                    onChange={(e) => setContext({ ...context, timeAvailable: e.target.value })}
                    className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm"
                  >
                    <option value="">Any time</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2+ hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mood</label>
                  <select
                    value={context.mood}
                    onChange={(e) => setContext({ ...context, mood: e.target.value })}
                    className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm"
                  >
                    <option value="">Any mood</option>
                    <option value="comfort">Comfort food</option>
                    <option value="healthy">Healthy & fresh</option>
                    <option value="indulgent">Something indulgent</option>
                    <option value="adventurous">Try something new</option>
                    <option value="nostalgic">Nostalgic favorites</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Ingredients On Hand</label>
                  <Input
                    value={context.ingredientsOnHand}
                    onChange={(e) => setContext({ ...context, ingredientsOnHand: e.target.value })}
                    placeholder="chicken, rice, broccoli..."
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Suggestions */}
          {suggestions.quickMeals.length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Quick Suggestions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[...suggestions.quickMeals, ...suggestions.skillBuilding].slice(0, 8).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* AI-Powered Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">AI Recommendations for You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result) => (
                  <Card key={result.recipe.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="space-y-3">
                      {/* Recipe Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{result.recipe.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.recipe.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(result.matchScore)}`}>
                          {Math.round(result.matchScore * 100)}% match
                        </span>
                      </div>

                      {/* Recipe Details */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{result.recipe.totalTimeMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ChefHat className="w-4 h-4" />
                          <span className="capitalize">{result.recipe.difficultyLevel}</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getSuccessColor(result.predictedSuccess)}`}>
                          <Zap className="w-4 h-4" />
                          <span>{Math.round(result.predictedSuccess * 100)}% success</span>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      {result.reasoning.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Why this recipe:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {result.reasoning.slice(0, 2).map((reason, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <span className="text-purple-600 mt-1">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Adaptations */}
                      {result.adaptations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {result.adaptations.map((adaptation, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {adaptation.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        onClick={() => onRecipeSelect?.(result.recipe)}
                        className="w-full text-sm"
                        variant="outline"
                      >
                        View Recipe
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && !searching && query && (
            <Card className="p-8 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or context filters</p>
              <Button onClick={() => handleSmartSearch()} variant="outline">
                Search Again
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Traditional Search Fallback */}
      {searchMode === 'traditional' && (
        <Card className="p-4">
          <div className="text-center text-gray-600">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Traditional search interface would go here</p>
            <p className="text-sm">Switch to AI-Powered mode for personalized recommendations</p>
          </div>
        </Card>
      )}
    </div>
  )
}