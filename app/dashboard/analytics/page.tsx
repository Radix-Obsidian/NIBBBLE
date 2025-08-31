'use client'

import { Card } from '@/app/components/ui/card'
import { StatsCard } from '@/app/components/dashboard/stats-card'
import { BookOpen, Eye, Heart, Users } from 'lucide-react'

export default function AnalyticsPage() {
  const stats = [
    { title: 'Total Recipes', value: 0, icon: <BookOpen className='w-6 h-6' />, color: 'orange' as const },
    { title: 'Total Views', value: 0, icon: <Eye className='w-6 h-6' />, color: 'blue' as const },
    { title: 'Total Likes', value: 0, icon: <Heart className='w-6 h-6' />, color: 'amber' as const },
    { title: 'Followers', value: 0, icon: <Users className='w-6 h-6' />, color: 'green' as const }
  ]

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-gray-900'>Analytics Dashboard</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map(s => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} color={s.color} />
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-900 mb-2'>Engagement Rate</h3>
          <div className='text-3xl font-bold text-gray-900'>0.0%</div>
        </Card>
        <Card className='p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-900 mb-2'>Average Rating</h3>
          <div className='text-3xl font-bold text-gray-900'>4.2</div>
        </Card>
        <Card className='p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-900 mb-2'>Views per Recipe</h3>
          <div className='text-3xl font-bold text-gray-900'>0</div>
        </Card>
      </div>

      <Card className='p-6 border border-gray-100'>
        <h3 className='font-semibold text-gray-900 mb-2'>Top Performing Recipes</h3>
        <div className='text-sm text-gray-600'>No recipes yet. Create your first recipe to see analytics!</div>
      </Card>

      <Card className='p-6 border border-gray-100'>
        <h3 className='font-semibold text-gray-900 mb-2'>Recent Recipes</h3>
        <div className='text-sm text-gray-600'>No recent recipes</div>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-900 mb-2'>Performance Insights</h3>
          <div className='text-sm text-gray-600'>Engagement Tip: Try adding more detailed recipe descriptions and high-quality images to boost engagement.</div>
        </Card>
        <Card className='p-6 border border-gray-100'>
          <h3 className='font-semibold text-gray-900 mb-2'>Growth Opportunity</h3>
          <div className='text-sm text-gray-600'>Engage with other chefs and share recipes consistently to grow your follower base.</div>
        </Card>
      </div>
    </div>
  )
}
