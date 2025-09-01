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
    <Card className="p-4 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${c.bg} flex-shrink-0 ml-3`}>
          <div className={`w-5 h-5 sm:w-6 sm:h-6 ${c.text}`}>{icon}</div>
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-3 sm:mt-4 flex items-center justify-end">
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {changeText}
          </span>
        </div>
      )}
    </Card>
  )
}
