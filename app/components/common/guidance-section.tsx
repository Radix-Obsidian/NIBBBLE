'use client';

import { useRouter } from 'next/navigation';
import { Brain, Target, ShoppingCart, ChefHat, ArrowRight, Clock } from 'lucide-react';

export function ComingSoonSection() {
  const router = useRouter();

  const upcomingFeatures = [
    {
      id: 1,
      title: "AI Recipe Adaptation",
      description: "Every recipe personalized to your skill level and kitchen",
      icon: <Brain className="w-8 h-8 text-white" />,
      color: "from-[#f97316] to-[#d97706]",
      status: "Coming Soon"
    },
    {
      id: 2,
      title: "Success Prediction",
      description: "Know before you cook if you'll succeed",
      icon: <Target className="w-8 h-8 text-white" />,
      color: "from-[#10b981] to-[#059669]",
      status: "Coming Soon"
    },
    {
      id: 3,
      title: "Integrated Shopping",
      description: "One-click ingredient delivery from local stores",
      icon: <ShoppingCart className="w-8 h-8 text-white" />,
      color: "from-[#ef4444] to-[#dc2626]",
      status: "Coming Soon"
    },
    {
      id: 4,
      title: "Technique Instruction",
      description: "Built-in cooking lessons for every recipe",
      icon: <ChefHat className="w-8 h-8 text-white" />,
      color: "from-[#f59e0b] to-[#d97706]",
      status: "Coming Soon"
    }
  ];

  return (
    <section className="py-20 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#f97316]" />
            <span className="text-[#f97316] font-semibold text-sm">LAUNCHING SOON</span>
          </div>
          <h2 className="text-4xl font-bold text-[#111827] mb-6 font-['Poppins']">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the waitlist for NIBBBLE's smart cooking platform. Experience recipes that adapt to you, 
            not the other way around. Be among the first to cook with confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {upcomingFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 relative">
              {/* Coming Soon Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#f97316] to-[#d97706] text-white text-xs font-bold px-3 py-1 rounded-full">
                {feature.status}
              </div>
              
              {/* Feature Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                {feature.icon}
              </div>
              
              {/* Feature Content */}
              <h3 className="text-xl font-semibold text-[#111827] mb-4 text-center font-['Poppins']">{feature.title}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#111827] mb-4 font-['Poppins']">
              Ready to Experience Smart Cooking?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Help us perfect the future of home cooking. Be part of our beta community and shape recipes that work for real kitchens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
                Become a Beta Tester
              </button>
              <button className="border-2 border-gray-300 hover:border-[#f97316] text-gray-700 hover:text-[#f97316] px-8 py-4 rounded-lg font-semibold transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
