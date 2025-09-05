'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play, Users, Star, TrendingUp } from 'lucide-react';

export function CookingClassesSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Learn from AI-Enhanced Cooking Creators
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our community of verified chefs and home cooks share their expertise through 
              interactive classes powered by AI. Learn techniques that actually work, 
              with personalized guidance based on your skill level and kitchen setup.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Verified creator community</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-gray-700">Success-based creator earnings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">AI-personalized learning paths</span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Explore Classes</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Creator Video */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 aspect-video flex items-center justify-center border border-green-100">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Creator Masterclass</h3>
                <p className="text-gray-600 text-sm">AI-Enhanced Cooking Techniques</p>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-3xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#FF375F] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF375F]/90 transition-colors cursor-pointer">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Creator Stats */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">MC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Maria Chen</h4>
                    <p className="text-sm text-gray-600">Verified Chef • 2.3k students</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">4.9</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                "NIBBBLE's AI helps me teach techniques that actually work for each student's skill level. 
                My students have a 94% success rate!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}