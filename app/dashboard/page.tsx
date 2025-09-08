'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect dashboard to social feed
    router.replace('/feed')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-sm text-gray-600 mt-4">Redirecting to your feed...</p>
      </div>
    </div>
  )
}