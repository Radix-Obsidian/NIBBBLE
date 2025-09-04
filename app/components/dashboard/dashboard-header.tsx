'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { logger } from '@/lib/logger'

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    logger.info('Search initiated', { query: searchQuery })
    // TODO: Implement search functionality
  }

  const handleSignOut = async () => {
    logger.info('User signing out')
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-[#FF375F]">NIBBBLE Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button type="submit" variant="outline" className="ml-2">
                Search
              </Button>
            </form>
            
            <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
