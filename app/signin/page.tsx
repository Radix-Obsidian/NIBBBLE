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

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

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
