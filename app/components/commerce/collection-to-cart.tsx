'use client'

import React, { useState } from 'react'
import { ShoppingCart, Loader2, DollarSign, Package, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { ShoppingCartService } from "@/lib/services/shopping-cart-service"
import type { NibbleCollection } from '@/types/nibble-collections'

interface CollectionToCartProps {
  collection: NibbleCollection
  userId: string
  onAddToCart?: () => void
  className?: string
}

export default function CollectionToCart({ 
  collection, 
  userId, 
  onAddToCart,
  className = '' 
}: CollectionToCartProps) {
  const [adding, setAdding] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleAddCollectionToCart = async () => {
    if (!collection.recipes || collection.recipes.length === 0) {
      toast({
        title: "No Recipes",
        description: "This collection doesn't have any recipes to add",
        variant: "destructive"
      })
      return
    }

    try {
      setAdding(true)
      
      let totalAdded = 0
      let totalErrors: string[] = []

      // Process each recipe in the collection
      for (const recipe of collection.recipes) {
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
          totalErrors.push(`${recipe.title}: No ingredients found`)
          continue
        }

        // Prepare ingredients
        const ingredients = recipe.ingredients.map(ingredient => ({
          name: typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient.ingredient,
          quantity: typeof ingredient === 'string' ? 1 : ingredient.amount || 1,
          unit: typeof ingredient === 'string' ? 'item' : ingredient.unit || 'item'
        }))

        // Add recipe to cart
        const result = await ShoppingCartService.addRecipeToCart(
          userId,
          recipe.id,
          ingredients,
          recipe.servings || 4
        )

        if (result.success) {
          totalAdded += result.addedItems
        }
        
        totalErrors.push(...result.errors)
      }

      // Show results
      if (totalAdded > 0) {
        toast({
          title: "Collection Added!",
          description: `${totalAdded} ingredients from ${collection.recipes.length} recipes added to your cart`
        })
        onAddToCart?.()
      }

      if (totalErrors.length > 0 && totalAdded === 0) {
        toast({
          title: "Failed to Add Collection",
          description: "Unable to add any ingredients from this collection",
          variant: "destructive"
        })
      } else if (totalErrors.length > 0) {
        toast({
          title: "Partially Added",
          description: `${totalAdded} items added, ${totalErrors.length} items had issues`,
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('Failed to add collection to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add collection to cart",
        variant: "destructive"
      })
    } finally {
      setAdding(false)
    }
  }

  const estimatedCost = collection.recipes?.reduce((sum, recipe) => {
    // Rough cost estimation - would be more accurate with real pricing
    const ingredientCount = recipe.ingredients?.length || 0
    return sum + (ingredientCount * 2.5) // ~$2.50 per ingredient average
  }, 0) || 0

  const totalIngredients = collection.recipes?.reduce((sum, recipe) => 
    sum + (recipe.ingredients?.length || 0), 0
  ) || 0

  const estimatedTime = collection.recipes?.reduce((sum, recipe) => 
    sum + (recipe.prepTime || 30), 0
  ) || 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shop Collection
          </span>
          <Badge variant="outline">
            {collection.recipes?.length || 0} recipes
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Collection Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Package className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-2xl font-bold">{totalIngredients}</p>
            <p className="text-xs text-muted-foreground">ingredients</p>
          </div>
          
          <div className="space-y-1">
            <DollarSign className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-2xl font-bold">${estimatedCost.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">estimated</p>
          </div>
          
          <div className="space-y-1">
            <Clock className="h-4 w-4 mx-auto text-muted-foreground" />
            <p className="text-2xl font-bold">{Math.round(estimatedTime / 60)}h</p>
            <p className="text-xs text-muted-foreground">cook time</p>
          </div>
        </div>

        <Separator />

        {/* Collection Metadata */}
        <div className="space-y-2">
          <h4 className="font-medium">{collection.title}</h4>
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {collection.description}
            </p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {collection.mood_tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {collection.cuisine_type && (
              <Badge variant="outline" className="text-xs">
                {collection.cuisine_type}
              </Badge>
            )}
            {(collection.mood_tags?.length || 0) > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(collection.mood_tags?.length || 0) - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Recipe List (expandable) */}
        {collection.recipes && collection.recipes.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-sm"
            >
              {expanded ? 'Hide' : 'Show'} Recipe Details
              <span className="text-xs">
                {expanded ? '▲' : '▼'}
              </span>
            </Button>
            
            {expanded && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {collection.recipes.map((recipe, index) => (
                  <div key={recipe.id || index} className="text-sm p-2 bg-muted rounded">
                    <div className="font-medium">{recipe.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {recipe.ingredients?.length || 0} ingredients • 
                      {recipe.prepTime || 30}min cook time
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Action Button */}
        <Button
          onClick={handleAddCollectionToCart}
          disabled={adding || !collection.recipes?.length}
          className="w-full"
          size="lg"
        >
          {adding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding to Cart...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add All to Cart
            </>
          )}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Prices are estimated. Final costs may vary by store and availability.
        </p>
      </CardContent>
    </Card>
  )
}