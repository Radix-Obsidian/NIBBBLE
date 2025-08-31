'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/app/components/auth/auth-form'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'

export default function SignInPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Simple redirect when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log('🔐 User authenticated, redirecting to dashboard...')
      // Use window.location.href for a more reliable redirect
      window.location.href = '/dashboard'
    }
  }, [user, authLoading, router])

  // If user is already authenticated, show loading
  if (user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <AuthForm />
      </main>
      
      <Footer />
    </div>
  )
}
