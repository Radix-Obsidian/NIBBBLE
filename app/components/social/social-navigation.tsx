'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  active: boolean
}

interface SocialNavigationProps {
  items: NavigationItem[]
  orientation: 'horizontal' | 'vertical'
  className?: string
}

export function SocialNavigation({ items, orientation, className }: SocialNavigationProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState(items.find(item => item.active)?.id || 'home')

  const handleNavigation = (item: NavigationItem) => {
    setActiveId(item.id)
    router.push(item.href)
  }

  return (
    <nav className={cn(
      'p-4',
      orientation === 'horizontal' && 'flex items-center justify-around',
      orientation === 'vertical' && 'flex flex-col space-y-2',
      className
    )}>
      {items.map((item) => {
        const isActive = item.active || activeId === item.id
        
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={(e) => {
              e.preventDefault()
              handleNavigation(item)
            }}
            className={cn(
              'group flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 relative',
              orientation === 'horizontal' && 'flex-col gap-1 min-w-0 flex-1',
              orientation === 'vertical' && 'w-full hover:bg-gray-50',
              isActive && orientation === 'vertical' && 'bg-gradient-to-r from-pink-50 to-orange-50 text-pink-600',
              isActive && orientation === 'horizontal' && 'text-pink-600',
              !isActive && 'text-gray-600 hover:text-gray-900'
            )}
          >
            {/* Icon */}
            <div className={cn(
              'relative flex items-center justify-center transition-transform duration-200',
              isActive && 'scale-110',
              orientation === 'horizontal' && 'mb-1'
            )}>
              {item.icon}
              {isActive && orientation === 'horizontal' && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-600 rounded-full" />
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              'font-medium transition-all duration-200',
              orientation === 'horizontal' && 'text-xs',
              orientation === 'vertical' && 'text-sm',
              isActive && orientation === 'vertical' && 'text-pink-600 font-semibold'
            )}>
              {item.label}
            </span>
            
            {/* Vertical Active Indicator */}
            {isActive && orientation === 'vertical' && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-600 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}