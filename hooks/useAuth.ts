'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        logger.debug('Getting initial session')
        const { data: { session } } = await supabase.auth.getSession()
        logger.debug('Initial session retrieved', { hasSession: !!session })
        setUser(session?.user ?? null)
      } catch (error) {
        logger.error('Error getting session', error)
      } finally {
        setLoading(false)
        logger.debug('Initial loading complete')
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, userId: session?.user?.id })
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      logger.info('User signed out successfully')
    } catch (error) {
      logger.error('Error signing out', error)
    }
  }

  return { user, loading, signOut }
}
