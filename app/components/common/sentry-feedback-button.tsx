'use client';

import { Button } from '@/app/components/ui/button';
import { MessageCircle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface SentryFeedbackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function SentryFeedbackButton({ 
  className, 
  variant = 'outline',
  size = 'default' 
}: SentryFeedbackButtonProps) {
  const handleFeedbackClick = () => {
    // Open the Sentry feedback widget
    Sentry.showFeedbackDialog();
  };

  return (
    <Button
      onClick={handleFeedbackClick}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Send Feedback
    </Button>
  );
}
