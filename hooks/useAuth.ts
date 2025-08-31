'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        console.log('🔐 Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Initial session:', session)
        console.log('🔐 Initial user:', session?.user)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('🔐 Error getting session:', error)
      } finally {
        setLoading(false)
        console.log('🔐 Initial loading set to false')
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        console.log('🔐 Session data:', session)
        console.log('🔐 User data:', session?.user)
        setUser(session?.user ?? null)
        setLoading(false)
        console.log('🔐 Updated user state:', session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return { user, loading, signOut }
}
