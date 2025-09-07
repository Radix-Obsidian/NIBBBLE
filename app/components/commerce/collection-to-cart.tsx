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
    // Note: NibbleCollection doesn't have recipes directly
    // This would need to be fetched separately via the collection service
    // For now, show a message that this feature is coming soon
    toast({
      title: "Feature Coming Soon",
      description: "Adding entire collections to cart will be available soon",
      variant: "default"
    })
  }

  // Note: These would be calculated from collection items once the proper data structure is implemented
  const estimatedCost = 0
  const totalIngredients = 0
  const estimatedTime = 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shop Collection
          </span>
          <Badge variant="outline">
            0 items
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

        {/* Recipe List - Coming Soon */}
        <div className="text-sm text-muted-foreground text-center py-4">
          Recipe details will be displayed here once the collection structure is implemented
        </div>

        <Separator />

        {/* Action Button */}
        <Button
          onClick={handleAddCollectionToCart}
          disabled={adding}
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