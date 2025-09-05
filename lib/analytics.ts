/**
 * Analytics integration for Vercel Analytics and Hotjar
 */

declare global {
  interface Window {
    va?: (event: string, options?: Record<string, unknown>) => void
    hj?: (action: string, ...args: any[]) => void;
  }
}

// Vercel Analytics
export const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: event,
        properties
      })
    }
  },

  page: (url: string) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('pageview', { url })
    }
  },

  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('event', {
        name: 'identify',
        properties: { userId, traits }
      })
    }
  }
}

// Hotjar Analytics for heat mapping and user behavior tracking
export const hotjar = {
  // Track custom events
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('event', eventName, properties);
    }
  },

  // Track specific Nibbble events
  trackLandingPage: (action: string, properties?: Record<string, any>) => {
    hotjar.track('landing_page_action', { action, ...properties });
  },

  trackDashboard: (section: string, action: string, properties?: Record<string, any>) => {
    hotjar.track('dashboard_interaction', { section, action, ...properties });
  },

  trackStripeConnect: (eventType: string, properties?: Record<string, any>) => {
    hotjar.track('stripe_connect_event', { event_type: eventType, ...properties });
  },

  trackRecipe: (action: string, recipeId?: string, properties?: Record<string, any>) => {
    hotjar.track('recipe_interaction', { action, recipe_id: recipeId, ...properties });
  },

  trackAuth: (action: string, properties?: Record<string, any>) => {
    hotjar.track('auth_action', { action, ...properties });
  },

  trackNavigation: (from: string, to: string, method: string = 'click') => {
    hotjar.track('navigation', {
      from,
      to,
      method,
      timestamp: new Date().toISOString()
    });
  },

  trackButtonClick: (buttonName: string, location: string, properties?: Record<string, any>) => {
    hotjar.track('button_click', {
      button_name: buttonName,
      location,
      ...properties,
      timestamp: new Date().toISOString()
    });
  },

  trackFormInteraction: (formName: string, action: 'start' | 'submit' | 'abandon', fields?: string[]) => {
    hotjar.track('form_interaction', {
      form_name: formName,
      action,
      fields: fields || [],
      timestamp: new Date().toISOString()
    });
  }
}
