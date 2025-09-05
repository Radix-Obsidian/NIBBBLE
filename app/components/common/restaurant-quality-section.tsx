'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play, CheckCircle, Users, TrendingUp, Target } from 'lucide-react';

export function RestaurantQualitySection() {
  const router = useRouter();

  const categories = [
    {
      id: 1,
      name: "Quick & Easy",
      image: "🍳",
      color: "bg-yellow-100",
      targetRate: "Aiming for 90%+"
    },
    {
      id: 2,
      name: "Family Favorites",
      image: "🥗",
      color: "bg-green-100",
      targetRate: "Designed for success"
    },
    {
      id: 3,
      name: "Global Flavors",
      image: "🍛",
      color: "bg-orange-100",
      targetRate: "Tailored to you"
    },
    {
      id: 4,
      name: "Healthy Options",
      image: "🥑",
      color: "bg-blue-100",
      targetRate: "Kitchen-tested"
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
              Stop struggling with complicated recipes. NIBBBLE's AI is designed to adapt every dish to your skill level 
              and kitchen setup. Experience cooking success with recipes that actually work for home cooks.
            </p>
            
            {/* Success Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">90%+</div>
                    <div className="text-sm text-gray-600">Target Success</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Our goal for home cook success rates</p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">Growing</div>
                    <div className="text-sm text-gray-600">Community</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Join our early cooking community</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-['Poppins']">
              Transform Your Kitchen Today
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Experience cooking that adapts to you. Our smart recipes learn from your preferences and guide you to success every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
                Begin Your Journey
              </button>
              <button className="border-2 border-gray-300 hover:border-[#f97316] text-gray-700 hover:text-[#f97316] px-8 py-4 rounded-lg font-semibold transition-all duration-200">
                See How It Works
              </button>
            </div>
          </div>

          {/* Right Side - Category Grid */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Recipe Categories</h3>
              <p className="text-gray-600">Recipes designed to adapt to your kitchen and skill level</p>
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
                      <span className="text-xs font-medium text-green-600">{category.targetRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bottom CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Future Creator Economy</span>
              </div>
              <p className="text-sm text-gray-600">
                We're building a platform where creators will earn based on recipe success rates, not just views. 
                Our vision: quality content that truly works in real kitchens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
