'use client';

import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, Target, Zap, Clock } from 'lucide-react';

export function CTASection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/cookers/beta');
  };

  const handleLearnMore = () => {
    router.push('/cookers/learn-more');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#f9fafb] via-white to-[#f3f4f6]">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
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
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-[#f97316]" />
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">AI Recipe Adaptation</h3>
            <p className="text-sm text-gray-600">Every recipe personalized to your kitchen and skill level</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-[#10b981]" />
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">Success Prediction</h3>
            <p className="text-sm text-gray-600">Know before you cook if you'll succeed</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-[#d97706]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-[#d97706]" />
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">Integrated Commerce</h3>
            <p className="text-sm text-gray-600">Seamless shopping and cooking experience</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="xl" 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span>Join the Waitlist</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="xl" 
            onClick={() => router.push('/creators/waitlist')}
            className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316] transition-all duration-200"
          >
            Join as Creator
          </Button>
          <Button 
            variant="outline" 
            size="xl" 
            onClick={handleLearnMore}
            className="border-2 border-gray-300 hover:border-[#d97706] hover:text-[#d97706] transition-all duration-200"
          >
            Learn More
          </Button>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Building the future of home cooking</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">94%</div>
            <div className="text-sm text-gray-500">Target Success Rate</div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-2xl font-bold text-gray-400">AI-Powered</div>
            <div className="text-sm text-gray-500">Recipe Adaptation</div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-2xl font-bold text-gray-400">Launching</div>
            <div className="text-sm text-gray-500">Early 2024</div>
          </div>
        </div>
      </div>
    </section>
  );
}
