'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

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
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                The Dribbble for
                <span className="block text-[#FFD84D]">Food Creators</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Where TikTok meets Pinterest for food lovers. Share your recipes, discover amazing dishes, 
                and build your culinary community. SNACK. SHARE. SAVOR.
              </p>
            </div>

            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Chef Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-3xl p-8 aspect-square flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">👨‍🍳</span>
                </div>
                <p className="text-white text-lg font-semibold">Food Creator</p>
                <p className="text-white/80 text-sm">Share Your Passion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
