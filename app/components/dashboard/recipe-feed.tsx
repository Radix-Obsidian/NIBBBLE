'use client'

import { useState } from 'react'
import { Recipe } from '@/types'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { logger } from '@/lib/logger'

interface RecipeFeedProps {
  recipes: Recipe[]
  title?: string
}

export function RecipeFeed({ recipes, title = 'Recent Recipes' }: RecipeFeedProps) {
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set())

  const handleLike = (recipeId: string) => {
    logger.info('Recipe liked', { recipeId })
    setLikedRecipes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recipeId)) {
        newSet.delete(recipeId)
      } else {
        newSet.add(recipeId)
      }
      return newSet
    })
    // TODO: Implement like functionality
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">{recipe.title}</h3>
              <p className="text-gray-600">{recipe.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{recipe.prepTime + recipe.cookTime} min</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{recipe.difficulty}</span>
                </div>
                
                <Button
                  onClick={() => handleLike(recipe.id)}
                  variant={likedRecipes.has(recipe.id) ? 'default' : 'outline'}
                  size="sm"
                >
                  {likedRecipes.has(recipe.id) ? '❤️' : '🤍'} Like
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
