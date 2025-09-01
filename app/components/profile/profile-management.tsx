'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import { logger } from '@/lib/logger'

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  favorite_cuisines: string[] | null
  location: string | null
  website: string | null
  is_verified: boolean
  followers_count: number
  following_count: number
  recipes_count: number
  created_at: string
  updated_at: string
}

export function ProfileManagement() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    favorite_cuisines: [] as string[]
  })

  const createProfile = useCallback(async () => {
    if (!user) return

    const newProfile = {
      id: user.id,
      username: user.email?.split('@')[0] || 'user',
      display_name: user.email?.split('@')[0] || 'User',
      bio: '',
      avatar_url: null,
      favorite_cuisines: [],
      location: '',
      website: '',
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      recipes_count: 0
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single()

    if (error) {
      logger.error('Error creating profile', error)
    } else {
      setProfile(data)
      setFormData({
        username: data.username,
        display_name: data.display_name,
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        favorite_cuisines: data.favorite_cuisines || []
      })
    }
  }, [user])

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile()
        } else {
          logger.error('Error loading profile', error)
        }
      } else {
        setProfile(data)
        setFormData({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          favorite_cuisines: data.favorite_cuisines || []
        })
      }
    } catch (error) {
      logger.error('Error loading profile', error)
    } finally {
      setLoading(false)
    }
  }, [user, createProfile])

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user, loadProfile])

  const handleSave = async () => {
    if (!user || !profile) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          favorite_cuisines: formData.favorite_cuisines,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        logger.error('Error updating profile', error)
      } else {
        setProfile({ ...profile, ...formData })
        setIsEditing(false)
        logger.info('Profile updated successfully')
      }
    } catch (error) {
      logger.error('Error saving profile', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className='p-6'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Profile</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant='outline'>
            Edit Profile
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Username
            </label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder='Enter username'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Display Name
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder='Enter display name'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder='Tell us about yourself...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500'
              rows={3}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Favorite Cuisines</label>
            <div className='flex flex-wrap gap-2 mb-2'>
              {formData.favorite_cuisines.map((tag, i) => (
                <span key={i} className='inline-flex items-center bg-orange-50 text-orange-700 rounded-full px-3 py-1 text-sm'>
                  {tag}
                  <button className='ml-2 text-orange-700' onClick={() => setFormData({ ...formData, favorite_cuisines: formData.favorite_cuisines.filter((_, idx) => idx !== i) })}>×</button>
                </span>
              ))}
            </div>
            <input
              className='rounded-full border border-gray-200 bg-gray-50 px-4 py-2'
              placeholder='Type a cuisine and press Enter'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (value && !formData.favorite_cuisines.includes(value)) {
                    setFormData({ ...formData, favorite_cuisines: [...formData.favorite_cuisines, value] })
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder='Enter your location'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Website
            </label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder='Enter your website'
            />
          </div>

          <div className='flex space-x-2 pt-4'>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              onClick={() => setIsEditing(false)} 
              variant='outline'
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-500'>Username</label>
            <p className='text-gray-900'>{profile?.username || 'Not set'}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-500'>Display Name</label>
            <p className='text-gray-900'>{profile?.display_name || 'Not set'}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-500'>Bio</label>
            <p className='text-gray-900'>{profile?.bio || 'No bio yet'}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-500'>Location</label>
            <p className='text-gray-900'>{profile?.location || 'Not set'}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-500'>Website</label>
            <p className='text-gray-900'>{profile?.website || 'Not set'}</p>
          </div>

          <div className='grid grid-cols-3 gap-4 pt-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>{profile?.recipes_count || 0}</div>
              <div className='text-sm text-gray-500'>Recipes</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>{profile?.followers_count || 0}</div>
              <div className='text-sm text-gray-500'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>{profile?.following_count || 0}</div>
              <div className='text-sm text-gray-500'>Following</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
