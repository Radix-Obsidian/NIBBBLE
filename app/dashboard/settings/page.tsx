'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/app/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'

export default function SettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      marketing: false,
      recipeUpdates: true,
      newFollowers: true
    },
    privacy: {
      profileVisibility: 'public' as 'public' | 'private',
      showActivity: true,
      allowMessages: true
    },
    preferences: {
      autoplay: true,
      darkMode: false,
      language: 'en'
    }
  })



  const saveSettings = async () => {
    if (!user) return
    try {
      setSaving(true)
      // In a real app, you'd save these to a user_settings table
      // For now, we'll just simulate the save
      logger.info('Settings saved', settings)
    } catch (error) {
      logger.error('Settings save error', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-responsive-xl font-bold text-gray-900'>Settings</h2>
        <p className='text-responsive text-gray-600 mt-1'>Manage your app preferences and privacy settings</p>
      </div>

      {/* Notifications Settings */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>🔔 Notifications</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>Email Notifications</h4>
              <p className='text-sm text-gray-500'>Receive notifications via email</p>
            </div>
            <input
              type='checkbox'
              checked={settings.notifications.email}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>Push Notifications</h4>
              <p className='text-sm text-gray-500'>Receive push notifications on your device</p>
            </div>
            <input
              type='checkbox'
              checked={settings.notifications.push}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, push: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>Recipe Updates</h4>
              <p className='text-sm text-gray-500'>Get notified about new recipes and features</p>
            </div>
            <input
              type='checkbox'
              checked={settings.notifications.recipeUpdates}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, recipeUpdates: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>New Followers</h4>
              <p className='text-sm text-gray-500'>Get notified when someone follows you</p>
            </div>
            <input
              type='checkbox'
              checked={settings.notifications.newFollowers}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, newFollowers: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>🔒 Privacy</h3>
        <div className='space-y-4'>
          <div>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>Profile Visibility</h4>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, profileVisibility: e.target.value as 'public' | 'private' }
              })}
              className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive'
            >
              <option value='public'>Public</option>
              <option value='private'>Private</option>
            </select>
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>Show Activity</h4>
              <p className='text-sm text-gray-500'>Allow others to see your cooking activity</p>
            </div>
            <input
              type='checkbox'
              checked={settings.privacy.showActivity}
              onChange={(e) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, showActivity: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>Allow Messages</h4>
              <p className='text-sm text-gray-500'>Allow other users to send you messages</p>
            </div>
            <input
              type='checkbox'
              checked={settings.privacy.allowMessages}
              onChange={(e) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, allowMessages: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
        </div>
      </Card>

      {/* App Preferences */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>⚙️ Preferences</h3>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>Autoplay Videos</h4>
              <p className='text-sm text-gray-500'>Automatically play recipe videos</p>
            </div>
            <input
              type='checkbox'
              checked={settings.preferences.autoplay}
              onChange={(e) => setSettings({
                ...settings,
                preferences: { ...settings.preferences, autoplay: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
          </div>
          <div>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>Language</h4>
            <select
              value={settings.preferences.language}
              onChange={(e) => setSettings({
                ...settings,
                preferences: { ...settings.preferences, language: e.target.value }
              })}
              className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive'
            >
              <option value='en'>English</option>
              <option value='es'>Español</option>
              <option value='fr'>Français</option>
              <option value='it'>Italiano</option>
              <option value='de'>Deutsch</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Account Management */}
      <Card className='p-4 sm:p-6 border border-red-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>⚠️ Account Management</h3>
        <div className='space-y-4'>
          <div>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>Export Data</h4>
            <p className='text-sm text-gray-500 mb-3'>Download all your recipes and profile data</p>
            <button className='btn rounded-full border border-gray-300 px-4 h-9 text-sm'>
              Export Data
            </button>
          </div>
          <div>
            <h4 className='text-sm font-medium text-gray-900 mb-2'>Delete Account</h4>
            <p className='text-sm text-gray-500 mb-3'>Permanently delete your account and all data</p>
            <button className='btn rounded-full border border-red-300 text-red-600 px-4 h-9 text-sm hover:bg-red-50'>
              Delete Account
            </button>
          </div>
        </div>
      </Card>

      <div className='flex justify-end'>
        <button 
          onClick={saveSettings} 
          disabled={saving} 
          className='btn inline-flex items-center justify-center rounded-full bg-purple-600 text-white h-10 px-4 text-sm disabled:opacity-60 w-full sm:w-auto'
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
