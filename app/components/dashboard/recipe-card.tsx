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
      id={recipe.id}
      title={recipe.title}
      description={recipe.description}
      cookTime={recipe.cookTime}
      difficulty={recipe.difficulty}
      rating={recipe.rating}
      creator={{ name: recipe.creator.displayName, avatar: recipe.creator.avatar || '', initials: recipe.creator.displayName.slice(0,2).toUpperCase() }}
      isTrending={recipe.likesCount > 100}
      isLiked={false}
      onLike={onLike}
    />
  )
}
