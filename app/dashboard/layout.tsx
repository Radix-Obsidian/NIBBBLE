'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <>{children}</>
}
