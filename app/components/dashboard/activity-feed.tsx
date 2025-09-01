import Image from 'next/image'
import { Activity } from '@/types'

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
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft border border-white/20">
      <h3 className="text-responsive-xl font-bold text-gray-900 mb-4 sm:mb-6">Recent Activity</h3>
      {activities.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-responsive text-gray-500 mb-2">No activity yet</p>
          <p className="text-sm text-gray-400">Your recent activity will appear here</p>
        </div>
      ) : (
        <ul className="space-y-3 sm:space-y-4">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start p-3 sm:p-4 rounded-xl hover:bg-white/50 transition-colors">
              {a.actor.avatar ? (
                <Image 
                  src={a.actor.avatar} 
                  alt={a.actor.name} 
                  width={32} 
                  height={32} 
                  className="rounded-full flex-shrink-0" 
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {a.actor.name.slice(0,1).toUpperCase()}
                </div>
              )}
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{a.message}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{timeAgo(a.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {activities.length > 0 && (
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={onLoadMore}
            className="btn bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}