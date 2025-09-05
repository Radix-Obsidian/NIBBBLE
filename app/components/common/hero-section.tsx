'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ChefHat, ShoppingCart, Brain, CheckCircle } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="bg-gray-900 text-white relative overflow-hidden">
      {/* Top Bar */}
      <div className="bg-[#FFF8F2] text-gray-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-[#FF375F] transition-colors">What's new?</a>
            <a href="#" className="hover:text-[#FF375F] transition-colors">Easy to cook meals</a>
            <a href="#" className="hover:text-[#FF375F] transition-colors">Get your recipe</a>
          </div>
        </div>
      </div>

      {/* Main Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Tagline */}
              <div className="inline-flex items-center space-x-2 bg-[#FF375F]/10 border border-[#FF375F]/20 rounded-full px-4 py-2">
                <span className="text-[#FF375F] font-semibold text-sm tracking-wider">SNACK. SHARE. SAVOR.</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                The Shopify for
                <span className="block text-[#FFD84D]">Home Cooks</span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Stop wasting time on recipes that don't work. NIBBBLE creates complete cooking experiences 
                with AI-adapted recipes, integrated grocery delivery, and success prediction. 
                <span className="text-[#FFD84D] font-semibold"> Cook with confidence.</span>
              </p>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium">94% Success Rate</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <ShoppingCart className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm font-medium">Integrated Shopping</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3">
                <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/signin?mode=signup')}
                className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <span>Start Cooking Better</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => router.push('/learn-more')}
                className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:bg-white/5"
              >
                See How It Works
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-full border-2 border-gray-900"></div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-gray-900"></div>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <span>Join 10,000+ home cooks</span>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Demo */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-3xl p-8 aspect-square flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white/30 rounded-lg"></div>
                <div className="absolute top-8 right-8 w-12 h-12 border-2 border-white/30 rounded-full"></div>
                <div className="absolute bottom-8 left-8 w-20 h-20 border-2 border-white/30 rounded-lg"></div>
                <div className="absolute bottom-4 right-4 w-14 h-14 border-2 border-white/30 rounded-full"></div>
              </div>
              
              {/* Main Content */}
              <div className="text-center relative z-10">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-white text-xl font-bold">Complete Cooking Experience</h3>
                  <div className="space-y-2 text-white/80 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>AI Recipe Adaptation</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Grocery Delivery</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Success Prediction</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/20 rounded-full animate-pulse delay-1000"></div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#FFD84D] rounded-full opacity-60 animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-[#FF375F] rounded-full opacity-60 animate-bounce delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
