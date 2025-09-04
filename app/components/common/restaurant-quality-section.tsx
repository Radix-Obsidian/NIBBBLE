'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Play } from 'lucide-react';

export function RestaurantQualitySection() {
  const router = useRouter();

  const categories = [
    {
      id: 1,
      name: "Breakfast And Brunch",
      image: "🍳",
      color: "bg-yellow-100"
    },
    {
      id: 2,
      name: "Master Recipes",
      image: "🥗",
      color: "bg-green-100"
    },
    {
      id: 3,
      name: "Recipes Of India",
      image: "🍛",
      color: "bg-orange-100"
    },
    {
      id: 4,
      name: "Exotic Meals Course",
      image: "🍚",
      color: "bg-blue-100"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Achieve Restaurant-Quality Food at Home
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Master the techniques and recipes that make restaurant dishes special. 
              Learn from professional chefs and elevate your home cooking to new heights.
            </p>
            
            <button 
              onClick={() => router.push('/dashboard/discover')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>View Recipes</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Category Grid */}
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="relative group cursor-pointer">
                <div className={`${category.color} rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200`}>
                  <span className="text-4xl mb-3">{category.image}</span>
                  <h3 className="text-sm font-medium text-gray-800">{category.name}</h3>
                  
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
        </div>
      </div>
    </section>
  );
}
