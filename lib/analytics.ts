/**
 * Vercel Analytics integration
 */

declare global {
  interface Window {
    va?: (event: string, options?: Record<string, unknown>) => void
  }
}

export const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', event, properties)
    }
  },

  page: (url: string) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('page', { url })
    }
  },

  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.va) {
      window.va('identify', { userId, traits })
    }
  }
}
