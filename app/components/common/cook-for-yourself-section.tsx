'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function CookForYourselfSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Finally Cook for Yourself More Often
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Take control of your meals and discover the joy of cooking. 
              Our platform makes it easy to find recipes, learn techniques, 
              and create delicious dishes that fit your lifestyle and preferences.
            </p>
            
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Create an account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Images and Text */}
          <div className="space-y-6">
            {/* Top Image */}
            <div className="bg-gray-800 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👨‍🍳</span>
                </div>
                <p className="text-gray-400 text-sm">Cooking in Kitchen</p>
              </div>
            </div>
            
            {/* Bottom Image */}
            <div className="bg-gray-800 rounded-2xl p-8 aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💻</span>
                </div>
                <p className="text-gray-400 text-sm">Planning Meals</p>
              </div>
            </div>
            
            {/* Text Block */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Become a Happy Plates Creator
              </h3>
              <p className="text-gray-600">
                Share your favorite recipes with the community. Whether you're a seasoned chef 
                or just starting your culinary journey, your unique perspective and recipes 
                can inspire others to cook more often.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
