import { Utensils } from 'lucide-react'

interface PlaceholderImageProps {
  width?: number
  height?: number
  className?: string
}

export function PlaceholderImage({ width = 400, height = 300, className = '' }: PlaceholderImageProps) {
  return (
    <div 
      className={`bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <Utensils className="w-12 h-12 text-orange-400" />
    </div>
  )
}
