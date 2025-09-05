'use client';

import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { ChefHat, ShoppingCart, Brain, CheckCircle, Clock, ArrowRight, Star, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CookerLearnMorePage() {
  const router = useRouter();

  const handleJoinBeta = () => {
    router.push('/cookers/beta');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-[#f97316]" />
            <span className="text-[#f97316] font-semibold text-sm">BETA TESTING NOW</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Cook with <span className="bg-gradient-to-r from-[#f97316] to-[#d97706] bg-clip-text text-transparent">Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Stop wasting time on recipes that don't work. NIBBBLE creates complete cooking experiences with AI-adapted recipes, integrated grocery delivery, and success prediction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" onClick={handleJoinBeta} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
              Join Beta Testing
            </Button>
            <Button size="xl" variant="outline" onClick={() => router.push('/creators/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
              I'm a Content Creator
            </Button>
          </div>
        </section>

        {/* Problem & Solution */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Problem with Recipe Apps Today
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Recipes that don't work</h3>
                    <p className="text-gray-600">Generic recipes that fail in real kitchens</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">No personalization</h3>
                    <p className="text-gray-600">One-size-fits-all approach doesn't work for everyone</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-red-600 text-sm">✗</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Shopping hassles</h3>
                    <p className="text-gray-600">Separate apps for recipes and grocery shopping</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How NIBBBLE Solves This
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Adapted Recipes</h3>
                    <p className="text-gray-600">Recipes personalized to your skill level and kitchen setup</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Success Prediction</h3>
                    <p className="text-gray-600">Know before you cook if you'll succeed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Integrated Shopping</h3>
                    <p className="text-gray-600">Seamless grocery delivery and inventory management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Makes NIBBBLE Different
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-[#f97316]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-[#f97316]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">AI Recipe Adaptation</h3>
              <p className="text-gray-600 mb-4">
                Every recipe is adapted to your skill level, available ingredients, and kitchen equipment.
              </p>
              <div className="text-sm text-[#f97316] font-medium">94% Success Rate</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-[#d97706]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-[#d97706]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Integrated Shopping</h3>
              <p className="text-gray-600 mb-4">
                Get ingredients delivered to your door with one-click shopping from any recipe.
              </p>
              <div className="text-sm text-[#d97706] font-medium">Coming Soon</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-[#10b981]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Success Prediction</h3>
              <p className="text-gray-600 mb-4">
                Our AI predicts your success rate before you start cooking, so you know what to expect.
              </p>
              <div className="text-sm text-[#10b981] font-medium">Beta Feature</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How NIBBBLE Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2 text-gray-900">Choose Recipe</h3>
              <p className="text-gray-600 text-sm">Browse AI-enhanced recipes from verified creators</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2 text-gray-900">Get Prediction</h3>
              <p className="text-gray-600 text-sm">See your success probability and personalized tips</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2 text-gray-900">Shop & Cook</h3>
              <p className="text-gray-600 text-sm">Order ingredients and follow adapted instructions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#f97316] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">4</div>
              <h3 className="font-semibold mb-2 text-gray-900">Share Success</h3>
              <p className="text-gray-600 text-sm">Share your creation and help improve the recipe</p>
            </div>
          </div>
        </section>

        {/* Beta Testing Benefits */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Join Our Beta?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Star className="w-6 h-6 text-[#f97316] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Early Access to AI Features</h3>
                  <p className="text-gray-600">Be among the first to experience AI-adapted recipes and success prediction.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Users className="w-6 h-6 text-[#d97706] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shape the Product</h3>
                  <p className="text-gray-600">Your feedback directly influences the features we build and improve.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <TrendingUp className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Free Premium Access</h3>
                  <p className="text-gray-600">Beta testers get free access to premium features when we launch.</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#f97316]/10 to-[#d97706]/10 rounded-2xl p-8 border border-[#f97316]/20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Beta Tester Perks</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  <span>Early access to all new features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  <span>Direct line to our development team</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  <span>Free premium subscription for life</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  <span>Exclusive beta tester community</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#10b981]" />
                  <span>Special recognition in the app</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Cook with Confidence?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our beta testing program and be part of the future of home cooking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" onClick={handleJoinBeta} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                <span>Join Beta Testing</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => router.push('/creators/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
                I'm a Content Creator
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
