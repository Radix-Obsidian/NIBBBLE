'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/app/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/lib/logger'
import { aiCookingService } from '@/lib/services/ai-cooking-service'
import { AICookingProfile } from '@/types/ai-cooking'


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

const EQUIPMENT_OPTIONS = [
  'oven', 'stovetop', 'microwave', 'air_fryer', 'slow_cooker', 'instant_pot', 'blender', 'food_processor', 'stand_mixer', 'grill', 'toaster_oven', 'rice_cooker', 'sous_vide', 'thermometer', 'kitchen_scale'
]

const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'soy_free', 'egg_free', 'shellfish_free', 'keto', 'paleo', 'low_carb', 'low_fat', 'halal', 'kosher'
]

const COOKING_GOALS = [
  'weight_loss', 'muscle_gain', 'heart_health', 'budget_friendly', 'meal_prep', 'family_meals', 'quick_meals', 'gourmet_cooking', 'international_cuisine', 'healthy_eating'
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [aiProfile, setAiProfile] = useState<AICookingProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '' as string | null,
    favorite_cuisines: [] as string[]
  })
  const [aiForm, setAiForm] = useState({
    skillLevel: 1,
    cookingExperienceYears: 0,
    preferredCookingTime: 30,
    equipmentAvailable: [] as string[],
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    spiceTolerance: 3,
    preferredPortionSizes: { small: false, medium: true, large: false },
    cookingGoals: [] as string[],
    learningPreferences: { video: true, text: true, stepByStep: true },
    preferredCuisinesRanked: [] as string[],
    ingredientPreferences: { loved: [] as string[], disliked: [] as string[], neverTried: [] as string[] }
  })



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

  const loadAIProfile = useCallback(async () => {
    if (!user) return
    try {
      const profile = await aiCookingService.getAICookingProfile(user.id)
      if (profile) {
        setAiProfile(profile)
        setAiForm({
          skillLevel: profile.skillLevel,
          cookingExperienceYears: profile.cookingExperienceYears,
          preferredCookingTime: profile.preferredCookingTime,
          equipmentAvailable: profile.equipmentAvailable,
          dietaryRestrictions: profile.dietaryRestrictions,
          allergies: profile.allergies,
          spiceTolerance: profile.spiceTolerance,
          preferredPortionSizes: profile.preferredPortionSizes,
          cookingGoals: profile.cookingGoals,
          learningPreferences: profile.learningPreferences,
          preferredCuisinesRanked: profile.preferredCuisinesRanked,
          ingredientPreferences: profile.ingredientPreferences
        })
      }
    } catch (e) {
      logger.error('AI Profile load exception', e)
    }
  }, [user])

  useEffect(() => { loadProfile() }, [loadProfile])
  useEffect(() => { loadAIProfile() }, [loadAIProfile])

  const toggleCuisine = (name: string) => {
    setForm((f) => ({
      ...f,
      favorite_cuisines: f.favorite_cuisines.includes(name)
        ? f.favorite_cuisines.filter((c) => c !== name)
        : [...f.favorite_cuisines, name]
    }))
  }

  const toggleEquipment = (equipment: string) => {
    setAiForm((f) => ({
      ...f,
      equipmentAvailable: f.equipmentAvailable.includes(equipment)
        ? f.equipmentAvailable.filter((e) => e !== equipment)
        : [...f.equipmentAvailable, equipment]
    }))
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setAiForm((f) => ({
      ...f,
      dietaryRestrictions: f.dietaryRestrictions.includes(restriction)
        ? f.dietaryRestrictions.filter((r) => r !== restriction)
        : [...f.dietaryRestrictions, restriction]
    }))
  }

  const toggleCookingGoal = (goal: string) => {
    setAiForm((f) => ({
      ...f,
      cookingGoals: f.cookingGoals.includes(goal)
        ? f.cookingGoals.filter((g) => g !== goal)
        : [...f.cookingGoals, goal]
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

  const saveAIProfile = async () => {
    if (!user) return
    try {
      setSaving(true)
      const profileData = {
        ...aiForm,
        id: user.id
      }
      await aiCookingService.createOrUpdateAICookingProfile(user.id, profileData)
      await loadAIProfile()
    } catch (error) {
      logger.error('AI Profile save error', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-responsive-xl font-bold text-gray-900'>Profile Settings</h2>
        <p className='text-responsive text-gray-600 mt-1'>Manage your public profile information and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className='flex space-x-1 bg-gray-100 rounded-lg p-1'>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Basic Profile
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          AI Cooking Profile
        </button>
      </div>

      {activeTab === 'profile' && (
        <>
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
        </>
      )}

      {activeTab === 'ai' && (
        <>
      {/* AI Skill Assessment */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Cooking Skills & Experience</h3>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm text-gray-700 mb-2'>Skill Level (1-10)</label>
            <input
              type='range'
              min='1'
              max='10'
              value={aiForm.skillLevel}
              onChange={(e) => setAiForm({ ...aiForm, skillLevel: parseInt(e.target.value) })}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
            />
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>Beginner</span>
              <span className='font-medium text-purple-600'>{aiForm.skillLevel}</span>
              <span>Expert Chef</span>
            </div>
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm text-gray-700 mb-1'>Years of Cooking Experience</label>
              <input
                type='number'
                min='0'
                max='50'
                value={aiForm.cookingExperienceYears}
                onChange={(e) => setAiForm({ ...aiForm, cookingExperienceYears: parseInt(e.target.value) || 0 })}
                className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive'
                placeholder='0'
              />
            </div>
            
            <div>
              <label className='block text-sm text-gray-700 mb-1'>Preferred Cooking Time (minutes)</label>
              <input
                type='number'
                min='10'
                max='180'
                value={aiForm.preferredCookingTime}
                onChange={(e) => setAiForm({ ...aiForm, preferredCookingTime: parseInt(e.target.value) || 30 })}
                className='w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-responsive'
                placeholder='30'
              />
            </div>
          </div>
          
          <div>
            <label className='block text-sm text-gray-700 mb-2'>Spice Tolerance (1-5)</label>
            <input
              type='range'
              min='1'
              max='5'
              value={aiForm.spiceTolerance}
              onChange={(e) => setAiForm({ ...aiForm, spiceTolerance: parseInt(e.target.value) })}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
            />
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>Mild</span>
              <span className='font-medium text-purple-600'>{aiForm.spiceTolerance}</span>
              <span>Very Spicy</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Equipment */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-2'>Available Kitchen Equipment</h3>
        <p className='text-sm text-gray-600 mb-4'>Select the equipment you have access to</p>
        <div className='flex flex-wrap gap-2'>
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <button
              key={equipment}
              type='button'
              onClick={() => toggleEquipment(equipment)}
              className={`px-3 h-8 rounded-full text-sm border capitalize touch-manipulation min-h-[44px] ${
                aiForm.equipmentAvailable.includes(equipment)
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {equipment.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Dietary Restrictions */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-2'>Dietary Restrictions & Preferences</h3>
        <p className='text-sm text-gray-600 mb-4'>Select any dietary restrictions or preferences</p>
        <div className='flex flex-wrap gap-2'>
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <button
              key={restriction}
              type='button'
              onClick={() => toggleDietaryRestriction(restriction)}
              className={`px-3 h-8 rounded-full text-sm border capitalize touch-manipulation min-h-[44px] ${
                aiForm.dietaryRestrictions.includes(restriction)
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {restriction.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Cooking Goals */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-2'>Cooking Goals</h3>
        <p className='text-sm text-gray-600 mb-4'>What are your main cooking objectives?</p>
        <div className='flex flex-wrap gap-2'>
          {COOKING_GOALS.map((goal) => (
            <button
              key={goal}
              type='button'
              onClick={() => toggleCookingGoal(goal)}
              className={`px-3 h-8 rounded-full text-sm border capitalize touch-manipulation min-h-[44px] ${
                aiForm.cookingGoals.includes(goal)
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {goal.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Learning Preferences */}
      <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
        <h3 className='font-semibold text-gray-900 mb-4'>Learning Preferences</h3>
        <div className='space-y-3'>
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              checked={aiForm.learningPreferences.video}
              onChange={(e) => setAiForm({
                ...aiForm,
                learningPreferences: { ...aiForm.learningPreferences, video: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
            <span className='text-sm text-gray-700'>Video tutorials</span>
          </label>
          
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              checked={aiForm.learningPreferences.text}
              onChange={(e) => setAiForm({
                ...aiForm,
                learningPreferences: { ...aiForm.learningPreferences, text: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
            <span className='text-sm text-gray-700'>Written instructions</span>
          </label>
          
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              checked={aiForm.learningPreferences.stepByStep}
              onChange={(e) => setAiForm({
                ...aiForm,
                learningPreferences: { ...aiForm.learningPreferences, stepByStep: e.target.checked }
              })}
              className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
            />
            <span className='text-sm text-gray-700'>Step-by-step guidance</span>
          </label>
        </div>
      </Card>

      {/* AI Profile Stats */}
      {aiProfile && (
        <Card className='p-4 sm:p-6 border border-gray-200 rounded-2xl'>
          <h3 className='font-semibold text-gray-900 mb-4'>AI Cooking Stats</h3>
          <div className='grid grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl font-bold text-purple-600'>
                {Math.round((aiProfile.successHistory.successes / Math.max(1, aiProfile.successHistory.attempts)) * 100)}%
              </div>
              <div className='text-sm text-gray-500'>Success Rate</div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl font-bold text-purple-600'>{aiProfile.successHistory.attempts}</div>
              <div className='text-sm text-gray-500'>Recipes Tried</div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl font-bold text-purple-600'>{aiProfile.skillLevel}</div>
              <div className='text-sm text-gray-500'>Skill Level</div>
            </div>
          </div>
        </Card>
      )}

      <div className='flex justify-end'>
        <button 
          onClick={saveAIProfile} 
          disabled={saving} 
          className='btn inline-flex items-center justify-center rounded-full bg-purple-600 text-white h-10 px-4 text-sm disabled:opacity-60 w-full sm:w-auto'
        >
          {saving ? 'Saving...' : 'Save AI Profile'}
        </button>
      </div>
        </>
      )}
    </div>
  )
}
