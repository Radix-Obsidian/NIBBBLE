'use client';

import React, { useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Clock, Users, ChefHat, Scale } from 'lucide-react';
import { VideoRecipe, VideoIngredient, NutritionInfo } from '@/types';
import { scaleRecipe, getCommonServingSizes, formatScaledAmount } from '@/lib/utils/recipe-scaling';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface RecipeViewProps {
  recipe: VideoRecipe;
  showCreatorInfo?: boolean;
}

export default function RecipeView({ recipe, showCreatorInfo = true }: RecipeViewProps) {
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scaledIngredients, setScaledIngredients] = useState(recipe.ingredients);
  const [scaledNutrition, setScaledNutrition] = useState(recipe.nutrition);

  // Get common serving sizes for quick scaling
  const commonServingSizes = getCommonServingSizes(recipe.servings);

  // Handle serving size changes
  const handleServingsChange = useCallback((newServings: number) => {
    if (newServings <= 0 || newServings > 50) return;

    setCurrentServings(newServings);
    
    // Scale ingredients
    try {
      const scaled = scaleRecipe(recipe.ingredients, recipe.servings, newServings);
      setScaledIngredients(scaled);
      
      // Scale nutrition
      const scaleFactor = newServings / recipe.servings;
      const newNutrition = {
        ...recipe.nutrition,
        calories: Math.round(recipe.nutrition.calories * scaleFactor),
        protein: Math.round(recipe.nutrition.protein * scaleFactor * 10) / 10,
        fat: Math.round(recipe.nutrition.fat * scaleFactor * 10) / 10,
        carbs: Math.round(recipe.nutrition.carbs * scaleFactor * 10) / 10,
        fiber: recipe.nutrition.fiber ? Math.round(recipe.nutrition.fiber * scaleFactor * 10) / 10 : undefined,
        sugar: recipe.nutrition.sugar ? Math.round(recipe.nutrition.sugar * scaleFactor * 10) / 10 : undefined,
        sodium: recipe.nutrition.sodium ? Math.round(recipe.nutrition.sodium * scaleFactor) : undefined,
        cholesterol: recipe.nutrition.cholesterol ? Math.round(recipe.nutrition.cholesterol * scaleFactor) : undefined
      };
      setScaledNutrition(newNutrition);
    } catch (error) {
      console.error('Failed to scale recipe:', error);
    }
  }, [recipe.ingredients, recipe.servings, recipe.nutrition]);

  // Video controls
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Format time display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Recipe Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{recipe.description}</p>
        )}
        
        {/* Recipe Meta */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Prep: {formatTime(recipe.prepTimeMinutes)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ChefHat className="w-4 h-4" />
            <span>Cook: {formatTime(recipe.cookTimeMinutes)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficultyLevel)}`}>
            {recipe.difficultyLevel}
          </div>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Video Player */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video
            src={recipe.videoUrl}
            className="w-full h-full object-cover"
            poster={recipe.thumbnailUrl}
            controls
            muted={isMuted}
          />
          
          {/* Custom Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Creator Info */}
      {showCreatorInfo && (
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            {recipe.creator.profileImageUrl ? (
              <img
                src={recipe.creator.profileImageUrl}
                alt={recipe.creator.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{recipe.creator.name}</h3>
              {recipe.creator.bio && (
                <p className="text-gray-600">{recipe.creator.bio}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Recipe Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Ingredients</h2>
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Scale</span>
              </div>
            </div>

            {/* Servings Control */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Servings:</label>
                <span className="text-lg font-semibold text-blue-600">{currentServings}</span>
              </div>
              
              {/* Quick serving size buttons */}
              <div className="flex flex-wrap gap-2">
                {commonServingSizes.map((servings) => (
                  <Button
                    key={servings}
                    variant={servings === currentServings ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleServingsChange(servings)}
                    className="text-xs"
                  >
                    {servings}
                  </Button>
                ))}
              </div>
              
              {/* Custom servings input */}
              <div className="mt-3 flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={currentServings}
                  onChange={(e) => handleServingsChange(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">servings</span>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-3">
              {scaledIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">
                      {formatScaledAmount(ingredient.amount, ingredient.unit)}
                    </span>
                    <span className="ml-2 text-gray-600">{ingredient.name}</span>
                  </div>
                  {ingredient.notes && (
                    <span className="text-sm text-gray-500 italic">{ingredient.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Instructions Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Nutrition Facts */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Nutrition Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{scaledNutrition.calories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{scaledNutrition.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{scaledNutrition.fat}g</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{scaledNutrition.carbs}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
            </div>
            
            {/* Additional nutrition info */}
            {(scaledNutrition.fiber || scaledNutrition.sugar || scaledNutrition.sodium || scaledNutrition.cholesterol) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {scaledNutrition.fiber && (
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{scaledNutrition.fiber}g</div>
                      <div className="text-gray-600">Fiber</div>
                    </div>
                  )}
                  {scaledNutrition.sugar && (
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{scaledNutrition.sugar}g</div>
                      <div className="text-gray-600">Sugar</div>
                    </div>
                  )}
                  {scaledNutrition.sodium && (
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{scaledNutrition.sodium}mg</div>
                      <div className="text-gray-600">Sodium</div>
                    </div>
                  )}
                  {scaledNutrition.cholesterol && (
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{scaledNutrition.cholesterol}mg</div>
                      <div className="text-gray-600">Cholesterol</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              * Nutrition information is per serving and may vary based on actual ingredients used
            </div>
          </Card>
        </div>
      </div>

      {/* Recipe Actions */}
      <div className="flex justify-center space-x-4">
        <Button size="lg" className="px-8">
          Save Recipe
        </Button>
        <Button variant="outline" size="lg" className="px-8">
          Share
        </Button>
        <Button variant="outline" size="lg" className="px-8">
          Print
        </Button>
      </div>
    </div>
  );
}
