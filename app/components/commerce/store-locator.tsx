'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Phone, Star, Navigation, Store, Car, Truck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import * as KrogerAPI from "@/lib/services/kroger-api"
import { getStoreWithAvailability, StoreWithAvailability } from "@/lib/services/enhanced-grocery-service"

interface StoreLocatorProps {
  onStoreSelect?: (store: KrogerAPI.KrogerStore) => void
  productIds?: string[]
  userLocation?: {
    latitude: number
    longitude: number
  }
}

export default function StoreLocator({ onStoreSelect, productIds = [], userLocation }: StoreLocatorProps) {
  const [stores, setStores] = useState<StoreWithAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  useEffect(() => {
    if (userLocation) {
      searchByCoordinates(userLocation.latitude, userLocation.longitude)
    }
  }, [userLocation])

  const searchByZipCode = async () => {
    if (!zipCode.trim()) {
      toast({
        title: "Invalid ZIP Code",
        description: "Please enter a valid ZIP code",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const response = await KrogerAPI.findStores(zipCode, 25, 10)
      
      // Enhance stores with availability data
      const enhancedStores = await Promise.all(
        response.data.map(async (store) => {
          const enhanced = await getStoreWithAvailability(store.locationId, productIds)
          return enhanced || {
            ...store,
            estimatedTime: { curbside: '2 hours', delivery: '4 hours' },
            fees: { delivery: 5.99, pickup: 0 }
          }
        })
      )

      setStores(enhancedStores)
      
      if (enhancedStores.length === 0) {
        toast({
          title: "No Stores Found",
          description: "No stores found in your area. Try a different ZIP code.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Store search failed:', error)
      toast({
        title: "Search Failed",
        description: "Failed to find stores. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const searchByCoordinates = async (lat: number, lng: number) => {
    try {
      setLoading(true)
      const response = await KrogerAPI.findStoresByCoordinates(lat, lng, 25, 10)
      
      const enhancedStores = await Promise.all(
        response.data.map(async (store) => {
          const enhanced = await getStoreWithAvailability(store.locationId, productIds)
          return enhanced || {
            ...store,
            estimatedTime: { curbside: '2 hours', delivery: '4 hours' },
            fees: { delivery: 5.99, pickup: 0 }
          }
        })
      )

      setStores(enhancedStores)
    } catch (error) {
      console.error('Location-based search failed:', error)
      toast({
        title: "Location Search Failed",
        description: "Failed to find nearby stores",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSelect = (store: StoreWithAvailability) => {
    setSelectedStore(store.locationId)
    onStoreSelect?.(store)
    toast({
      title: "Store Selected",
      description: `Selected ${store.name} for shopping`
    })
  }

  const getDirections = (store: StoreWithAvailability) => {
    const address = `${store.address.addressLine1}, ${store.address.city}, ${store.address.state} ${store.address.zipCode}`
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Stores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ZIP code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchByZipCode()}
              className="flex-1"
            />
            <Button onClick={searchByZipCode} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {userLocation && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => searchByCoordinates(userLocation.latitude, userLocation.longitude)}
                disabled={loading}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {stores.map((store) => (
          <StoreCard
            key={store.locationId}
            store={store}
            isSelected={selectedStore === store.locationId}
            onSelect={() => handleStoreSelect(store)}
            onGetDirections={() => getDirections(store)}
            showAvailability={productIds.length > 0}
          />
        ))}
      </div>

      {stores.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Stores Yet</h3>
            <p className="text-muted-foreground">
              Enter your ZIP code or use your current location to find nearby stores
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface StoreCardProps {
  store: StoreWithAvailability
  isSelected: boolean
  onSelect: () => void
  onGetDirections: () => void
  showAvailability: boolean
}

function StoreCard({ store, isSelected, onSelect, onGetDirections, showAvailability }: StoreCardProps) {
  const formatHours = (hours: string) => {
    // Simple hour formatting - would be more sophisticated in production
    return hours || 'Hours not available'
  }

  const getDistance = () => {
    // Would calculate actual distance based on user location
    return `${(Math.random() * 10 + 1).toFixed(1)} mi`
  }

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Store Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{store.name}</h3>
              <p className="text-sm text-muted-foreground">
                {store.address.addressLine1}
              </p>
              <p className="text-sm text-muted-foreground">
                {store.address.city}, {store.address.state} {store.address.zipCode}
              </p>
            </div>
            
            <div className="text-right space-y-1">
              <Badge variant="outline" className="text-xs">
                {getDistance()}
              </Badge>
              <div className="text-xs text-muted-foreground">
                Chain: {store.chain}
              </div>
            </div>
          </div>

          {/* Store Services */}
          <div className="flex flex-wrap gap-2">
            {store.services?.slice(0, 4).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
            {(store.services?.length || 0) > 4 && (
              <Badge variant="outline" className="text-xs">
                +{(store.services?.length || 0) - 4} more
              </Badge>
            )}
          </div>

          {/* Product Availability */}
          {showAvailability && store.products && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Product Availability</h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{store.products.available} available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>{store.products.outOfStock} out of stock</span>
                </div>
                <div className="text-muted-foreground">
                  of {store.products.totalRequested} requested
                </div>
              </div>
            </div>
          )}

          {/* Store Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Hours Today</span>
              </div>
              <p className="text-muted-foreground">
                {formatHours(store.hours?.monday || '')}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4" />
                <span className="font-medium">Phone</span>
              </div>
              <p className="text-muted-foreground">
                {store.phone || 'Not available'}
              </p>
            </div>
          </div>

          {/* Delivery Options */}
          {store.estimatedTime && (
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Fulfillment Options</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Curbside Pickup</p>
                    <p className="text-muted-foreground">{store.estimatedTime.curbside}</p>
                    <p className="text-xs text-green-600">
                      ${store.fees?.pickup.toFixed(2) || '0.00'} fee
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-muted-foreground">{store.estimatedTime.delivery}</p>
                    <p className="text-xs text-orange-600">
                      ${store.fees?.delivery.toFixed(2) || '5.99'} fee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onSelect}
              variant={isSelected ? "default" : "outline"}
              className="flex-1"
            >
              <Store className="h-4 w-4 mr-2" />
              {isSelected ? 'Selected' : 'Select Store'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onGetDirections}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}