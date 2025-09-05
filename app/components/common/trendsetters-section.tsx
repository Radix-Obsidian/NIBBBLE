'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Star, Zap, Clock } from 'lucide-react';

export function EarlyAdopterSection() {
  const router = useRouter();

  const earlyAdopterBenefits = [
    {
      icon: <Users className="w-8 h-8 text-white" />,
      title: "Exclusive Access",
      description: "Be among the first to experience NIBBBLE's smart cooking platform",
      color: "from-[#f97316] to-[#d97706]"
    },
    {
      icon: <Star className="w-8 h-8 text-white" />,
      title: "Free Premium",
      description: "Lifetime access to all premium features for early adopters",
      color: "from-[#10b981] to-[#059669]"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Direct Influence",
      description: "Help shape the platform with your feedback and suggestions",
      color: "from-[#ef4444] to-[#dc2626]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#f97316]" />
            <span className="text-[#f97316] font-semibold text-sm">LIMITED SPOTS</span>
          </div>
          <h2 className="text-4xl font-bold text-[#111827] mb-6 font-['Poppins']">
            Join Our Early Adopter Community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're looking for passionate home cooks to help us build and test NIBBBLE. 
            Be part of the community that shapes the future of AI-powered cooking.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {earlyAdopterBenefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#111827] mb-4 text-center font-['Poppins']">{benefit.title}</h3>
              <p className="text-gray-600 text-center leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={() => router.push('/signin?mode=signup')}
            className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 mx-auto transition-all duration-200 hover:shadow-lg"
          >
            <span>Become an Early Adopter</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
