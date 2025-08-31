'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Home,
  Search,
  Heart,
  BookOpen,
  Plus,
  User,
  Settings,
  TrendingUp,
  Clock,
  Star,
  Users,
  BarChart3
} from 'lucide-react'
import { Button } from '../ui/button'

export interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  currentPath: string
}

export function Sidebar({ isCollapsed, onToggle, currentPath }: SidebarProps) {
  const navigationItems = useMemo(() => ([
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and activity' },
    { name: 'Discover', href: '/dashboard/discover', icon: Search, description: 'Find new recipes' },
    { name: 'My Recipes', href: '/dashboard/recipes', icon: BookOpen, description: 'Your created recipes' },
    { name: 'Favorites', href: '/dashboard/favorites', icon: Heart, description: 'Saved recipes' },
    { name: 'Collections', href: '/dashboard/collections', icon: TrendingUp, description: 'Organized recipe lists' },
    { name: 'Social', href: '/dashboard/social', icon: Users, description: 'Connect with chefs' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance insights' },
    { name: 'Recent', href: '/dashboard/recent', icon: Clock, description: 'Recently viewed' },
    { name: 'Top Rated', href: '/dashboard/top-rated', icon: Star, description: 'Community favorites' }
  ]), [])

  const userItems = useMemo(() => ([
    { name: 'Profile', href: '/dashboard/profile', icon: User, description: 'Your profile settings' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'App preferences' }
  ]), [])

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <Link href="/dashboard/recipes">
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {!isCollapsed && 'Create Recipe'}
          </Button>
        </Link>
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
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {!isCollapsed && (
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal">
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
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${
                      isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {!isCollapsed && (
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500 font-normal">
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
      </nav>

      <div className="absolute bottom-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-8 h-8 p-0"
        >
          <div className={`w-4 h-4 border-2 border-gray-400 rounded transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`}>
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45 translate-x-0.5 translate-y-0.5"></div>
          </div>
        </Button>
      </div>
    </aside>
  )
}
