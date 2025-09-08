'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { logger } from '@/lib/logger'

interface AuthFormProps {
  prefilledEmail?: string | null
}

export function AuthForm({ prefilledEmail }: AuthFormProps = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState(prefilledEmail || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  
  // Check if this is a direct signin access
  const isDirect = searchParams.get('direct') === 'true'

  // Check URL params to set initial mode
  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setMessage('Please enter both email and password')
      setMessageType('error')
      return
    }

    try {
      setLoading(true)
      setMessage('')
      
      logger.debug('Attempting sign in', { email })
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('Sign in error', error)
        setMessageType('error')
        
        // Provide user-friendly error messages
        switch (error.message) {
          case 'Invalid login credentials':
            setMessage('Invalid email or password. Please check your credentials and try again.')
            break
          case 'Email not confirmed':
            setMessage('Please verify your email address before signing in. Check your inbox for a confirmation link.')
            break
          case 'Too many requests':
            setMessage('Too many login attempts. Please wait a few minutes before trying again.')
            break
          default:
            setMessage(error.message.includes('email') || error.message.includes('password') 
              ? error.message 
              : 'Login failed. Please check your credentials and try again.')
        }
      } else {
        logger.info('Sign in successful')
        setMessageType('success')
        setMessage('Sign in successful! Redirecting...')
      }
    } catch (error) {
      logger.error('Unexpected sign in error', error)
      setMessageType('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If in direct mode, redirect to waitlist instead of allowing signup
    if (isDirect) {
      router.push('/cookers/beta')
      return
    }
    
    if (!email || !password) {
      setMessage('Please enter both email and password')
      setMessageType('error')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long')
      setMessageType('error')
      return
    }

    // Additional password validation
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setMessage('Password must contain at least one uppercase letter, lowercase letter, and number')
      setMessageType('error')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address')
      setMessageType('error')
      return
    }

    try {
      setLoading(true)
      setMessage('')
      
      logger.debug('Attempting sign up', { email })
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        logger.error('Sign up error', error)
        setMessageType('error')
        
        // Provide user-friendly error messages
        switch (error.message) {
          case 'User already registered':
            setMessage('An account with this email already exists. Please sign in instead.')
            break
          case 'Password should be at least 6 characters':
            setMessage('Password must be at least 6 characters long')
            break
          case 'Signup is disabled':
            setMessage('New account registration is currently disabled. Please contact support.')
            break
          default:
            setMessage(error.message.includes('email') 
              ? error.message 
              : 'Failed to create account. Please try again.')
        }
      } else {
        logger.info('Sign up successful')
        setMessageType('success')
        setMessage('Account created! Please check your email to verify your account.')
      }
    } catch (error) {
      logger.error('Unexpected sign up error', error)
      setMessageType('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      {/* Toggle between Sign In and Sign Up */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            !isSignUp
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            if (isDirect) {
              // If in direct mode, redirect new users to waitlist
              router.push('/cookers/beta')
              return
            }
            setIsSignUp(true)
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isSignUp
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {isDirect ? 'Join Waitlist' : 'Sign Up'}
        </button>
      </div>

      {isDirect && !isSignUp && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Existing users:</strong> Sign in with your email and password.
            <br />
            <strong>New to NIBBBLE?</strong> Click "Join Waitlist" above to get early access.
          </p>
        </div>
      )}

      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            messageType === 'error' 
              ? 'bg-red-100 border border-red-300 text-red-800' 
              : messageType === 'success'
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-blue-100 border border-blue-300 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading 
            ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
            : (isSignUp ? 'Create Account' : 'Sign In')
          }
        </Button>
      </form>
    </Card>
  )
}
