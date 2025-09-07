/**
 * Analytics integration for Vercel Analytics
 */

declare global {
  interface Window {
    va?: (event: string, options?: Record<string, unknown>) => void
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

