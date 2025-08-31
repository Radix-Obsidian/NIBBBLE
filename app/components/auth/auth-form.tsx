'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'

export function AuthForm() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  // Redirect if user is authenticated
  useEffect(() => {
    console.log('🔐 AuthForm useEffect - user:', user, 'authLoading:', authLoading)
    if (user && !authLoading) {
      console.log('🔐 AuthForm redirecting to dashboard...')
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        console.log('🔐 Attempting sign in...')
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        console.log('🔐 Sign in successful!')
        setMessage('Signed in successfully!')
        
        // The useAuth hook will handle the redirect automatically
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-gray-600">
          {isSignUp ? 'Join PantryPals and start sharing recipes' : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('error') || message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full"
          size="lg"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
        
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage('')
          }}
          className="text-sm text-gray-600 hover:text-orange-600 transition-colors w-full"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </form>
    </Card>
  )
}
