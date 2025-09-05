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
      color: "from-purple-500 to-blue-500",
      status: "Coming Soon"
    },
    {
      id: 2,
      title: "Success Prediction",
      description: "Know before you cook if you'll succeed",
      icon: <Target className="w-8 h-8 text-white" />,
      color: "from-green-500 to-teal-500",
      status: "Coming Soon"
    },
    {
      id: 3,
      title: "Integrated Shopping",
      description: "One-click ingredient delivery from local stores",
      icon: <ShoppingCart className="w-8 h-8 text-white" />,
      color: "from-orange-500 to-red-500",
      status: "Coming Soon"
    },
    {
      id: 4,
      title: "Technique Instruction",
      description: "Built-in cooking lessons for every recipe",
      icon: <ChefHat className="w-8 h-8 text-white" />,
      color: "from-pink-500 to-purple-500",
      status: "Coming Soon"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#FF375F]/10 border border-[#FF375F]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#FF375F]" />
            <span className="text-[#FF375F] font-semibold text-sm">LAUNCHING SOON</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            The Future of Home Cooking is Here
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            NIBBBLE is building the complete infrastructure for successful home cooking. 
            Be among the first to experience AI-powered recipes that actually work.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {upcomingFeatures.map((feature) => (
            <div key={feature.id} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 relative">
              {/* Coming Soon Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#FF375F] to-[#FFD84D] text-white text-xs font-bold px-3 py-1 rounded-full">
                {feature.status}
              </div>
              
              {/* Feature Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                {feature.icon}
              </div>
              
              {/* Feature Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Get Early Access
            </h3>
            <p className="text-gray-600 mb-6">
              Join our waitlist and be the first to experience the future of home cooking. 
              Limited spots available for our beta launch.
            </p>
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 mx-auto transition-all duration-200 hover:shadow-lg"
            >
              <span>Join the Waitlist</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
