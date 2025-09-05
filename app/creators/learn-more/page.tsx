'use client';

import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { Star, TrendingUp, Users, Brain, DollarSign, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorLearnMorePage() {
  const router = useRouter();

  const handleJoinWaitlist = () => {
    router.push('/creators/waitlist');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#f97316]" />
            <span className="text-[#f97316] font-semibold text-sm">LAUNCHING SOON</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create. Share. <span className="bg-gradient-to-r from-[#f97316] to-[#d97706] bg-clip-text text-transparent">Earn.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join NIBBBLE's creator community and monetize your culinary expertise with AI-enhanced recipes that actually work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" onClick={handleJoinWaitlist} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
              Join Creator Waitlist
            </Button>
            <Button size="xl" variant="outline" onClick={() => router.push('/cookers/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
              I'm a Home Cook
            </Button>
          </div>
        </section>

        {/* Creator Benefits */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose NIBBBLE for Content Creation?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-[#f97316]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-[#f97316]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Success-Based Earnings</h3>
              <p className="text-gray-600 mb-4">
                Earn based on cooking success rates, not just views. Quality content that actually works in real kitchens gets rewarded.
              </p>
              <div className="text-sm text-[#f97316] font-medium">Launch Feature</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-[#d97706]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-[#d97706]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI-Enhanced Content</h3>
              <p className="text-gray-600 mb-4">
                Your recipes get enhanced with AI adaptation, success prediction, and personalized guidance for every cook.
              </p>
              <div className="text-sm text-[#d97706] font-medium">Core Feature</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-[#10b981]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Verified Creator Program</h3>
              <p className="text-gray-600 mb-4">
                Join our exclusive community of verified chefs and home cooks. Build your reputation and grow your following.
              </p>
              <div className="text-sm text-[#10b981] font-medium">Coming Soon</div>
            </div>
          </div>
        </section>

        {/* How Creator Platform Works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How the Creator Platform Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2 text-gray-900">Upload Recipe</h3>
              <p className="text-gray-600 text-sm">Share your signature recipes with detailed instructions and tips</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2 text-gray-900">AI Enhancement</h3>
              <p className="text-gray-600 text-sm">Our AI adapts your recipe for different skill levels and kitchens</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2 text-gray-900">Track Success</h3>
              <p className="text-gray-600 text-sm">Monitor how well your recipes perform in real kitchens</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">4</div>
              <h3 className="font-semibold mb-2 text-gray-900">Earn Rewards</h3>
              <p className="text-gray-600 text-sm">Get paid based on cooking success rates and user engagement</p>
            </div>
          </div>
        </section>

        {/* Creator Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Creator Tools & Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recipe Analytics Dashboard</h3>
                  <p className="text-gray-600">Track success rates, user feedback, and engagement metrics for all your recipes.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Recipe Optimization</h3>
                  <p className="text-gray-600">Get suggestions to improve your recipes based on cooking success data.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Creator Community</h3>
                  <p className="text-gray-600">Connect with other creators, share tips, and collaborate on content.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Monetization Tools</h3>
                  <p className="text-gray-600">Multiple revenue streams including success-based payouts and premium content.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Content Scheduling</h3>
                  <p className="text-gray-600">Plan and schedule your recipe releases for optimal engagement.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Brand Partnerships</h3>
                  <p className="text-gray-600">Access to brand collaboration opportunities and sponsored content.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Monetize Your Culinary Expertise?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our creator waitlist and be among the first to experience the AI-powered cooking platform that rewards real success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" onClick={handleJoinWaitlist} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                <span>Join Creator Waitlist</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => router.push('/cookers/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
                I'm a Home Cook
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
