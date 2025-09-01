'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import { Sidebar } from '@/app/components/dashboard/sidebar'
import { Header } from '@/app/components/dashboard/header'
import { NotificationsPanel } from '@/app/components/dashboard/notifications-panel'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-responsive">
          <h1 className="text-responsive-xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-responsive text-gray-600">You need to be signed in to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col lg:flex-row">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Mobile */}
      <div className={`
        fixed top-0 left-0 h-full z-50 lg:relative lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          isCollapsed={collapsed} 
          onToggle={() => setCollapsed((c) => !c)} 
          currentPath={pathname}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header 
          user={user} 
          onSearch={() => {}} 
          onNotificationClick={() => setShowNotifications((v) => !v)}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        
        <main className="flex-1 container mx-auto space-responsive">
          <div className="space-y-6">
            {children}
          </div>
        </main>
        
        <NotificationsPanel 
          open={showNotifications} 
          onClose={() => setShowNotifications(false)} 
          userId={user.id} 
        />
      </div>
    </div>
  )
}
