'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function WeeklyCookingSection() {
  const weeklyRecipes = [
    {
      id: 1,
      name: "Winter Pine Tartlets",
      image: "🥧",
      creator: "Melinda Tan",
      color: "bg-green-100"
    },
    {
      id: 2,
      name: "Wheat Rice Pudding",
      image: "🍚",
      creator: "Sarah Jones",
      color: "bg-amber-100"
    },
    {
      id: 3,
      name: "Cauliflower & Carrot Soup",
      image: "🥣",
      creator: "Mike Chen",
      color: "bg-orange-100"
    },
    {
      id: 4,
      name: "Rosemary Duck Breast",
      image: "🦆",
      creator: "Emma Wilson",
      color: "bg-red-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-gray-900">
            What am I cooking this week?
          </h2>
          
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 bg-[#FF375F] rounded-full flex items-center justify-center text-white hover:bg-[#FF375F]/90 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border-2 border-[#FF375F] rounded-full flex items-center justify-center text-[#FF375F] hover:bg-[#FF375F]/5 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recipe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weeklyRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Recipe Image */}
              <div className={`${recipe.color} aspect-square flex items-center justify-center p-8`}>
                <span className="text-6xl">{recipe.image}</span>
              </div>
              
              {/* Recipe Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recipe.name}
                </h3>
                
                {/* Creator Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {recipe.creator.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{recipe.creator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
