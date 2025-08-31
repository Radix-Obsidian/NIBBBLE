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
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
        <button onClick={() => setCreating(true)} className="inline-flex items-center justify-center rounded-full font-semibold bg-gradient-to-r from-orange-500 to-amber-600 text-white h-10 px-4 text-sm">Create Collection</button>
      </div>

      {collections.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-gray-600">
          You don't have any collections yet. Create your first collection!
        </div>
      ) : (
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
      )}
      {loading && <div className="text-sm text-gray-600">Loading...</div>}

      {creating && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCreating(false)} />
          <div className="absolute inset-x-0 top-20 mx-auto max-w-lg z-50">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Collection</h3>
              <div className="space-y-3">
                <input className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <label className="flex items-center space-x-2 text-sm text-gray-700">
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  <span>Public</span>
                </label>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="rounded-full border-2 border-gray-300 h-9 px-3 text-sm" onClick={() => setCreating(false)}>Cancel</button>
                <button className="rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white h-9 px-4 text-sm" onClick={async () => {
                  const { data, error } = await supabase.from('collections').insert({ name, description, is_public: isPublic, user_id: (await supabase.auth.getUser()).data.user?.id }).select('*')
                  if (!error) {
                    setCollections([...(collections || []), ...(data || [])])
                    setCreating(false)
                    setName(''); setDescription(''); setIsPublic(true)
                  }
                }}>Create</button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
