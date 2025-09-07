import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  try {
    // Handle OAuth errors first
    if (error) {
      logger.error('OAuth authentication error', { error, errorDescription })
      const errorMessage = encodeURIComponent(errorDescription || error || 'Authentication failed')
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=${errorMessage}`)
    }

    // Require auth code for session exchange
    if (!code) {
      logger.warn('Auth callback missing code parameter')
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=${encodeURIComponent('Missing authentication code')}`)
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Critical auth error: Missing Supabase environment variables')
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=${encodeURIComponent('Service configuration error')}`)
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
            } catch (error) {
              logger.warn('Cookie setting failed in auth callback', error)
              // Non-critical error - middleware will handle session refresh
            }
          },
        },
      }
    )

    // Exchange code for session with timeout
    const exchangeTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session exchange timeout')), 10000) // 10s timeout
    })

    const exchangePromise = supabase.auth.exchangeCodeForSession(code)
    const { data, error: exchangeError } = await Promise.race([exchangePromise, exchangeTimeout]) as any

    if (exchangeError) {
      logger.error('Session exchange failed', { error: exchangeError, code: code.substring(0, 10) + '...' })
      const errorMessage = encodeURIComponent('Failed to complete authentication. Please try again.')
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=${errorMessage}`)
    }

    if (!data?.session?.user) {
      logger.warn('Session exchange succeeded but no user data returned')
      const errorMessage = encodeURIComponent('Authentication incomplete. Please try again.')
      return NextResponse.redirect(`${requestUrl.origin}/signin?error=${errorMessage}`)
    }

    logger.info('Successful auth callback', { userId: data.session.user.id })

    // Get return URL from state or default to dashboard
    const state = requestUrl.searchParams.get('state')
    let redirectPath = '/dashboard'
    
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state))
        if (stateData.returnUrl && stateData.returnUrl.startsWith('/')) {
          redirectPath = stateData.returnUrl
        }
      } catch (error) {
        logger.warn('Invalid state parameter in auth callback', { state, error })
        // Use default redirect path
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)

  } catch (error) {
    logger.error('Unexpected error in auth callback', error)
    const errorMessage = encodeURIComponent('An unexpected error occurred. Please try again.')
    return NextResponse.redirect(`${requestUrl.origin}/signin?error=${errorMessage}`)
  }
}
