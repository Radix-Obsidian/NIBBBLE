'use client'

import { useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Bell, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { logger } from '@/lib/logger'
import { useAuth } from '@/hooks/useAuth'

export interface HeaderProps {
  user: SupabaseUser
  onSearch: (query: string) => void
  onNotificationClick: () => void
}

export function Header({ user, onSearch, onNotificationClick }: HeaderProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    logger.info('Global search submitted', { query })
    onSearch(query)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">PantryPals</h1>

          <div className="flex-1 max-w-xl mx-6">
            <form onSubmit={handleSubmit}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, creators..."
                icon={<Search className="w-5 h-5" />}
                aria-label="Global search"
              />
            </form>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/dashboard/recipes">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </Link>
            <Button variant="outline" size="sm" aria-label="Notifications" onClick={onNotificationClick}>
              <Bell className="w-5 h-5" />
            </Button>
            <div className="text-sm text-gray-600 hidden sm:block">{user.email}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
