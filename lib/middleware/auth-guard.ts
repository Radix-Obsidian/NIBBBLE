import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role
    }
  } catch (error) {
    console.error('Auth guard error:', error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(request, user)
  }
}

export function optionalAuth(handler: (request: NextRequest, user: AuthenticatedUser | null) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request)
    return handler(request, user)
  }
}

// Higher-order function to combine rate limiting with auth
export function withRateLimitAndAuth(
  rateLimiter: (request: NextRequest) => NextResponse | null,
  authHandler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Check rate limit first
    const rateLimitResponse = rateLimiter(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Then check authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    return authHandler(request, user)
  }
}
