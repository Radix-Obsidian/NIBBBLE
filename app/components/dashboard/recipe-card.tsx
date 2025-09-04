import { Recipe } from '@/types'
import { RecipeCard as BaseRecipeCard } from '../recipe/recipe-card'

export interface DashboardRecipeCardProps {
  recipe: Recipe
  onLike: (id: string) => void
  onSave: (id: string) => void
  onShare: (id: string) => void
  variant?: 'grid' | 'list'
}

export function RecipeCard({ recipe, onLike }: DashboardRecipeCardProps) {
  return (
    <BaseRecipeCard
      recipe={recipe}
      onLike={onLike}
    />
  )
}
