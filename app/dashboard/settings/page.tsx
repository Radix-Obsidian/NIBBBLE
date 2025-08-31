'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/app/components/ui/card'

interface Preferences {
  theme: 'light' | 'dark' | 'system'
  notifyFollows: boolean
  notifyLikes: boolean
  autoplayVideos: boolean
}

interface ConnectedAccounts {
  tiktok?: string
  instagram?: string
}

const SETTINGS_KEY = 'pp_settings'
const ACCOUNTS_KEY = 'pp_connected_accounts'

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Preferences>({ theme: 'system', notifyFollows: true, notifyLikes: true, autoplayVideos: false })
  const [accounts, setAccounts] = useState<ConnectedAccounts>({})

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null')
      if (p) setPrefs(p)
      const a = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || 'null')
      if (a) setAccounts(a)
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(prefs))
    if (prefs.theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [prefs])

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  }, [accounts])

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900'>Settings</h2>

      <Card className='p-6 border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Preferences</h3>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <label className='text-sm text-gray-700'>Theme
              <select className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 mt-1' value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value as any })}>
                <option value='system'>System</option>
                <option value='light'>Light</option>
                <option value='dark'>Dark</option>
              </select>
            </label>
            <label className='flex items-center space-x-2 text-sm text-gray-700'>
              <input type='checkbox' checked={prefs.notifyFollows} onChange={(e) => setPrefs({ ...prefs, notifyFollows: e.target.checked })} />
              <span>Notify on new followers</span>
            </label>
            <label className='flex items-center space-x-2 text-sm text-gray-700'>
              <input type='checkbox' checked={prefs.notifyLikes} onChange={(e) => setPrefs({ ...prefs, notifyLikes: e.target.checked })} />
              <span>Notify on likes</span>
            </label>
            <label className='flex items-center space-x-2 text-sm text-gray-700'>
              <input type='checkbox' checked={prefs.autoplayVideos} onChange={(e) => setPrefs({ ...prefs, autoplayVideos: e.target.checked })} />
              <span>Autoplay videos</span>
            </label>
          </div>
        </div>
      </Card>

      <Card className='p-6 border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Connected Accounts</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>TikTok Username</label>
            <input className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2' placeholder='@username' value={accounts.tiktok || ''} onChange={(e) => setAccounts({ ...accounts, tiktok: e.target.value })} />
          </div>
          <div>
            <label className='block text-sm text-gray-700 mb-1'>Instagram Username</label>
            <input className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2' placeholder='@username' value={accounts.instagram || ''} onChange={(e) => setAccounts({ ...accounts, instagram: e.target.value })} />
          </div>
        </div>
        <p className='text-sm text-gray-500 mt-3'>OAuth connection coming soon. For now, we store your handles to help republish content.</p>
      </Card>
    </div>
  )
}
