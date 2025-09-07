'use client';

import { Button } from '@/app/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface SentryFeedbackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SentryFeedbackButton({ 
  className, 
  variant = 'outline',
  size = 'md' 
}: SentryFeedbackButtonProps) {
  const handleFeedbackClick = () => {
    // Feedback feature - for now show alert
    alert('Feedback feature coming soon! Please contact support@nibbble.com for now.');
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
