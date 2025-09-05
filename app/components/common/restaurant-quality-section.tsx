'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play, CheckCircle, Users, TrendingUp } from 'lucide-react';

export function RestaurantQualitySection() {
  const router = useRouter();

  const categories = [
    {
      id: 1,
      name: "Quick & Easy",
      image: "🍳",
      color: "bg-yellow-100",
      successRate: "96%"
    },
    {
      id: 2,
      name: "Family Favorites",
      image: "🥗",
      color: "bg-green-100",
      successRate: "94%"
    },
    {
      id: 3,
      name: "Global Flavors",
      image: "🍛",
      color: "bg-orange-100",
      successRate: "92%"
    },
    {
      id: 4,
      name: "Healthy Options",
      image: "🍚",
      color: "bg-blue-100",
      successRate: "95%"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Cook Better, Not Harder
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stop struggling with complicated recipes. NIBBBLE's AI adapts every dish to your skill level 
              and kitchen setup. Experience cooking success with recipes that actually work for home cooks.
            </p>
            
            {/* Success Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">94%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Home cooks who complete their recipes successfully</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">10K+</div>
                    <div className="text-sm text-gray-600">Happy Cooks</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Home cooks cooking with confidence</p>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/dashboard/discover')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Start Cooking Better</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Category Grid */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Adapted Recipe Categories</h3>
              <p className="text-gray-600">Every recipe personalized to your kitchen and skill level</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="relative group cursor-pointer">
                  <div className={`${category.color} rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200`}>
                    <span className="text-4xl mb-3">{category.image}</span>
                    <h3 className="text-sm font-medium text-gray-800 mb-2">{category.name}</h3>
                    
                    {/* Success Rate Badge */}
                    <div className="flex items-center space-x-1 bg-white/80 rounded-full px-2 py-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs font-medium text-green-600">{category.successRate}</span>
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-[#FF375F] ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Success-Based Creator Economy</span>
              </div>
              <p className="text-sm text-gray-600">
                Verified creators earn based on cooking success rates, not just views. 
                Quality content that actually works in real kitchens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
