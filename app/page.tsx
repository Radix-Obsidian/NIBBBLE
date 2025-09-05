'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { Header, Footer } from './components/layout';
import { SentryFeedbackButton } from './components/common/sentry-feedback-button';
import {
  HeroSection,
  WeeklyCookingSection,
  RestaurantQualitySection,
  HowItWorksSection,
  CookingClassesSection,
  TrendsettersSection,
  CookForYourselfSection,
  GallerySection,
  GuidanceSection,
  CulinaryExpertsSection
} from './components/common';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if user is authenticated and redirect to dashboard
  useEffect(() => {
    logger.debug('HomePage auth check', { 
      hasUser: !!user, 
      authLoading, 
      hasRedirected 
    })
    
    if (user && !authLoading && !hasRedirected) {
      logger.info('Redirecting authenticated user to dashboard')
      setHasRedirected(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    }
  }, [user, authLoading, hasRedirected, router])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <WeeklyCookingSection />
        <RestaurantQualitySection />
        <HowItWorksSection />
        <CookingClassesSection />
        <TrendsettersSection />
        <CookForYourselfSection />
        <GallerySection />
        <GuidanceSection />
        <CulinaryExpertsSection />
      </main>
      
      <Footer />

      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <SentryFeedbackButton 
          variant="default" 
          size="sm"
          className="shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </div>
    </div>
  );
}
