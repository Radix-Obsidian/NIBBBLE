'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/app/components';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { SentryFeedbackButton } from '@/app/components/common/sentry-feedback-button';
import { CheckCircle, ArrowRight, Star, Users, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiHelpers } from '@/lib/config';
import { trackEvent, HIGHLIGHT_EVENTS } from '@/lib/highlight';
import { UserRecognitionService } from '@/lib/user-recognition';

// Generate secure password for auto-authentication
const generateSecurePassword = (): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

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
  const [hasInstantAccess, setHasInstantAccess] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing user on component mount
  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const recognition = await UserRecognitionService.checkUserRecognition();
      
      if (recognition.shouldRedirect && recognition.redirectPath) {
        router.push(recognition.redirectPath);
        return;
      }
      
      if (recognition.isRecognized && recognition.userData) {
        // User is recognized but doesn't have access yet
        if (recognition.userData.type === 'creator') {
          if (recognition.userData.accessStatus === 'pending') {
            setIsSubmitted(true);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
    } finally {
      setIsCheckingExisting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any previous errors when user starts typing
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError('');
    
    try {
      // Client-side validation
      if (!formData.name.trim()) {
        throw new Error('Please enter your full name');
      }
      if (!formData.email.trim()) {
        throw new Error('Please enter your email address');
      }
      if (!formData.cookingExperience) {
        throw new Error('Please select your cooking experience level');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await apiHelpers.fetchWithRetry('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email.trim(),
          type: 'creator',
          name: formData.name.trim(),
          socialHandle: formData.socialHandle.trim() || undefined,
          cookingExperience: formData.cookingExperience,
          specialty: formData.specialty.trim() || undefined,
          audienceSize: formData.audienceSize || undefined,
          contentType: formData.contentType || undefined,
          goals: formData.goals.trim() || undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user info using recognition service
        UserRecognitionService.storeUserData({
          email: formData.email.trim(),
          type: 'creator',
          name: formData.name.trim(),
          accessStatus: data.entry.status as 'pending' | 'approved' | 'rejected'
        });
        
        // Track successful waitlist signup
        trackEvent(HIGHLIGHT_EVENTS.WAITLIST_JOINED, {
          userType: 'creator',
          email: formData.email.trim(),
          name: formData.name.trim(),
          cookingExperience: formData.cookingExperience,
          specialty: formData.specialty,
          audienceSize: formData.audienceSize,
          contentType: formData.contentType,
          hasGoals: !!formData.goals.trim(),
          instantAccess: data.instantAccess,
          status: data.entry.status
        });
        
        if (data.instantAccess && data.entry.status === 'approved') {
          // Creator has instant access - auto-create account and authenticate!
          setHasInstantAccess(true);
          localStorage.setItem('nibbble_access_status', 'approved');
          
          try {
            // Auto-create Supabase account for instant access
            const authResponse = await apiHelpers.fetchWithRetry('/api/auth/instant-access', {
              method: 'POST',
              body: JSON.stringify({
                email: formData.email.trim(),
                password: generateSecurePassword(), // Auto-generate secure password
                name: formData.name.trim(),
                type: 'creator',
                profileData: formData
              })
            });

            if (authResponse.ok) {
              const authData = await authResponse.json();
              
              // Show quick success message and redirect immediately
              setIsSubmitted(true);
              setTimeout(() => {
                // Use the auth link for seamless login or direct feed redirect
                if (authData.authLink) {
                  window.location.href = authData.authLink;
                } else {
                  router.push('/feed?welcome=true&instant=true&creator=true');
                }
              }, 1500); // Reduced to 1.5 seconds for faster access
            } else {
              // Fallback to manual signin if auto-auth fails
              console.warn('Auto-authentication failed, redirecting to signin');
              setIsSubmitted(true);
              setTimeout(() => {
                router.push(`/signin?email=${encodeURIComponent(formData.email.trim())}&message=Creator account created! Please sign in to access your feed.`);
              }, 1500);
            }
          } catch (authError) {
            console.error('Auto-authentication error:', authError);
            // Fallback to signin page
            setIsSubmitted(true);
            setTimeout(() => {
              router.push(`/signin?email=${encodeURIComponent(formData.email.trim())}&instant=true&creator=true`);
            }, 1500);
          }
        } else {
          // Regular waitlist flow
          setIsSubmitted(true);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        if (response.status === 409) {
          // Check if they actually have access now
          if (errorData.status === 'approved') {
            UserRecognitionService.storeUserData({
              email: formData.email.trim(),
              type: 'creator',
              name: formData.name.trim(),
              accessStatus: 'approved'
            });
            router.push('/feed');
            return;
          }
          throw new Error('This email is already on our waitlist. Check your inbox for updates!');
        } else if (response.status === 400) {
          throw new Error(errorData.error || 'Please check your information and try again');
        } else if (response.status >= 500) {
          throw new Error('Our servers are temporarily unavailable. Please try again in a few moments.');
        } else {
          throw new Error(errorData.error || `Submission failed (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Creator waitlist submission error:', error);
      
      // Track form submission error
      trackEvent(HIGHLIGHT_EVENTS.FORM_ERROR, {
        formType: 'creator_waitlist',
        error: error instanceof Error ? error.message : 'Unknown error',
        userType: 'creator',
        email: formData.email.trim(),
      });
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking existing user
  if (isCheckingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your status...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <Header />
        
        <main className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100">
              {hasInstantAccess ? (
                // Instant access celebration
                <>
                  <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-[#10b981] animate-pulse" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    🎉 Welcome to NIBBBLE!
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Congratulations! You have instant access to our creator platform. Redirecting you to your dashboard...
                  </p>
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="w-3 h-3 bg-[#f97316] rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-[#d97706] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-[#10b981] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <p className="text-sm text-gray-500">Setting up your creator dashboard...</p>
                </>
              ) : (
                // Regular waitlist confirmation
                <>
                  <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-[#10b981]" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to the Creator Waitlist!
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Thank you for joining our creator community. We&apos;ll notify you as soon as access becomes available!
                  </p>
                  <div className="space-y-4">
                    <Button size="xl" onClick={() => router.push('/creators/learn-more')} className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white">
                      Learn More About Creating
                    </Button>
                    <Button size="xl" variant="outline" onClick={() => router.push('/cookers/learn-more')} className="border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]">
                      I&apos;m a Home Cook
                    </Button>
                  </div>
                </>
              )}
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
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Be among the first creators to monetize your culinary expertise with AI-enhanced recipes that actually work.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell Us About Yourself</h2>
              
              {submitError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-800 text-sm">{submitError}</p>
                </div>
              )}

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
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
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
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
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
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
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
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    placeholder="Tell us about your aspirations and what you hope to achieve..."
                  />
                </div>

                <Button 
                  type="submit" 
                  size="xl" 
                  className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <span>Join Creator Waitlist</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-700 mb-2">Having issues or questions?</p>
                  <SentryFeedbackButton variant="outline" size="sm" />
                </div>
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
                      <p className="text-gray-700 text-sm">Earn based on cooking success rates, not just views</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-[#d97706] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">AI-Enhanced Content</h4>
                      <p className="text-gray-700 text-sm">Your recipes get enhanced with AI adaptation and success prediction</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Verified Creator Program</h4>
                      <p className="text-gray-700 text-sm">Join our exclusive community of verified chefs and home cooks</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f97316]/10 to-[#d97706]/10 rounded-2xl p-8 border border-[#f97316]/20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Early Access Perks</h3>
                <ul className="space-y-2 text-gray-700">
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
