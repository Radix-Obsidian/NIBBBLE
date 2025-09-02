"use client"

import React, { useEffect, useRef } from 'react'

interface AnimatedEmojiProps {
  emoji: string
  size?: number // px
  speed?: number // px per second
  className?: string
}

export function AnimatedEmoji({ emoji, size = 28, speed = 120, className = '' }: AnimatedEmojiProps) {
  const layerRef = useRef<HTMLDivElement | null>(null)
  const emojiRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const layer = layerRef.current
    const el = emojiRef.current
    if (!layer || !el) return

    let x = Math.random() * 40 + 8
    let y = Math.random() * 40 + 8
    let dx = (Math.random() > 0.5 ? 1 : -1) * speed
    let dy = (Math.random() > 0.5 ? 1 : -1) * speed

    let last = performance.now()
    let raf = 0

    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now

      const rect = layer.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      x += dx * dt
      y += dy * dt

      const maxX = Math.max(0, w - size)
      const maxY = Math.max(0, h - size)

      if (x <= 0) { x = 0; dx *= -1 }
      if (x >= maxX) { x = maxX; dx *= -1 }
      if (y <= 0) { y = 0; dy *= -1 }
      if (y >= maxY) { y = maxY; dy *= -1 }

      el.style.transform = `translate(${x}px, ${y}px)`
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [speed, size])

  return (
    <div ref={layerRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden>
      <span
        ref={emojiRef}
        style={{ width: size, height: size, display: 'inline-flex' }}
        className="items-center justify-center text-2xl will-change-transform drop-shadow-sm"
      >
        {emoji}
      </span>
    </div>
  )
}
