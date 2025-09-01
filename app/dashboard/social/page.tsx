'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { RecipeGrid } from '@/app/components/recipe/recipe-grid'
import { RecipeCardProps } from '@/app/components/recipe/recipe-card'
import { SocialConnections } from '@/app/components/social/social-connections'

export default function SocialPage() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      try {
        setLoading(true)
        const { data: follows, error: followsErr } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id)

        if (followsErr) {
          logger.error('Follows fetch error', followsErr)
          setRecipes([])
          return
        }

        const followingIds = (follows || []).map((f: any) => f.following_id)
        if (followingIds.length === 0) {
          setRecipes([])
          return
        }

        const { data, error } = await supabase
          .from('recipes')
          .select('id, title, description, cook_time, difficulty, rating, likes_count')
          .in('creator_id', followingIds)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Following feed fetch error', error)
          setRecipes([])
        } else {
          const mapped: RecipeCardProps[] = (data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            cookTime: r.cook_time,
            difficulty: r.difficulty,
            rating: r.rating || 0,
            creator: { name: 'Creator', avatar: '', initials: 'CR' },
            isTrending: (r.likes_count || 0) > 100,
            isLiked: false
          }))
          setRecipes(mapped)
        }
      } catch (e) {
        logger.error('Social feed error', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const [tab, setTab] = useState<'feed'|'activity'|'connections'>('feed')
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Social Hub</h2>
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => setTab('feed')} className={`rounded-full px-3 py-1 ${tab==='feed'?'bg-orange-600 text-white':'border border-gray-300 text-gray-700'}`}>Recipe Feed</button>
        <button onClick={() => setTab('activity')} className={`rounded-full px-3 py-1 ${tab==='activity'?'bg-orange-600 text-white':'border border-gray-300 text-gray-700'}`}>Recent Activity</button>
        <button onClick={() => setTab('connections')} className={`rounded-full px-3 py-1 ${tab==='connections'?'bg-orange-600 text-white':'border border-gray-300 text-gray-700'}`}>Social Connections</button>
      </div>
      {tab==='feed' ? (
        <>
          {recipes.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-gray-600">
              Your feed is empty
              <div className="mt-3">
                <a href="/dashboard/discover" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white h-10 px-4 text-sm">Discover Chefs</a>
              </div>
            </div>
          ) : (
            <RecipeGrid recipes={recipes} title="" subtitle="" showViewAll={false} onViewAll={() => {}} onLike={(id) => logger.info('Like', { id })} onView={(id) => window.location.assign(`/dashboard/recipes/${id}`)} />
          )}
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
        </>
      ) : tab === 'connections' ? (
        <SocialConnections />
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-gray-600">No recent activity</div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-500">Following</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-500">Followers</div>
        </div>
      </div>
    </div>
  )
}
