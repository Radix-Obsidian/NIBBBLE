'use client';

import { useState } from 'react';
import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { CheckCircle, ArrowRight, Star, Users, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorWaitlistPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    socialHandle: '',
    cookingExperience: '',
    specialty: '',
    audienceSize: '',
    contentType: '',
    goals: ''
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
          type: 'creator',
          name: formData.name,
          socialHandle: formData.socialHandle,
          cookingExperience: formData.cookingExperience,
          specialty: formData.specialty,
          audienceSize: formData.audienceSize,
          contentType: formData.contentType,
          goals: formData.goals
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
                Welcome to the Creator Waitlist!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Thank you for joining our creator community. We'll be in touch soon with early access and exclusive updates.
              </p>
              <div className="space-y-4">
                <Button size="xl" onClick={() => router.push('/creators/learn-more')} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                  Learn More About Creating
                </Button>
                <Button size="xl" variant="outline" onClick={() => router.push('/cookers/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
                  I'm a Home Cook
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
              Join the Creator Waitlist
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Be among the first creators to monetize your culinary expertise with AI-enhanced recipes that actually work.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell Us About Yourself</h2>
              
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
                  <Label htmlFor="socialHandle">Social Media Handle</Label>
                  <Input
                    id="socialHandle"
                    name="socialHandle"
                    type="text"
                    value={formData.socialHandle}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="@yourhandle"
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
                    <option value="home-cook">Home Cook</option>
                    <option value="professional-chef">Professional Chef</option>
                    <option value="culinary-school">Culinary School Graduate</option>
                    <option value="food-blogger">Food Blogger/Influencer</option>
                    <option value="restaurant-owner">Restaurant Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="specialty">Culinary Specialty</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    type="text"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="e.g., Italian cuisine, baking, vegan cooking"
                  />
                </div>

                <div>
                  <Label htmlFor="audienceSize">Current Audience Size</Label>
                  <select
                    id="audienceSize"
                    name="audienceSize"
                    value={formData.audienceSize}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                  >
                    <option value="">Select audience size</option>
                    <option value="0-1k">0 - 1,000 followers</option>
                    <option value="1k-10k">1,000 - 10,000 followers</option>
                    <option value="10k-100k">10,000 - 100,000 followers</option>
                    <option value="100k+">100,000+ followers</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="contentType">Primary Content Type</Label>
                  <select
                    id="contentType"
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                  >
                    <option value="">Select content type</option>
                    <option value="recipes">Recipe Videos</option>
                    <option value="tutorials">Cooking Tutorials</option>
                    <option value="reviews">Food Reviews</option>
                    <option value="lifestyle">Food Lifestyle</option>
                    <option value="educational">Educational Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="goals">What are your goals as a creator?</Label>
                  <textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    placeholder="Tell us about your aspirations and what you hope to achieve..."
                  />
                </div>

                <Button type="submit" size="xl" className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                  <span>Join Creator Waitlist</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>

            {/* Benefits */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Creator Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Star className="w-6 h-6 text-[#f97316] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Success-Based Earnings</h4>
                      <p className="text-gray-600 text-sm">Earn based on cooking success rates, not just views</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-[#d97706] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">AI-Enhanced Content</h4>
                      <p className="text-gray-600 text-sm">Your recipes get enhanced with AI adaptation and success prediction</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Verified Creator Program</h4>
                      <p className="text-gray-600 text-sm">Join our exclusive community of verified chefs and home cooks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f97316]/10 to-[#d97706]/10 rounded-2xl p-8 border border-[#f97316]/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Early Access Perks</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Priority access to creator tools</li>
                  <li>• Exclusive creator community access</li>
                  <li>• First look at new features</li>
                  <li>• Direct feedback channel to our team</li>
                  <li>• Special launch bonuses</li>
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
