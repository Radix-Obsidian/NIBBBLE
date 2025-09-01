'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/app/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { SocialConnections } from '@/app/components/social/social-connections'

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  favorite_cuisines: string[] | null
  location: string | null
  website: string | null
  followers_count: number
  following_count: number
  recipes_count: number
}

const CUISINE_OPTIONS = [
  'Italian','Mexican','Chinese','Indian','Japanese','French','Thai','Mediterranean','American','Korean','Vietnamese','Spanish','Greek','Lebanese','Moroccan','Ethiopian','Turkish','Brazilian','Peruvian'
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '' as string | null,
    favorite_cuisines: [] as string[]
  })

  // Social connections stored locally per user for now
  const [accounts, setAccounts] = useState<{ tiktok: string; instagram: string }>({ tiktok: '', instagram: '' })
  const accountsKey = (uid?: string) => `pp_connected_accounts:${uid || 'anon'}`

  useEffect(() => {
    if (!user) return
    try {
      const raw = localStorage.getItem(accountsKey(user.id))
      if (raw) setAccounts(JSON.parse(raw))
    } catch {}
  }, [user])

  useEffect(() => {
    if (!user) return
    try { localStorage.setItem(accountsKey(user.id), JSON.stringify(accounts)) } catch {}
  }, [accounts, user])

  const loadProfile = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error) {
        logger.error('Profile load error', error)
        return
      }
      setProfile(data as any)
      setForm({
        username: data.username || '',
        display_name: data.display_name || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        avatar_url: data.avatar_url || '',
        favorite_cuisines: data.favorite_cuisines || []
      })
    } catch (e) {
      logger.error('Profile load exception', e)
    }
  }, [user])

  useEffect(() => { loadProfile() }, [loadProfile])

  const toggleCuisine = (name: string) => {
    setForm((f) => ({
      ...f,
      favorite_cuisines: f.favorite_cuisines.includes(name)
        ? f.favorite_cuisines.filter((c) => c !== name)
        : [...f.favorite_cuisines, name]
    }))
  }

  const save = async () => {
    if (!user) return
    try {
      setSaving(true)
      const { error } = await supabase.from('profiles').update({
        username: form.username,
        display_name: form.display_name,
        bio: form.bio,
        location: form.location,
        website: form.website,
        avatar_url: form.avatar_url,
        favorite_cuisines: form.favorite_cuisines,
        updated_at: new Date().toISOString()
      }).eq('id', user.id)
      if (error) logger.error('Profile save error', error)
      else await loadProfile()
    } finally { setSaving(false) }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>Profile Settings</h2>
        <p className='text-gray-600'>Manage your public profile information and preferences</p>
      </div>

      <Card className='p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Profile Picture</h3>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold'>
            {(form.display_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <button
            className='rounded-full border border-gray-300 px-4 h-9 text-sm flex items-center justify-center'
            onClick={async () => {
              const url = prompt('Enter image URL') || ''
              if (url) setForm({ ...form, avatar_url: url })
            }}
          >
            Change Photo
          </button>
        </div>
      </Card>

      <Card className='p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Basic Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Username</label>
            <input className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2' value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder='@your-username' />
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Display Name *</label>
            <input className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2' value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder='Your name' />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-700 mb-1'>Bio</label>
            <textarea className='w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3' rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder='Tell us about yourself and your cooking style...' />
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Location</label>
            <input className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2' value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder='City, Country' />
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Website</label>
            <input className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2' value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder='https://yourwebsite.com' />
          </div>
        </div>
      </Card>

      <Card className='p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-2'>Favorite Cuisines</h3>
        <p className='text-sm text-gray-600 mb-4'>Select the cuisines you love cooking and eating</p>
        <div className='flex flex-wrap gap-2'>
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c}
              type='button'
              onClick={() => toggleCuisine(c)}
              className={`px-3 h-8 rounded-full text-sm border ${form.favorite_cuisines.includes(c) ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card className='p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Social Connections</h3>
        <p className='text-sm text-gray-600 mb-4'>Connect your TikTok and Instagram accounts to import food content.</p>
        <SocialConnections />
      </Card>

      <Card className='p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Profile Statistics</h3>
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>{profile?.recipes_count || 0}</div>
            <div className='text-sm text-gray-500'>Recipes</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>{profile?.followers_count || 0}</div>
            <div className='text-sm text-gray-500'>Followers</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>{profile?.following_count || 0}</div>
            <div className='text-sm text-gray-500'>Following</div>
          </div>
        </div>
      </Card>

      <div className='flex justify-end'>
        <button onClick={save} disabled={saving} className='inline-flex items-center justify-center rounded-full bg-purple-600 text-white h-10 px-4 text-sm disabled:opacity-60'>
          Save Changes
        </button>
      </div>
    </div>
  )
}
