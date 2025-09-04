'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CulinaryExpertsSection() {
  const experts = [
    {
      id: 1,
      name: "Calvin Drake",
      image: "👨‍🍳",
      color: "bg-gray-100"
    },
    {
      id: 2,
      name: "Lincoln Davis",
      image: "👨‍🍳",
      color: "bg-blue-100"
    },
    {
      id: 3,
      name: "Peter Robbins",
      image: "👨‍🍳",
      color: "bg-green-100"
    },
    {
      id: 4,
      name: "Mary Agnes",
      image: "👩‍🍳",
      color: "bg-purple-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Master the Craft with Culinary Experts
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

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((expert) => (
            <div key={expert.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Expert Image */}
              <div className={`${expert.color} aspect-square flex items-center justify-center p-8`}>
                <span className="text-6xl">{expert.image}</span>
              </div>
              
              {/* Expert Info */}
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {expert.name}
                </h3>
                <p className="text-sm text-gray-600">Culinary Expert</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
