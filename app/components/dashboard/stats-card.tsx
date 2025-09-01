import { Card } from '../ui/card'

export interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  icon: React.ReactNode
  color: 'orange' | 'amber' | 'green' | 'blue'
}

const colorClasses: Record<StatsCardProps['color'], { text: string; bg: string }> = {
  orange: { text: 'text-orange-600', bg: 'bg-orange-50' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50' },
  green: { text: 'text-green-600', bg: 'bg-green-50' },
  blue: { text: 'text-blue-600', bg: 'bg-blue-50' }
}

export function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  const c = colorClasses[color]
  const changeText = change === undefined ? '' : `${change > 0 ? '+' : ''}${change}%`

  return (
    <Card className="p-3 sm:p-4 lg:p-6 border border-gray-100/50 shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${c.bg} flex-shrink-0 ml-2 sm:ml-3 shadow-soft`}>
          <div className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${c.text}`}>{icon}</div>
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-end">
          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
            change >= 0 
              ? 'text-green-700 bg-green-50' 
              : 'text-red-700 bg-red-50'
          }`}>
            {changeText}
          </span>
        </div>
      )}
    </Card>
  )
}
