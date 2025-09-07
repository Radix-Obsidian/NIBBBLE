import { HighlightOptions } from '@highlight-run/next/server'

export const highlightServerConfig: HighlightOptions = {
  projectId: 've6yn6ng',
  serviceName: 'nibbble-alpha-server',
  serviceVersion: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  // Enhanced server-side monitoring
  enableTracing: true,
  enableMetrics: true,
  
  // Error filtering for production
  beforeSend: (event) => {
    // Filter out sensitive data
    if (event.request?.url?.includes('/api/stripe/webhook')) {
      // Remove sensitive Stripe data
      if (event.request.body) {
        event.request.body = '[FILTERED_STRIPE_WEBHOOK]';
      }
    }
    
    if (event.request?.url?.includes('/api/auth')) {
      // Remove sensitive auth data  
      if (event.request.body) {
        event.request.body = '[FILTERED_AUTH_DATA]';
      }
    }
    
    return event;
  },
  
  // Custom tags for better organization
  tags: {
    application: 'nibbble',
    version: 'alpha',
    feature: 'waitlist'
  }
};