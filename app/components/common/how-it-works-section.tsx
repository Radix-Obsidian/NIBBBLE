'use client';

import { Brain, ShoppingCart, ChefHat, CheckCircle } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "AI Adapts Your Recipe",
      description: "Our AI instantly personalizes any recipe to your skill level, available ingredients, and dietary needs. No more failed attempts.",
      icon: <Brain className="w-8 h-8 text-white" />,
      color: "from-purple-500 to-blue-500"
    },
    {
      id: 2,
      title: "Get Ingredients Delivered",
      description: "One-click shopping with real-time availability and pricing from local stores. Your ingredients arrive when you need them.",
      icon: <ShoppingCart className="w-8 h-8 text-white" />,
      color: "from-green-500 to-teal-500"
    },
    {
      id: 3,
      title: "Cook with Confidence",
      description: "Follow AI-guided steps with built-in technique instruction. Know you'll succeed before you start cooking.",
      icon: <ChefHat className="w-8 h-8 text-white" />,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Cooking Made Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stop wasting time on recipes that don't work. NIBBBLE's AI creates complete cooking experiences 
            that adapt to you, not the other way around.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={step.id} className="text-center relative">
              {/* Step Number */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-bold text-white">0{step.id}</span>
              </div>
              
              {/* Step Icon */}
              <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                {step.icon}
              </div>
              
              {/* Step Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {step.description}
              </p>

              {/* Success Indicator */}
              <div className="mt-6 flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">94% Success Rate</span>
              </div>

              {/* Connecting Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#FF375F] to-[#FFD84D] transform translate-x-8 -translate-y-4 z-0"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Cook with Confidence?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of home cooks who've transformed their cooking with AI-powered recipes that actually work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg">
                Start Cooking Better
              </button>
              <button className="border-2 border-gray-300 hover:border-[#FF375F] text-gray-700 hover:text-[#FF375F] px-8 py-4 rounded-lg font-semibold transition-all duration-200">
                See Success Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
