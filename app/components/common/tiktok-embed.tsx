'use client'

import { useEffect, useId } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  url: string
  videoId: string
  className?: string
}

export function TikTokEmbed({ url, videoId, className }: Props) {
  const id = useId()

  useEffect(() => {
    const exists = document.querySelector('script[src="https://www.tiktok.com/embed.js"]')
    if (!exists) {
      const s = document.createElement('script')
      s.src = 'https://www.tiktok.com/embed.js'
      s.async = true
      document.body.appendChild(s)
    } else if ((window as any).tiktokEmbedLoaded) {
      // Reprocess embeds if script signals loaded
      ;(window as any).tiktokEmbedLoaded()
    }
  }, [])

  return (
    <div className={cn('relative rounded-2xl overflow-hidden bg-white', className)}>
      <blockquote
        key={id}
        className="tiktok-embed"
        cite={url}
        data-video-id={videoId}
        data-embed-from="oembed"
        style={{ maxWidth: 605, minWidth: 325 }}
      >
        <section />
      </blockquote>
      <style jsx>{`
        :global(.tiktok-embed) { margin: 0; }
      `}</style>
    </div>
  )
}
