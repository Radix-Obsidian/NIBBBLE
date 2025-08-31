'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { Card } from '@/app/components/ui/card'

interface CollectionRow {
  id: string
  name: string
  description: string | null
  is_public: boolean
  cover_image: string | null
}

export default function CollectionsPage() {
  const { user } = useAuth()
  const [collections, setCollections] = useState<CollectionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('collections')
          .select('id, name, description, is_public, cover_image')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) {
          logger.error('Collections fetch error', error)
          setCollections([])
        } else {
          setCollections(data || [])
        }
      } catch (e) {
        logger.error('Collections load error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((c) => (
          <Card key={c.id} className="p-6 border border-gray-100">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-600">{c.description || 'No description'}</p>
              <div className="text-xs text-gray-500">{c.is_public ? 'Public' : 'Private'}</div>
            </div>
          </Card>
        ))}
      </div>
      {loading && <div className="text-sm text-gray-600">Loading...</div>}
    </div>
  )
}
