'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import { Sidebar } from '@/app/components/dashboard/sidebar'
import { Header } from '@/app/components/dashboard/header'
import { NotificationsPanel } from '@/app/components/dashboard/notifications-panel'
import { SentryFeedbackButton } from '@/app/components/common/sentry-feedback-button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Progressive loading for non-critical components
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setComponentsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-responsive text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h1 className="text-responsive-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-responsive text-gray-600 mb-6">You need to be signed in to view this page.</p>
            <button 
              onClick={() => window.location.href = '/signin?direct=true'}
              className="btn bg-primary-600 text-white hover:bg-primary-700 w-full"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <div className={`
            fixed top-0 left-0 h-full z-50 lg:relative lg:z-auto lg:flex-shrink-0
            transform transition-all duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isMobile ? 'w-80' : 'w-64 lg:w-auto'}
          `}>
            <Sidebar 
              isCollapsed={collapsed} 
              onToggle={() => setCollapsed((c) => !c)} 
              currentPath={pathname}
              onMobileClose={() => setMobileMenuOpen(false)}
              isMobile={isMobile}
            />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
            {/* Header */}
            <Header 
              user={user} 
              onSearch={() => {}} 
              onNotificationClick={() => setShowNotifications((v) => !v)}
              onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              isMobile={isMobile}
            />
            
            {/* Main Content */}
            <main className="flex-1 container-responsive">
              <div className="py-4 sm:py-6 lg:py-8">
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
        
        {/* Notifications Panel */}
        <NotificationsPanel 
          open={showNotifications} 
          onClose={() => setShowNotifications(false)} 
          userId={user.id} 
        />

        {/* Floating Feedback Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <SentryFeedbackButton 
            variant="default" 
            size="sm"
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
          />
        </div>
    </div>
  )
}
