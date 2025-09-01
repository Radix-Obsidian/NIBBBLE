'use client'

import { useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Bell, Search, Plus, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { logger } from '@/lib/logger'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export interface HeaderProps {
  user: SupabaseUser
  onSearch: (query: string) => void
  onNotificationClick: () => void
  onMobileMenuToggle: () => void
}

export function Header({ user, onSearch, onNotificationClick, onMobileMenuToggle }: HeaderProps) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    logger.info('Global search submitted', { query })
    onSearch(query)
    setSearchOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/signin')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            PantryPals
          </h1>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <form onSubmit={handleSubmit} className="w-full">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, creators..."
                icon={<Search className="w-5 h-5" />}
                aria-label="Global search"
              />
            </form>
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/dashboard/recipes">
              <Button size="sm" className="btn">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Create</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              aria-label="Notifications" 
              onClick={onNotificationClick}
              className="btn"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <div className="text-sm text-gray-600 hidden lg:block">{user.email}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="btn"
            >
              Sign out
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              aria-label="Notifications" 
              onClick={onNotificationClick}
              className="btn p-2"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Link href="/dashboard/recipes">
              <Button size="sm" className="btn p-2">
                <Plus className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-gray-100 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recipes, creators..."
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
