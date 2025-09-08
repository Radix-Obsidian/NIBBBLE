'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Search, Menu, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { Button } from '@/app/components/ui/button'
import { cn } from '@/lib/utils'

interface SocialHeaderProps {
  user: any
  onNotificationClick: () => void
  showSearch?: boolean
  isMobile?: boolean
}

export function SocialHeader({ 
  user, 
  onNotificationClick, 
  showSearch = true, 
  isMobile = false 
}: SocialHeaderProps) {
  const [showSearchBar, setShowSearchBar] = useState(false)

  const displayName = user?.user_metadata?.display_name || 
                     user?.email?.split('@')[0] || 
                     'User'

  return (
    <header className={cn(
      'bg-white/95 backdrop-blur-md border-b border-gray-200 z-40',
      !isMobile && 'fixed top-0 left-0 right-0',
      isMobile && 'sticky top-0'
    )}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-4">
          <Link href="/feed" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            {!isMobile && (
              <span className="font-bold text-xl bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                NIBBBLE
              </span>
            )}
          </Link>
        </div>

        {/* Center - Search Bar (Desktop) */}
        {showSearch && !isMobile && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes, creators..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          {showSearch && isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="p-2"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}

          {/* Messages */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 relative"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="p-2 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </Button>

          {/* User Avatar */}
          <Link href="/profile" className="ml-2">
            <Avatar className="w-8 h-8 ring-2 ring-pink-500/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearchBar && isMobile && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, creators..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}