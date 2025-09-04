'use client';

import { ArrowRight, Instagram } from 'lucide-react';

export function GallerySection() {
  const galleryImages = [
    {
      id: 1,
      description: "Chef chopping vegetables",
      image: "🔪",
      color: "bg-gray-100"
    },
    {
      id: 2,
      description: "Chef stirring food in pan",
      image: "🍳",
      color: "bg-orange-100"
    },
    {
      id: 3,
      description: "Food cooking with flames",
      image: "🔥",
      color: "bg-red-100"
    },
    {
      id: 4,
      description: "Chef grilling meat",
      image: "🥩",
      color: "bg-amber-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Gallery of ours
          </h2>
          
          {/* Instagram Link */}
          <a 
            href="#" 
            className="flex items-center space-x-2 text-[#FF375F] hover:text-[#FF375F]/80 font-medium transition-colors"
          >
            <Instagram className="w-6 h-6" />
            <span>Instagram</span>
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {galleryImages.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className={`${item.color} rounded-2xl aspect-square flex items-center justify-center p-8 hover:shadow-lg transition-all duration-200`}>
                <span className="text-6xl group-hover:scale-110 transition-transform">
                  {item.image}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">{item.description}</p>
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
