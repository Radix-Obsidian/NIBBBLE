import React from 'react'
import { Utensils } from 'lucide-react'

interface PlaceholderImageProps {
  title?: string
  className?: string
}

export function PlaceholderImage({ title, className = '' }: PlaceholderImageProps) {
  const letter = (title || '').trim().slice(0, 1).toUpperCase() || ''

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 ${className}`}>
      <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-orange-300/40 blur-2xl mix-blend-multiply animate-blob" />
      <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-amber-300/40 blur-2xl mix-blend-multiply animate-blob [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-red-300/30 blur-2xl mix-blend-multiply animate-blob [animation-delay:4s]" />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {letter ? (
          <div className="inline-flex items-center justify-center rounded-xl bg-white/70 px-4 py-2 backdrop-blur-md shadow-soft ring-1 ring-white/60">
            <span className="text-4xl font-bold text-gray-800 tracking-wide">{letter}</span>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center rounded-full bg-white/70 p-3 backdrop-blur-md shadow-soft ring-1 ring-white/60">
            <Utensils className="w-8 h-8 text-orange-500" />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_40%,rgba(255,255,255,0.45)_50%,rgba(255,255,255,0)_60%,rgba(255,255,255,0)_100%)] [background-size:200%_100%] animate-shimmer" />
    </div>
  )
}
