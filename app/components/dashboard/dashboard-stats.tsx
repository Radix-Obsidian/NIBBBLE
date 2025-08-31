'use client'

import { TrendingUp, Heart, Users, Clock } from 'lucide-react'

const stats = [
  {
    name: 'Total Recipes',
    value: '2,847',
    change: '+12%',
    changeType: 'positive',
    icon: TrendingUp,
    description: 'From last month'
  },
  {
    name: 'Your Favorites',
    value: '156',
    change: '+8',
    changeType: 'positive',
    icon: Heart,
    description: 'Saved recipes'
  },
  {
    name: 'Active Chefs',
    value: '1,234',
    change: '+5%',
    changeType: 'positive',
    icon: Users,
    description: 'In the community'
  },
  {
    name: 'Avg. Cook Time',
    value: '32 min',
    change: '-2 min',
    changeType: 'negative',
    icon: Clock,
    description: 'Your recipes'
  }
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <stat.icon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">{stat.description}</span>
            <span className={`text-sm font-medium ${
              stat.changeType === 'positive' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
