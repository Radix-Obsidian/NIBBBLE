'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, ChefHat, Brain, Target } from 'lucide-react';

export function ComingSoonRecipesSection() {
  const router = useRouter();

  const upcomingFeatures = [
    {
      id: 1,
      name: "AI-Adapted Recipes",
      description: "Every recipe personalized to your kitchen",
      icon: <Brain className="w-8 h-8 text-white" />,
      color: "from-[#f97316] to-[#d97706]"
    },
    {
      id: 2,
      name: "Success Prediction",
      description: "Know your chances before you start",
      icon: <Target className="w-8 h-8 text-white" />,
      color: "from-[#10b981] to-[#059669]"
    },
    {
      id: 3,
      name: "Technique Guidance",
      description: "Built-in cooking lessons for every dish",
      icon: <ChefHat className="w-8 h-8 text-white" />,
      color: "from-[#ef4444] to-[#dc2626]"
    },
    {
      id: 4,
      name: "Integrated Shopping",
      description: "One-click ingredient delivery",
      icon: <Clock className="w-8 h-8 text-white" />,
      color: "from-[#f59e0b] to-[#d97706]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#f97316]" />
            <span className="text-[#f97316] font-semibold text-sm">LAUNCHING SOON</span>
          </div>
          <h2 className="text-4xl font-bold text-[#111827] mb-6 font-['Poppins']">
            Ready to Cook with Confidence
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get early access to smart cooking that actually works.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {upcomingFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 relative">
              {/* Coming Soon Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#f97316] to-[#d97706] text-white text-xs font-bold px-3 py-1 rounded-full">
                Coming Soon
              </div>
              
              {/* Feature Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                {feature.icon}
              </div>
              
              {/* Feature Content */}
              <h3 className="text-xl font-semibold text-[#111827] mb-4 text-center font-['Poppins']">{feature.name}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/signin?mode=signup')}
            className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 mx-auto transition-all duration-200 hover:shadow-lg"
          >
            <span>Get Early Access</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}