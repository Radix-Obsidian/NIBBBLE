'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { Card } from '@/app/components/ui/card'

interface NotificationItem {
  id: string
  message: string
  created_at: string
}

export function NotificationsPanel({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        setLoading(true)
        // New followers
        const { data: follows, error: fErr } = await supabase
          .from('user_follows')
          .select('id, follower_id, created_at')
          .eq('following_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
        if (fErr) logger.error('Notifications follows error', fErr)

        // Likes on your recipes
        const { data: likes, error: lErr } = await supabase
          .from('recipe_likes')
          .select('id, recipe_id, user_id, created_at')
          .order('created_at', { ascending: false })
          .limit(10)
        if (lErr) logger.error('Notifications likes error', lErr)

        const list: NotificationItem[] = []
        ;(follows || []).forEach((r: any) => list.push({ id: `f-${r.id}` , message: 'You have a new follower', created_at: r.created_at }))
        ;(likes || []).forEach((r: any) => list.push({ id: `l-${r.id}` , message: 'Your recipe received a like', created_at: r.created_at }))
        list.sort((a,b) => (a.created_at > b.created_at ? -1 : 1))
        setItems(list.slice(0, 15))
      } catch (e) {
        logger.error('Notifications load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, userId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute right-4 top-20 z-50 w-80" onClick={(e) => e.stopPropagation()}>
        <Card className="p-4 border border-gray-100 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Notifications</h4>
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">No notifications yet.</div>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-auto pr-1">
              {items.map((n) => (
                <li key={n.id} className="text-sm text-gray-800">
                  <div className="flex items-center justify-between">
                    <span>{n.message}</span>
                    <span className="text-xs text-gray-500">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
