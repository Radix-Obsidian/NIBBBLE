'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { 
  Header, 
  Footer
} from './components';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if user is authenticated and redirect to dashboard
  useEffect(() => {
    logger.debug('HomePage auth check', { 
      hasUser: !!user, 
      authLoading, 
      hasRedirected 
    })
    
    if (user && !authLoading && !hasRedirected) {
      logger.info('Redirecting authenticated user to dashboard')
      setHasRedirected(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    }
  }, [user, authLoading, hasRedirected, router])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Featured Recipe */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Learn to Cook
                  <span className="block text-orange-600">Like a Pro</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover thousands of recipes from home cooks and professional chefs. 
                  Follow your favorite creators, save recipes, and build your cooking skills 
                  with our step-by-step video guides.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Start Cooking</span>
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Watch Chef Dina
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span>10K+ Creators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>50K+ Recipes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Trending Daily</span>
                </div>
              </div>
            </div>

            {/* Right Side - Featured Recipe */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🥩</span>
                      </div>
                      <p className="text-gray-500 text-sm">Braised Beef Short Ribs</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Braised Beef Short Ribs</h3>
                  <p className="text-gray-600 mb-4">Slow-braised short ribs with red wine, herbs, and aromatics—fall-off-the-bone tender.</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>3 hr</span>
                    </div>
                    <span>•</span>
                    <span>Medium</span>
                    <span>•</span>
                    <span>Dinner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending This Week Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trending This Week</h2>
            <p className="text-xl text-gray-600">Discover what's hot in the cooking community right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Recipe Card 1 */}
            <div className="bg-yellow-50 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4">
                <button className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="absolute top-4 left-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Trending
              </div>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🍕</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Homemade Pizza...</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">4.8</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Classic Italian pizza with fresh mozzarella, basil,...</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>45 min</span>
                  </div>
                  <span>Medium</span>
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">MC</div>
                </div>
              </div>
            </div>

            {/* Recipe Card 2 */}
            <div className="bg-yellow-50 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4">
                <button className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500 fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🥗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Buddha Bowl</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">4.6</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Healthy grain bowl with roasted vegetables and...</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>25 min</span>
                  </div>
                  <span>Easy</span>
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">VK</div>
                </div>
              </div>
            </div>

            {/* Recipe Card 3 */}
            <div className="bg-yellow-50 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4">
                <button className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">🍰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chocolate Lava Cake</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">4.9</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Decadent chocolate cake with molten center, read...</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>20 min</span>
                    </div>
                  <span>Easy</span>
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">BD</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
