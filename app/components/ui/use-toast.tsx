'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts: Toast[] = []
const listeners: ((toasts: Toast[]) => void)[] = []

function emitChange() {
  listeners.forEach(listener => listener([...toasts]))
}

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2)
  const newToast = { id, title, description, variant }
  
  toasts.push(newToast)
  emitChange()
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      emitChange()
    }
  }, 5000)
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])
  
  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])
  
  return {
    toast,
    toasts: currentToasts,
    subscribe
  }
}