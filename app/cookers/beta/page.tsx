'use client';

import { useState } from 'react';
import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { SentryFeedbackButton } from '@/app/components/common/sentry-feedback-button';
import { CheckCircle, ArrowRight, ChefHat, Brain, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CookerBetaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cookingExperience: '',
    kitchenSetup: '',
    cookingGoals: '',
    frequency: '',
    challenges: '',
    interests: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: 'cooker',
          name: formData.name,
          cookingExperience: formData.cookingExperience,
          kitchenSetup: formData.kitchenSetup,
          cookingGoals: formData.cookingGoals,
          frequency: formData.frequency,
          challenges: formData.challenges,
          interests: formData.interests
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Header />
        
        <main className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100">
              <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-[#10b981]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to the Beta Program!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Thank you for joining our beta testing program. We'll be in touch soon with early access and exclusive updates.
              </p>
              <div className="space-y-4">
                <Button size="xl" onClick={() => router.push('/cookers/learn-more')} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                  Learn More About NIBBBLE
                </Button>
                <Button size="xl" variant="outline" onClick={() => router.push('/creators/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
                  I'm a Content Creator
                </Button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join the Beta Testing Program
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Help us build the future of home cooking. Share your feedback and get early access to AI-powered recipes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell Us About Your Cooking</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="cookingExperience">Cooking Experience *</Label>
                  <select
                    id="cookingExperience"
                    name="cookingExperience"
                    required
                    value={formData.cookingExperience}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                  >
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner - Just starting out</option>
                    <option value="intermediate">Intermediate - Cook regularly</option>
                    <option value="advanced">Advanced - Confident cook</option>
                    <option value="expert">Expert - Love experimenting</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="kitchenSetup">Kitchen Setup</Label>
                  <select
                    id="kitchenSetup"
                    name="kitchenSetup"
                    value={formData.kitchenSetup}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                  >
                    <option value="">Select your kitchen setup</option>
                    <option value="basic">Basic - Essential appliances only</option>
                    <option value="standard">Standard - Most common appliances</option>
                    <option value="well-equipped">Well-equipped - Many appliances and tools</option>
                    <option value="professional">Professional - Commercial-grade equipment</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="frequency">How often do you cook?</Label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="few-times-week">Few times a week</option>
                    <option value="weekly">Weekly</option>
                    <option value="occasionally">Occasionally</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="cookingGoals">What are your cooking goals?</Label>
                  <textarea
                    id="cookingGoals"
                    name="cookingGoals"
                    value={formData.cookingGoals}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    placeholder="e.g., Learn new techniques, cook healthier meals, impress friends..."
                  />
                </div>

                <div>
                  <Label htmlFor="challenges">What are your biggest cooking challenges?</Label>
                  <textarea
                    id="challenges"
                    name="challenges"
                    value={formData.challenges}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    placeholder="e.g., Recipes don't work, hard to find ingredients, time management..."
                  />
                </div>

                <div>
                  <Label htmlFor="interests">What types of food interest you most?</Label>
                  <Input
                    id="interests"
                    name="interests"
                    type="text"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="e.g., Italian, Asian, baking, healthy meals, quick dinners"
                  />
                </div>

                <Button type="submit" size="xl" className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                  <span>Join Beta Testing</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Having issues or questions?</p>
                  <SentryFeedbackButton variant="outline" size="sm" />
                </div>
              </form>
            </div>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Beta Tester Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <ChefHat className="w-6 h-6 text-[#f97316] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Early Access to AI Features</h4>
                      <p className="text-gray-600 text-sm">Be among the first to experience AI-adapted recipes and success prediction</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-[#d97706] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Shape the Product</h4>
                      <p className="text-gray-600 text-sm">Your feedback directly influences the features we build and improve</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <ShoppingCart className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Free Premium Access</h4>
                      <p className="text-gray-600 text-sm">Beta testers get free access to premium features when we launch</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f97316]/10 to-[#d97706]/10 rounded-2xl p-8 border border-[#f97316]/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Weekly access to new features</li>
                  <li>• Direct feedback channel to our team</li>
                  <li>• Exclusive beta tester community</li>
                  <li>• Special recognition in the app</li>
                  <li>• Free premium subscription for life</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
