'use client'

import Link from 'next/link'
import { Search, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-orange-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recipe Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the recipe you're looking for. It might have been moved, deleted, or you may have mistyped the URL.
        </p>

        <div className="space-y-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/dashboard/discover" className="block">
            <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50">
              <Search className="w-4 h-4 mr-2" />
              Discover Recipes
            </Button>
          </Link>

          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="w-full border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  )
}
