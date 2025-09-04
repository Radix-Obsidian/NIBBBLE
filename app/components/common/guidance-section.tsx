'use client';

import { Play } from 'lucide-react';

export function GuidanceSection() {
  const guidanceTopics = [
    {
      id: 1,
      title: "How do I cook recipes?",
      image: "👨‍🍳",
      color: "bg-blue-100"
    },
    {
      id: 2,
      title: "What are the best food strategies?",
      image: "📚",
      color: "bg-green-100"
    },
    {
      id: 3,
      title: "What is healthy and how does it work?",
      image: "🥗",
      color: "bg-yellow-100"
    },
    {
      id: 4,
      title: "How to cook with fresh ingredients?",
      image: "🥬",
      color: "bg-orange-100"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Guidance Corner and Informational Resources
          </h2>
        </div>

        {/* Guidance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guidanceTopics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
              {/* Topic Image */}
              <div className={`${topic.color} aspect-square flex items-center justify-center p-8 relative`}>
                <span className="text-5xl">{topic.image}</span>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-[#FF375F] rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
              
              {/* Topic Title */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  {topic.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
