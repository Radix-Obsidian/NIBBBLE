'use client'

import React from 'react'
import { ShoppingBag, Store, Search, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import ShoppingCart from "@/app/components/commerce/shopping-cart"
import ProductSearch from "@/app/components/commerce/product-search"
import StoreLocator from "@/app/components/commerce/store-locator"

export default function ShoppingDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading your shopping dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access shopping features.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shopping Dashboard</h1>
          <p className="text-muted-foreground">
            Smart grocery shopping powered by AI and real-time store data
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Store className="h-4 w-4 mr-2" />
            Find Stores
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Total</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$34.52</div>
            <p className="text-xs text-muted-foreground">
              5 items • 3 stores
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$8.47</div>
            <p className="text-xs text-muted-foreground">
              vs. regular prices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipes</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              ingredients ready to cook
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Time</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2-4h</div>
            <p className="text-xs text-muted-foreground">
              estimated delivery
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shopping Cart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShoppingCart 
                userId={user.id}
                onCheckout={() => {
                  // Handle checkout
                  console.log('Proceeding to checkout')
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search Products
              </Button>
              
              <Button className="w-full" variant="outline">
                <Store className="h-4 w-4 mr-2" />
                Find Stores
              </Button>
              
              <Button className="w-full" variant="outline">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add Recipe to Cart
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Added Organic Apples</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cart optimized</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Store changed to Kroger</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs">Save $2.50</Badge>
                </div>
                <p className="text-sm mt-2">
                  Switch to store brand milk for similar nutrition at lower cost
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs">Bulk Deal</Badge>
                </div>
                <p className="text-sm mt-2">
                  Buy 3+ pasta boxes for 20% off
                </p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="text-xs">Seasonal</Badge>
                </div>
                <p className="text-sm mt-2">
                  Fresh strawberries are in peak season
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Product Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductSearch 
            userId={user.id}
            onAddToCart={(product) => {
              console.log('Product added to cart:', product.name)
            }}
          />
        </CardContent>
      </Card>

      {/* Store Locator Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Locator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StoreLocator 
            onStoreSelect={(store) => {
              console.log('Store selected:', store.name)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}