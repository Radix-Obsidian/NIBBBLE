'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Star, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export function CreatorCommunitySection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#FF375F]/10 border border-[#FF375F]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#FF375F]" />
            <span className="text-[#FF375F] font-semibold text-sm">LAUNCHING SOON</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Creator Community
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building a community of verified chefs and home cooks who will share their expertise 
            through AI-enhanced recipes. Be part of the future of cooking content.
          </p>
        </div>

        {/* Creator Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Creator Program</h3>
            <p className="text-gray-600 mb-4">
              Join our exclusive community of verified chefs and home cooks. 
              Share your expertise with AI-enhanced recipes.
            </p>
            <div className="text-sm text-purple-600 font-medium">Coming Soon</div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Success-Based Earnings</h3>
            <p className="text-gray-600 mb-4">
              Earn based on cooking success rates, not just views. 
              Quality content that actually works in real kitchens.
            </p>
            <div className="text-sm text-orange-600 font-medium">Launch Feature</div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Enhanced Content</h3>
            <p className="text-gray-600 mb-4">
              Your recipes will be enhanced with AI adaptation, 
              success prediction, and personalized guidance.
            </p>
            <div className="text-sm text-blue-600 font-medium">Core Feature</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Shape the Future of Cooking?
            </h3>
            <p className="text-gray-600 mb-6">
              Join our creator waitlist and be among the first to experience 
              the AI-powered cooking platform that rewards real success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/signin?mode=signup')}
                className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-200 hover:shadow-lg"
              >
                <span>Join Creator Waitlist</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push('/learn-more')}
                className="border-2 border-gray-300 hover:border-[#FF375F] text-gray-700 hover:text-[#FF375F] px-8 py-4 rounded-lg font-semibold transition-all duration-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
