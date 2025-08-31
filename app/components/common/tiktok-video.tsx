'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export function TikTokVideo({ url, lang = 'en', className }: { url: string; lang?: string; className?: string }) {
  const videoId = useMemo(() => {
    const m = url.match(/video\/(\d+)/)
    return m ? m[1] : ''
  }, [url])

  const src = useMemo(() => (
    videoId ? `https://www.tiktok.com/embed/v2/${videoId}?lang=${encodeURIComponent(lang)}` : ''
  ), [videoId, lang])

  if (!videoId) {
    return (
      <div className={cn('relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-600', className)}>
        <span className="font-semibold">Invalid TikTok URL</span>
      </div>
    )
  }

  return (
    <div className={cn('relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100', className)}>
      <iframe
        title="TikTok video"
        src={src}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
