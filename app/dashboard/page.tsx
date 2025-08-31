import { Suspense } from 'react'
import { DashboardHeader } from '@/app/components/dashboard/dashboard-header'
import { DashboardSidebar } from '@/app/components/dashboard/dashboard-sidebar'
import { RecipeFeed } from '@/app/components/dashboard/recipe-feed'
import { DashboardStats } from '@/app/components/dashboard/dashboard-stats'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="flex">
        <DashboardSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600">
                Discover amazing recipes from our community of home cooks and professional chefs.
              </p>
            </div>

            {/* Stats Cards */}
            <DashboardStats />

            {/* Recipe Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Latest Recipes
                </h2>
                <p className="text-gray-600 mt-1">
                  Fresh recipes from our community
                </p>
              </div>
              
              <Suspense fallback={<LoadingSpinner />}>
                <RecipeFeed />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
