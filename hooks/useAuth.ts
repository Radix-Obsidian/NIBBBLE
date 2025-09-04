'use client'

import { useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Memoize session retrieval to prevent unnecessary re-renders
  const getSession = useCallback(async () => {
    try {
      logger.debug('Getting initial session')
      const { data: { session } } = await supabase.auth.getSession()
      logger.debug('Initial session retrieved', { hasSession: !!session })
      setUser(session?.user ?? null)
    } catch (error) {
      logger.error('Error getting session', error)
    } finally {
      setLoading(false)
      setInitialized(true)
      logger.debug('Initial loading complete')
    }
  }, [])

  useEffect(() => {
    // Use requestIdleCallback for non-critical initialization
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => getSession())
    } else {
      // Fallback for older browsers
      setTimeout(getSession, 0)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, userId: session?.user?.id })
        setUser(session?.user ?? null)
        if (!initialized) {
          setLoading(false)
          setInitialized(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [getSession, initialized])

  const signOut = async () => {
    try {
      // Clear client-side state first
      setUser(null)
      setLoading(false)
      
      // Clear any local storage items that might contain user data
      try {
        localStorage.removeItem('pp_recently_viewed')
        sessionStorage.clear()
      } catch (e) {
        // Ignore errors from localStorage/sessionStorage operations
        logger.debug('Error clearing storage during logout', e)
      }
      
      // Sign out from Supabase (this will clear cookies and server-side session)
      await supabase.auth.signOut()
      
      logger.info('User signed out successfully - all state cleared')
    } catch (error) {
      logger.error('Error signing out', error)
      // Even if Supabase signOut fails, ensure local state is cleared
      setUser(null)
      setLoading(false)
    }
  }

  return { user, loading, signOut }
}
