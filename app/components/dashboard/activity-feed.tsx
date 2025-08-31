import Image from 'next/image'
import { Activity } from '@/types'
import { Card } from '../ui/card'

export interface ActivityFeedProps {
  activities: Activity[]
  onLoadMore: () => void
  isLoading: boolean
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function ActivityFeed({ activities, onLoadMore, isLoading }: ActivityFeedProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-600">No activity yet.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start">
              {a.actor.avatar ? (
                <Image src={a.actor.avatar} alt={a.actor.name} width={32} height={32} className="rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {a.actor.name.slice(0,1).toUpperCase()}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm text-gray-800">{a.message}</p>
                <p className="text-xs text-gray-500">{timeAgo(a.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onLoadMore}
          className="inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 bg-gradient-to-r from-orange-500 to-amber-600 text-white h-8 px-3 text-sm disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Load more'}
        </button>
      </div>
    </Card>
  )}
