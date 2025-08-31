'use client'

import { AuthForm } from '@/app/components/auth/auth-form'
import { Header } from '@/app/components/layout/header'
import { Footer } from '@/app/components/layout/footer'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your PantryPals account</p>
          </div>
          
          <AuthForm />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
