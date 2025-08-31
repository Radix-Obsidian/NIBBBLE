import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './client'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsqtruntoqahnewlotka.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXRydW50b3FhaG5ld2xvdGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODQ1MzAsImV4cCI6MjA3MjE2MDUzMH0.lo9bbbDpJ3LLnDhj61qvuyPshNw5w1vFsCnMXwZ1wWo',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getServerSupabaseClient() {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return { supabase, user }
  } catch (error) {
    console.error('Error getting server supabase client:', error)
    return { supabase, user: null }
  }
}
