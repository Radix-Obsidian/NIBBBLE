'use client';

import { ArrowRight, Instagram, Twitter } from 'lucide-react';

export function TrendsettersSection() {
  const trendsetters = [
    {
      id: 1,
      name: "Simone and Alex Stream",
      role: "Food Blogger",
      image: "👨‍💻",
      color: "bg-blue-100"
    },
    {
      id: 2,
      name: "Ash Robinson",
      role: "Food Blogger",
      image: "👨‍🍳",
      color: "bg-green-100"
    },
    {
      id: 3,
      name: "Charlie Irlove",
      role: "Food Blogger",
      image: "👨‍🎨",
      color: "bg-yellow-100"
    },
    {
      id: 4,
      name: "Steven Davis",
      role: "Food Blogger",
      image: "👨‍💼",
      color: "bg-purple-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Trendsetters Making Waves in the Spotlight
          </h2>
        </div>

        {/* Trendsetters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trendsetters.map((person) => (
            <div key={person.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Profile Image */}
              <div className={`${person.color} aspect-square flex items-center justify-center p-8`}>
                <span className="text-6xl">{person.image}</span>
              </div>
              
              {/* Profile Info */}
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {person.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{person.role}</p>
                
                {/* Social Media Icons */}
                <div className="flex items-center justify-center space-x-3">
                  <Instagram className="w-5 h-5 text-pink-500 hover:text-pink-600 cursor-pointer" />
                  <Twitter className="w-5 h-5 text-blue-500 hover:text-blue-600 cursor-pointer" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 mx-auto transition-all duration-200 hover:shadow-lg">
            <span>See More</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
