'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    console.log('🔐 DashboardLayout useEffect - user:', user, 'loading:', loading, 'hasRedirected:', hasRedirected)
    if (!loading && !user && !hasRedirected) {
      console.log('🔐 DashboardLayout redirecting to signin...')
      setHasRedirected(true)
      // Use router.push with a small delay to prevent throttling
      setTimeout(() => {
        router.push('/signin')
      }, 100)
    }
  }, [user, loading, hasRedirected, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  return <>{children}</>
}
