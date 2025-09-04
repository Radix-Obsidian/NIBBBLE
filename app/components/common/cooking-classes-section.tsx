'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play } from 'lucide-react';

export function CookingClassesSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Online Cooking Classes with Top Chefs
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Learn directly from professional chefs in interactive online classes. 
              Master new techniques, discover secret recipes, and elevate your culinary skills 
              from the comfort of your own kitchen.
            </p>
            
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Chef Video */}
          <div className="relative">
            <div className="bg-gray-800 rounded-3xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">👨‍🍳</span>
                </div>
                <p className="text-gray-400 text-lg">Chef Masterclass</p>
                <p className="text-gray-500 text-sm">Cutting Techniques</p>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-3xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-[#FF375F] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF375F]/90 transition-colors cursor-pointer">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
