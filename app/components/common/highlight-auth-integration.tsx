'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { identifyUser, clearUserIdentification, trackEvent, HIGHLIGHT_EVENTS } from '@/lib/highlight';

export default function HighlightAuthIntegration() {

  useEffect(() => {
    // Get initial session
    const initializeHighlightAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Identify the user with Highlight
        identifyUser({
          id: session.user.id,
          email: session.user.email || 'unknown@email.com',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          userType: session.user.user_metadata?.user_type || 'unknown',
          signupDate: session.user.created_at,
          plan: 'alpha', // Since this is alpha testing
        });
        
        // Track login success
        trackEvent(HIGHLIGHT_EVENTS.LOGIN_SUCCESS, {
          userId: session.user.id,
          email: session.user.email,
          loginMethod: session.user.app_metadata?.provider || 'email',
        });
      }
    };

    initializeHighlightAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              identifyUser({
                id: session.user.id,
                email: session.user.email || 'unknown@email.com',
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                userType: session.user.user_metadata?.user_type || 'unknown',
                signupDate: session.user.created_at,
                plan: 'alpha',
              });
              
              trackEvent(HIGHLIGHT_EVENTS.LOGIN_SUCCESS, {
                userId: session.user.id,
                email: session.user.email,
                loginMethod: session.user.app_metadata?.provider || 'email',
              });
            }
            break;
            
          case 'SIGNED_UP':
            if (session?.user) {
              identifyUser({
                id: session.user.id,
                email: session.user.email || 'unknown@email.com',
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                userType: session.user.user_metadata?.user_type || 'unknown',
                signupDate: session.user.created_at,
                plan: 'alpha',
              });
              
              trackEvent(HIGHLIGHT_EVENTS.SIGNUP_COMPLETED, {
                userId: session.user.id,
                email: session.user.email,
                signupMethod: session.user.app_metadata?.provider || 'email',
              });
            }
            break;
            
          case 'SIGNED_OUT':
            trackEvent(HIGHLIGHT_EVENTS.LOGOUT);
            clearUserIdentification();
            break;
            
          case 'TOKEN_REFRESHED':
            // Session refreshed, user is still authenticated
            if (session?.user) {
              identifyUser({
                id: session.user.id,
                email: session.user.email || 'unknown@email.com',
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
                userType: session.user.user_metadata?.user_type || 'unknown',
                signupDate: session.user.created_at,
                plan: 'alpha',
              });
            }
            break;
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // This component doesn't render anything, it just handles auth integration
  return null;
}