'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/app/components/auth/auth-form'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'
import { logger } from '@/lib/logger'

function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()

  // Get trigger-specific messaging
  const getTriggerMessage = (trigger: string | null, isDirect: boolean) => {
    if (trigger) {
      switch (trigger) {
        case 'recipe_view_limit_reached':
          return 'Ready to save recipes and join the community? Sign up for free!'
        case 'bookmark_attempt_guest':
          return 'Sign up to save your favorite recipes and build your collection'
        case 'like_attempt_guest':
          return 'Join NIBBBLE to support creators and get personalized recommendations'
        case 'comment_attempt_guest':
          return 'Sign up to join the conversation and share cooking tips'
        case 'follow_attempt_guest':
          return 'Create your account to follow creators and never miss new recipes'
        default:
          return 'Join the NIBBBLE community of food lovers and creators'
      }
    }
    return isDirect 
      ? 'Sign in to your account' 
      : 'Sign in to your account or create a new one to get started'
  }
  
  // Check if user is accessing signin directly (bypass waitlist)
  const isDirect = searchParams.get('direct') === 'true'
  
  // Get additional parameters for better UX
  const email = searchParams.get('email')
  const message = searchParams.get('message')
  const instant = searchParams.get('instant') === 'true'
  const trigger = searchParams.get('trigger')
  const from = searchParams.get('from')

  useEffect(() => {
    if (user && !loading) {
      // Redirect to original page or feed after successful auth
      const redirectTo = from || '/feed'
      logger.info('User authenticated, redirecting to', { redirectTo })
      router.push(redirectTo)
    }
  }, [user, loading, router, from])

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {trigger ? 'Join NIBBBLE' : 'Welcome to NIBBBLE'}
            </h1>
            <p className="text-gray-600">
              {message || getTriggerMessage(trigger, isDirect)}
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

  // No waitlist gate needed - direct access to signin
  return <SignInContent />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInPageContent />
    </Suspense>
  )
}
