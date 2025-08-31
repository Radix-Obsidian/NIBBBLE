'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from '@/app/components/auth/auth-form'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'

export default function SignInPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    console.log('🔐 SignInPage useEffect - user:', user, 'authLoading:', authLoading, 'hasRedirected:', hasRedirected)
    if (user && !authLoading && !hasRedirected) {
      console.log('🔐 SignInPage redirecting to dashboard...')
      setHasRedirected(true)
      // Use router.push with a small delay to prevent throttling
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    }
  }, [user, authLoading, hasRedirected, router])

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
