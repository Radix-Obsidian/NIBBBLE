'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, Filter, ShoppingCart, Star, Loader2, MapPin, DollarSign } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { searchEnhancedProducts, EnhancedProduct } from "@/lib/services/enhanced-grocery-service"
import { ShoppingCartService } from "@/lib/services/shopping-cart-service"
import { debounce } from 'lodash'

interface ProductSearchProps {
  userId: string
  onAddToCart?: (product: EnhancedProduct) => void
  initialQuery?: string
}

interface SearchFilters {
  category?: string
  maxPrice?: number
  organic?: boolean
  dietaryRestrictions?: string[]
  healthLabels?: string[]
}

export default function ProductSearch({ userId, onAddToCart, initialQuery = '' }: ProductSearchProps) {
  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<EnhancedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set())

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (!searchQuery.trim()) {
        setProducts([])
        return
      }

      try {
        setLoading(true)
        const results = await searchEnhancedProducts(
          searchQuery,
          undefined, // locationId - would come from user preferences
          searchFilters,
          20
        )
        setProducts(results)
      } catch (error) {
        console.error('Search failed:', error)
        toast({
          title: "Search Error",
          description: "Failed to search products. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Effect to trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters)
  }, [query, filters, debouncedSearch])

  const handleAddToCart = async (product: EnhancedProduct) => {
    try {
      setAddingToCart(prev => new Set([...prev, product.id]))
      
      const result = await ShoppingCartService.addToCart(userId, {
        productId: product.id,
        quantity: 1,
        notes: `Added from search: ${product.name}`
      })

      if (result.success) {
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`
        })
        onAddToCart?.(product)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add item to cart",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      })
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }
  }

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Price Range</Label>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilters('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Dietary Preferences</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="organic"
                      checked={filters.organic || false}
                      onCheckedChange={(checked) => updateFilters('organic', checked)}
                    />
                    <Label htmlFor="organic" className="text-sm">Organic</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Health Labels</Label>
                <div className="mt-2 space-y-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'].map((label) => (
                    <div key={label} className="flex items-center space-x-2">
                      <Checkbox
                        id={label.toLowerCase()}
                        checked={filters.healthLabels?.includes(label) || false}
                        onCheckedChange={(checked) => {
                          const current = filters.healthLabels || []
                          if (checked) {
                            updateFilters('healthLabels', [...current, label])
                          } else {
                            updateFilters('healthLabels', current.filter(l => l !== label))
                          }
                        }}
                      />
                      <Label htmlFor={label.toLowerCase()} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Searching products...</span>
        </div>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
            isAddingToCart={addingToCart.has(product.id)}
          />
        ))}
      </div>

      {/* No Results */}
      {!loading && query && products.length === 0 && (
        <div className="text-center py-8">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search query or filters</p>
        </div>
      )}

      {/* Initial State */}
      {!loading && !query && (
        <div className="text-center py-8">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Search for products</h3>
          <p className="text-muted-foreground">Enter a product name or ingredient to get started</p>
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  product: EnhancedProduct
  onAddToCart: () => void
  isAddingToCart: boolean
}

function ProductCard({ product, onAddToCart, isAddingToCart }: ProductCardProps) {
  const price = product.kroger?.price?.regular || product.averagePrice || 0
  const inStock = product.kroger?.inStock ?? true

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1">
        <div className="space-y-3">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {product.kroger?.images?.[0] ? (
              <img
                src={product.kroger.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-muted-foreground">No image</div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
              {product.brand && (
                <p className="text-sm text-muted-foreground">{product.brand}</p>
              )}
            </div>

            {/* Health Labels */}
            <div className="flex flex-wrap gap-1">
              {product.health.healthLabels.slice(0, 2).map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              {product.health.healthLabels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.health.healthLabels.length - 2}
                </Badge>
              )}
            </div>

            {/* Nutrition Summary */}
            {product.nutrition.calories > 0 && (
              <div className="text-xs text-muted-foreground">
                {product.nutrition.calories} cal • 
                {product.nutrition.protein}g protein • 
                {product.nutrition.carbs}g carbs
              </div>
            )}

            {/* Price and Stock */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">${price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                {inStock ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-600">In Stock</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs text-red-600">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {Math.round(product.confidence * 100)}% data confidence
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={onAddToCart}
            disabled={!inStock || isAddingToCart}
            className="w-full"
            size="sm"
          >
            {isAddingToCart ? (
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
      </CardContent>
    </Card>
  )
}