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

// Recipe Import Section Component
function RecipeImportSection() {
  const { user } = useAuth()
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<any>(null)

  const importRecipes = async (cuisine: string, count: number) => {
    if (!user) return
    
    try {
      setImporting(true)
      setProgress('Starting import...')
      setResult(null)

      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cuisine',
          cuisines: [cuisine],
          count: count,
          creatorId: user.id,
          dryRun: false
        })
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setProgress(`✅ Successfully imported ${data.imported} recipes!`)
      } else {
        setProgress(`❌ Import failed: ${data.errors?.join(', ') || 'Unknown error'}`)
      }
    } catch (error) {
      setProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm text-gray-700 mb-2'>Cuisine</label>
          <select 
            className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive'
            defaultValue='italian'
          >
            <option value='italian'>Italian</option>
            <option value='mexican'>Mexican</option>
            <option value='chinese'>Chinese</option>
            <option value='indian'>Indian</option>
            <option value='japanese'>Japanese</option>
            <option value='french'>French</option>
            <option value='thai'>Thai</option>
            <option value='mediterranean'>Mediterranean</option>
            <option value='american'>American</option>
          </select>
        </div>
        <div>
          <label className='block text-sm text-gray-700 mb-2'>Count</label>
          <select 
            className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive'
            defaultValue='10'
          >
            <option value='5'>5 recipes</option>
            <option value='10'>10 recipes</option>
            <option value='20'>20 recipes</option>
            <option value='50'>50 recipes</option>
          </select>
        </div>
      </div>
      
      <div className='flex gap-2'>
        <button
          onClick={() => {
            const cuisine = (document.querySelector('select[defaultValue="italian"]') as HTMLSelectElement)?.value || 'italian'
            const count = parseInt((document.querySelector('select[defaultValue="10"]') as HTMLSelectElement)?.value || '10')
            importRecipes(cuisine, count)
          }}
          disabled={importing}
          className='btn inline-flex items-center justify-center rounded-full bg-orange-600 text-white h-10 px-4 text-sm disabled:opacity-60'
        >
          {importing ? 'Importing...' : 'Import Recipes'}
        </button>
        
        <button
          onClick={() => {
            const cuisine = (document.querySelector('select[defaultValue="italian"]') as HTMLSelectElement)?.value || 'italian'
            const count = parseInt((document.querySelector('select[defaultValue="10"]') as HTMLSelectElement)?.value || '10')
            importRecipes(cuisine, count)
          }}
          disabled={importing}
          className='btn inline-flex items-center justify-center rounded-full bg-gray-600 text-white h-10 px-4 text-sm disabled:opacity-60'
        >
          {importing ? 'Testing...' : 'Test Import'}
        </button>
      </div>

      {progress && (
        <div className='p-3 rounded-lg bg-gray-50 border border-gray-200'>
          <p className='text-sm text-gray-700'>{progress}</p>
        </div>
      )}

      {result && (
        <div className='p-3 rounded-lg bg-blue-50 border border-blue-200'>
          <h4 className='font-medium text-blue-900 mb-2'>Import Results:</h4>
          <pre className='text-xs text-blue-800 overflow-auto'>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

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
        <h2 className='text-responsive-xl font-bold text-gray-900'>Profile Settings</h2>
        <p className='text-responsive text-gray-600 mt-1'>Manage your public profile information and preferences</p>
      </div>

      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Profile Picture</h3>
        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0'>
            {(form.display_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <button
            className='btn rounded-full border border-gray-300 px-4 h-9 text-sm flex items-center justify-center w-full sm:w-auto'
            onClick={async () => {
              const url = prompt('Enter image URL') || ''
              if (url) setForm({ ...form, avatar_url: url })
            }}
          >
            Change Photo
          </button>
        </div>
      </Card>

      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Basic Information</h3>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='form-group'>
              <label className='block text-sm text-gray-700 mb-1'>Username</label>
              <input 
                className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive' 
                value={form.username} 
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                placeholder='@your-username' 
              />
            </div>
            <div className='form-group'>
              <label className='block text-sm text-gray-700 mb-1'>Display Name *</label>
              <input 
                className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive' 
                value={form.display_name} 
                onChange={(e) => setForm({ ...form, display_name: e.target.value })} 
                placeholder='Your name' 
              />
            </div>
          </div>
          <div className='form-group'>
            <label className='block text-sm text-gray-700 mb-1'>Bio</label>
            <textarea 
              className='w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-responsive' 
              rows={4} 
              value={form.bio} 
              onChange={(e) => setForm({ ...form, bio: e.target.value })} 
              placeholder='Tell us about yourself and your cooking style...' 
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='form-group'>
              <label className='block text-sm text-gray-700 mb-1'>Location</label>
              <input 
                className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive' 
                value={form.location} 
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
                placeholder='City, Country' 
              />
            </div>
            <div className='form-group'>
              <label className='block text-sm text-gray-700 mb-1'>Website</label>
              <input 
                className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive' 
                value={form.website} 
                onChange={(e) => setForm({ ...form, website: e.target.value })} 
                placeholder='https://yourwebsite.com' 
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-2'>Favorite Cuisines</h3>
        <p className='text-sm text-gray-600 mb-4'>Select the cuisines you love cooking and eating</p>
        <div className='flex flex-wrap gap-2'>
          {CUISINE_OPTIONS.map((c) => (
            <button
              key={c}
              type='button'
              onClick={() => toggleCuisine(c)}
              className={`px-3 h-8 rounded-full text-sm border touch-manipulation min-h-[44px] ${
                form.favorite_cuisines.includes(c) 
                  ? 'bg-orange-50 text-orange-700 border-orange-200' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Recipe Import (Admin)</h3>
        <p className='text-sm text-gray-600 mb-4'>Import recipes from Spoonacular API to populate the platform.</p>
        <RecipeImportSection />
      </Card>

      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Social Connections</h3>
        <p className='text-sm text-gray-600 mb-4'>Connect your TikTok and Instagram accounts to import food content.</p>
        <SocialConnections />
      </Card>

      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Profile Statistics</h3>
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-purple-600'>{profile?.recipes_count || 0}</div>
            <div className='text-sm text-gray-500'>Recipes</div>
          </div>
          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-purple-600'>{profile?.followers_count || 0}</div>
            <div className='text-sm text-gray-500'>Followers</div>
          </div>
          <div className='text-center'>
            <div className='text-xl sm:text-2xl font-bold text-purple-600'>{profile?.following_count || 0}</div>
            <div className='text-sm text-gray-500'>Following</div>
          </div>
        </div>
      </Card>

      <div className='flex justify-end'>
        <button 
          onClick={save} 
          disabled={saving} 
          className='btn inline-flex items-center justify-center rounded-full bg-purple-600 text-white h-10 px-4 text-sm disabled:opacity-60 w-full sm:w-auto'
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
