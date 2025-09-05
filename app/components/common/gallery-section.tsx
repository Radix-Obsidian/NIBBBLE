'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Star, Zap, CheckCircle } from 'lucide-react';

export function EarlyAccessSection() {
  const router = useRouter();

  const benefits = [
    {
      icon: <Users className="w-6 h-6 text-[#f97316]" />,
      title: "Exclusive Access",
      description: "Be among the first 1,000 users to experience NIBBBLE"
    },
    {
      icon: <Star className="w-6 h-6 text-[#d97706]" />,
      title: "Free Premium Features",
      description: "Lifetime access to AI recipe adaptation and success prediction"
    },
    {
      icon: <Zap className="w-6 h-6 text-[#10b981]" />,
      title: "Direct Feedback",
      description: "Help shape the future of home cooking with your input"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-[#111827] leading-tight font-['Poppins']">
                Join the Smart Cooking Movement
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                NIBBBLE is launching soon, and we're looking for passionate home cooks 
                to help us build the future of cooking. Get early access and help shape 
                the platform that will transform how we cook at home.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#f9fafb] rounded-full flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111827]">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Get Early Access</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-3xl p-8 aspect-square flex items-center justify-center shadow-2xl overflow-hidden">
              <video 
                className="w-full h-full object-cover rounded-2xl"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src="/this has the heart of all asians.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white rounded-full shadow-lg animate-bounce delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
