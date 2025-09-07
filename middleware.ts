import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Critical middleware error: Missing Supabase environment variables')
      return new NextResponse('Service temporarily unavailable', { status: 503 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    // Add timeout to prevent hanging
    const sessionTimeout = new Promise((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 5000) // 5s timeout
    })

    const sessionPromise = supabase.auth.getSession()
    const result = await Promise.race([sessionPromise, sessionTimeout]) as any
    const { data: { session } } = result

    const pathname = request.nextUrl.pathname

    // Protected routes that require authentication
    const protectedPaths = ['/dashboard', '/profile', '/settings', '/admin']
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

    // If accessing protected route without session, redirect to signin with return URL
    if (isProtectedPath && !session) {
      const returnUrl = encodeURIComponent(pathname)
      logger.info('Redirecting unauthenticated user', { pathname, returnUrl })
      return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url))
    }

    // If accessing signin/signup with session, redirect to dashboard or return URL
    const authPaths = ['/signin', '/signup', '/auth']
    const isAuthPath = authPaths.some(path => pathname.startsWith(path))
    
    if (isAuthPath && session && pathname !== '/auth/callback') {
      const returnUrl = request.nextUrl.searchParams.get('returnUrl')
      const redirectPath = returnUrl ? decodeURIComponent(returnUrl) : '/dashboard'
      logger.info('Redirecting authenticated user', { pathname, redirectPath })
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // Add security headers
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return supabaseResponse

  } catch (error) {
    logger.error('Middleware error', error)
    
    // For critical paths, fail safe by allowing access but log the error
    const pathname = request.nextUrl.pathname
    
    if (pathname.startsWith('/api/health') || pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }
    
    // For other paths, show maintenance page
    return new NextResponse('Service temporarily unavailable. Please try again.', { 
      status: 503,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'text/plain'
      }
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}