'use client';

import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { BookOpen, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LearnMorePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/signin');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 mb-20">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover NIBBBLE
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The ultimate platform for home cooks, food creators, and culinary enthusiasts
          </p>
          <Button size="xl" className="mr-4" onClick={handleGetStarted}>
            Get Started Free
          </Button>
        </section>

        {/* What We Offer */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Recipe Library</h3>
              <p className="text-gray-600">Access thousands of recipes from home cooks and professional chefs</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600">Connect with fellow food lovers and share your culinary journey</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trending Content</h3>
              <p className="text-gray-600">Stay updated with the latest food trends and viral recipes</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600 text-sm">Create your free account in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2">Explore</h3>
              <p className="text-gray-600 text-sm">Browse recipes and discover creators</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2">Cook</h3>
              <p className="text-gray-600 text-sm">Follow step-by-step instructions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">4</div>
              <h3 className="font-semibold mb-2">Share</h3>
              <p className="text-gray-600 text-sm">Share your creations with the community</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Start Your Culinary Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of home cooks who are already creating amazing meals
          </p>
          <Button size="xl" onClick={handleGetStarted}>
            Get Started Free
          </Button>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
