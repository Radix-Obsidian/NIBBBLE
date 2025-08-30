import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from './client'

export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies })
}

export async function getServerSupabaseClient() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return { supabase, user }
  } catch (error) {
    console.error('Error getting server supabase client:', error)
    return { supabase, user: null }
  }
}
