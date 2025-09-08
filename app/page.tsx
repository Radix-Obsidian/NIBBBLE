'use client';

import { useAuth } from '@/hooks/useAuth';
import { Header, Footer } from './components/layout';
import { SentryFeedbackButton } from './components/common/sentry-feedback-button';
import { ContentPreviewFeed } from './components/landing/content-preview-feed';
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
  const { user, loading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main Content */}
      <main>
        {/* Content-First Hero with Recipe Previews */}
        <HeroSection />
        
        {/* Featured Content Preview - Show actual recipes */}
        <ContentPreviewFeed />
        
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
