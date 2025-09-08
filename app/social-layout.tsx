'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/ui/loading-spinner'
import { SocialNavigation } from '@/app/components/social/social-navigation'
import { SocialHeader } from '@/app/components/social/social-header'
import { NotificationsPanel } from '@/app/components/dashboard/notifications-panel'
import { SentryFeedbackButton } from '@/app/components/common/sentry-feedback-button'
import { GuestBrowsingProvider } from '@/hooks/useGuestBrowsing'
import { Heart, Home, Search, Plus, User } from 'lucide-react'

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Progressive loading for non-critical components
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setComponentsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Navigation items for social platform
  const navigationItems = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: <Home className="w-6 h-6" />, 
      href: '/feed', 
      active: pathname === '/feed' || pathname === '/' 
    },
    { 
      id: 'discover', 
      label: 'Discover', 
      icon: <Search className="w-6 h-6" />, 
      href: '/discover', 
      active: pathname.startsWith('/discover') 
    },
    { 
      id: 'create', 
      label: 'Create', 
      icon: <Plus className="w-6 h-6" />, 
      href: '/create', 
      active: pathname.startsWith('/create') 
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: <Heart className="w-6 h-6" />, 
      href: '/activity', 
      active: pathname.startsWith('/activity') 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <User className="w-6 h-6" />, 
      href: '/profile', 
      active: pathname.startsWith('/profile') 
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-orange-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-sm text-gray-600 mt-4">Loading NIBBBLE...</p>
        </div>
      </div>
    )
  }

  // Allow guest browsing - removed authentication requirement

  return (
    <GuestBrowsingProvider maxViews={5}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
          {/* Desktop/Tablet Header */}
          {!isMobile && (
            <SocialHeader 
              user={user} 
              onNotificationClick={() => setShowNotifications(!showNotifications)}
              showSearch={true}
            />
          )}
          
          {/* Main Layout Container */}
          <div className="flex min-h-screen">
            {/* Desktop Sidebar Navigation */}
            {!isMobile && (
              <div className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] z-30">
                <SocialNavigation 
                  items={navigationItems}
                  orientation="vertical"
                  className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200"
                />
              </div>
            )}
            
            {/* Main Content Area */}
            <main className={`flex-1 min-w-0 ${!isMobile ? 'md:ml-64 mt-16' : ''}`}>
              <div className="max-w-2xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          
          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 z-50">
              <SocialNavigation 
                items={navigationItems}
                orientation="horizontal"
                className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
              />
            </div>
          )}
          
          {/* Mobile Search Bar */}
          {isMobile && (
            <SocialHeader 
              user={user} 
              onNotificationClick={() => setShowNotifications(!showNotifications)}
              showSearch={true}
              isMobile={true}
            />
          )}
          
          {/* Notifications Panel - Only for authenticated users */}
          {componentsLoaded && user && (
            <NotificationsPanel 
              open={showNotifications} 
              onClose={() => setShowNotifications(false)} 
              userId={user.id} 
            />
          )}

          {/* Mobile Padding for Bottom Navigation */}
          {isMobile && <div className="h-20" />}

          {/* Floating Feedback Button - Hidden on Mobile */}
          {!isMobile && (
            <div className="fixed bottom-6 right-6 z-40">
              <SentryFeedbackButton 
                variant="default" 
                size="sm"
                className="shadow-lg hover:shadow-xl transition-shadow duration-200"
              />
            </div>
          )}
      </div>
    </GuestBrowsingProvider>
  )
}