'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Home,
  Search,
  BookOpen,
  Plus,
  Settings,
  TrendingUp,
  Users,
  BarChart3,
  X,
  Menu
} from 'lucide-react'
import { Button } from '../ui/button'

export interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  currentPath: string
  onMobileClose?: () => void
}

export function Sidebar({ isCollapsed, onToggle, currentPath, onMobileClose }: SidebarProps) {
  const navigationItems = useMemo(() => ([
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and activity' },
    { name: 'Discover', href: '/dashboard/discover', icon: Search, description: 'Find new recipes' },
    { name: 'My Recipes', href: '/dashboard/recipes', icon: BookOpen, description: 'Your created recipes' },
    { name: 'Collections', href: '/dashboard/collections', icon: TrendingUp, description: 'Organized recipe lists' },
    { name: 'Social', href: '/dashboard/social', icon: Users, description: 'Connect with chefs' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance insights' }
  ]), [])

  const userItems = useMemo(() => ([
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'App preferences' }
  ]), [])

  return (
    <aside className={`
      bg-white border-r border-gray-200 transition-all duration-300
      w-64 lg:w-auto lg:flex-shrink-0
      ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
      h-full overflow-y-auto
    `}>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">PantryPals</h1>
        <button
          onClick={onMobileClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Toggle Button */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && <h1 className="text-xl font-bold text-gray-900">PantryPals</h1>}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="mt-6">
        <div className="px-4">
          <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${
            isCollapsed ? 'sr-only' : ''
          }`}>
            Navigation
          </h3>
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = currentPath === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                      min-h-[44px] touch-manipulation
                      ${isActive
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                    } ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal truncate">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="mt-8 px-4">
          <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${
            isCollapsed ? 'sr-only' : ''
          }`}>
            Account
          </h3>
          <ul className="space-y-1">
            {userItems.map((item) => {
              const isActive = currentPath === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                      min-h-[44px] touch-manipulation
                      ${isActive
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                    } ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal truncate">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Mobile Bottom Spacing */}
        <div className="lg:hidden h-20" />
      </nav>
    </aside>
  )
}
