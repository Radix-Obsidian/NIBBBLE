'use client';

import { H } from '@highlight-run/next/client';

export interface UserIdentification {
  id: string;
  email: string;
  name?: string;
  userType?: 'creator' | 'cooker';
  signupDate?: string;
  plan?: string;
}

/**
 * Identify a user with Highlight.io for session tracking and monitoring
 * Call this after successful authentication or user data updates
 */
export const identifyUser = (user: UserIdentification) => {
  try {
    H.identify(user.email, {
      id: user.id,
      name: user.name || 'Unknown',
      userType: user.userType || 'unknown',
      signupDate: user.signupDate,
      plan: user.plan || 'free',
      // Add any additional metadata you want to track
    });
    
    console.log('✅ User identified with Highlight:', user.email);
  } catch (error) {
    console.warn('Failed to identify user with Highlight:', error);
  }
};

/**
 * Track custom events for user actions
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    H.track(eventName, properties);
    console.log(`📊 Event tracked: ${eventName}`, properties);
  } catch (error) {
    console.warn('Failed to track event with Highlight:', error);
  }
};

/**
 * Add custom context to the current session
 */
export const addSessionContext = (key: string, value: any) => {
  try {
    H.addSessionData(key, value);
  } catch (error) {
    console.warn('Failed to add session context:', error);
  }
};

/**
 * Clear user identification (for logout)
 */
export const clearUserIdentification = () => {
  try {
    H.identify('anonymous', {});
    console.log('🔓 User identification cleared');
  } catch (error) {
    console.warn('Failed to clear user identification:', error);
  }
};

// Common events you might want to track
export const HIGHLIGHT_EVENTS = {
  // Authentication
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_SUCCESS: 'login_success',
  LOGOUT: 'logout',
  
  // Waitlist
  WAITLIST_JOINED: 'waitlist_joined',
  WAITLIST_APPROVED: 'waitlist_approved',
  
  // User Actions
  RECIPE_CREATED: 'recipe_created',
  RECIPE_VIEWED: 'recipe_viewed',
  PROFILE_UPDATED: 'profile_updated',
  
  // Errors
  API_ERROR: 'api_error',
  FORM_ERROR: 'form_error',
  AUTHENTICATION_ERROR: 'authentication_error',
} as const;