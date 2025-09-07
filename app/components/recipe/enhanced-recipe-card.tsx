'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ChefHat, User, Star, ShoppingCart, DollarSign, Plus, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ShoppingCartService } from "@/lib/services/shopping-cart-service"
import type { Recipe } from '@/types'

export interface EnhancedRecipeCardProps {
  recipe: Recipe & {
    estimatedCost?: number
    ingredientAvailability?: {
      available: number
      total: number
      unavailable: string[]
    }
  }
  userId: string
  className?: string
  onLike?: (id: string) => void
  onView?: (id: string) => void
  onAddToCart?: (recipeId: string) => void
  showCommerceFeatures?: boolean
}

export default function EnhancedRecipeCard({ 
  recipe, 
  userId,
  className = '', 
  onLike, 
  onView,
  onAddToCart,
  showCommerceFeatures = true
}: EnhancedRecipeCardProps) {
  const [addingToCart, setAddingToCart] = useState(false)
  const [showIngredients, setShowIngredients] = useState(false)

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'hard':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      toast({
        title: "No Ingredients",
        description: "This recipe doesn't have ingredient information",
        variant: "destructive"
      })
      return
    }

    try {
      setAddingToCart(true)
      
      const ingredients = recipe.ingredients.map(ingredient => ({
        name: typeof ingredient === 'string' ? ingredient : ingredient.name || 'Unknown ingredient',
        quantity: typeof ingredient === 'string' ? 1 : ingredient.amount || 1,
        unit: typeof ingredient === 'string' ? 'item' : ingredient.unit || 'item'
      }))

      const result = await ShoppingCartService.addRecipeToCart(
        userId,
        recipe.id || '',
        ingredients,
        recipe.servings || 4
      )

      if (result.success) {
        toast({
          title: "Added to Cart!",
          description: `${result.addedItems} ingredients added to your shopping cart`
        })
        onAddToCart?.(recipe.id || '')
      } else if (result.errors.length > 0) {
        toast({
          title: "Partially Added",
          description: `${result.addedItems} items added, ${result.errors.length} failed`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to add recipe to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add ingredients to cart",
        variant: "destructive"
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const availabilityPercentage = recipe.ingredientAvailability 
    ? Math.round((recipe.ingredientAvailability.available / recipe.ingredientAvailability.total) * 100)
    : null

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      <div className="relative">
        <Link href={`/recipe/${recipe.id || 'unknown'}`} onClick={() => onView?.(recipe.id || '')}>
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-200 overflow-hidden rounded-t-lg">
            {recipe.images && recipe.images.length > 0 ? (
              <Image
                src={recipe.images[0]}
                alt={recipe.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                <ChefHat className="w-12 h-12 text-orange-400" />
              </div>
            )}
            
            {/* Quick Action Overlay */}
            {showCommerceFeatures && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 bg-white/90 hover:bg-white"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Cost Badge */}
            {showCommerceFeatures && recipe.estimatedCost && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {recipe.estimatedCost.toFixed(2)}
                </Badge>
              </div>
            )}
          </div>
        </Link>

        <CardContent className="p-4">
          <Link href={`/recipe/${recipe.id || 'unknown'}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {recipe.title}
            </h3>
          </Link>

          {recipe.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Recipe Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              {recipe.prepTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(recipe.prepTime)}</span>
                </div>
              )}
              
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{recipe.servings}</span>
                </div>
              )}
              
              {recipe.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{recipe.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {recipe.difficulty && (
              <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
            )}
          </div>

          {/* Ingredient Availability */}
          {showCommerceFeatures && recipe.ingredientAvailability && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Ingredient Availability</span>
                <span className={availabilityPercentage === 100 ? 'text-green-600' : availabilityPercentage! > 80 ? 'text-yellow-600' : 'text-red-600'}>
                  {availabilityPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    availabilityPercentage === 100 ? 'bg-green-500' : 
                    availabilityPercentage! > 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {recipe.ingredientAvailability.available} of {recipe.ingredientAvailability.total} available
              </div>
            </div>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {showCommerceFeatures && (
          <CardFooter className="p-4 pt-0">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault()
                  setShowIngredients(!showIngredients)
                }}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                {recipe.ingredients?.length || 0} Ingredients
              </Button>
              
              <Button
                size="sm"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={addingToCart || !recipe.ingredients?.length}
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Expanded Ingredients List */}
            {showIngredients && recipe.ingredients && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Ingredients:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {recipe.ingredients.slice(0, 8).map((ingredient, index) => {
                    const ingredientName = typeof ingredient === 'string' 
                      ? ingredient 
                      : ingredient.name || 'Unknown ingredient'
                    
                    const isUnavailable = recipe.ingredientAvailability?.unavailable.includes(ingredientName)
                    
                    return (
                      <div key={index} className={`text-xs flex items-center justify-between ${isUnavailable ? 'text-red-600' : 'text-muted-foreground'}`}>
                        <span className="line-clamp-1">{ingredientName}</span>
                        {isUnavailable && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            N/A
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                  {recipe.ingredients.length > 8 && (
                    <div className="text-xs text-muted-foreground italic">
                      +{recipe.ingredients.length - 8} more...
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardFooter>
        )}
      </div>
    </Card>
  )
}