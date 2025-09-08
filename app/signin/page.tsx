'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/app/components/auth/auth-form'
import { WaitlistGate } from '@/app/components/auth/waitlist-gate'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'
import { logger } from '@/lib/logger'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  
  // Check if user is accessing signin directly (bypass waitlist)
  const isDirect = searchParams.get('direct') === 'true'
  
  // Get additional parameters for better UX
  const email = searchParams.get('email')
  const message = searchParams.get('message')
  const instant = searchParams.get('instant') === 'true'

  useEffect(() => {
    if (user && !loading) {
      logger.info('User authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  // Render the sign-in form without waitlist gate if accessing directly
  const SignInContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to NIBBBLE</h1>
            <p className="text-gray-600">
              {message || (isDirect 
                ? 'Sign in to your account' 
                : 'Sign in to your account or create a new one to get started'
              )}
            </p>
          </div>
          
          <AuthForm prefilledEmail={email} />
        </div>
      </main>
      
      <Footer />
    </div>
  )

  // If accessing directly, skip waitlist gate
  if (isDirect) {
    return <SignInContent />
  }

  // Otherwise, use waitlist gate as before
  return (
    <WaitlistGate userEmail={user?.email}>
      <SignInContent />
    </WaitlistGate>
  )
}
