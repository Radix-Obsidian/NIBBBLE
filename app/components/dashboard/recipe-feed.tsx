'use client'

import { useState } from 'react'
import { Heart, Clock, Star, Filter, SortAsc } from 'lucide-react'
import { Button } from '../ui/button'
import { PlaceholderImage } from '../ui/placeholder-image'
import { Recipe } from '@/types'

// Mock data for demonstration
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Spicy Thai Basil Chicken',
    description: 'A delicious stir-fry with fresh basil, chili, and tender chicken breast.',
    ingredients: [],
    instructions: [],
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Thai',
    mealType: 'Dinner',
    dietaryTags: ['Gluten-Free'],
    tags: ['spicy', 'quick', 'healthy'],
    images: ['/api/placeholder/400/300'],
    rating: 4.8,
    reviewCount: 127,
    likesCount: 342,
    isPublished: true,
    creatorId: 'user1',
    creator: {
      id: 'user1',
      username: 'chef_sarah',
      email: 'sarah@example.com',
      displayName: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
      bio: 'Professional chef and food blogger',
      favoriteCuisines: ['Thai', 'Italian', 'Japanese'],
      followersCount: 15420,
      followingCount: 890,
      recipesCount: 156,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: 'Classic Margherita Pizza',
    description: 'Authentic Italian pizza with fresh mozzarella, basil, and San Marzano tomatoes.',
    ingredients: [],
    instructions: [],
    prepTime: 30,
    cookTime: 15,
    totalTime: 45,
    servings: 4,
    difficulty: 'Medium',
    cuisine: 'Italian',
    mealType: 'Dinner',
    dietaryTags: ['Vegetarian'],
    tags: ['pizza', 'italian', 'classic'],
    images: ['/api/placeholder/400/300'],
    rating: 4.9,
    reviewCount: 89,
    likesCount: 567,
    isPublished: true,
    creatorId: 'user2',
    creator: {
      id: 'user2',
      username: 'marco_italiano',
      email: 'marco@example.com',
      displayName: 'Marco Rossi',
      avatar: '/api/placeholder/40/40',
      bio: 'Italian chef with 20+ years of experience',
      favoriteCuisines: ['Italian', 'Mediterranean'],
      followersCount: 8920,
      followingCount: 234,
      recipesCount: 89,
      createdAt: new Date('2022-06-20'),
      updatedAt: new Date('2024-01-15')
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    title: 'Chocolate Lava Cake',
    description: 'Decadent chocolate cake with a molten center, perfect for date night.',
    ingredients: [],
    instructions: [],
    prepTime: 20,
    cookTime: 12,
    totalTime: 32,
    servings: 2,
    difficulty: 'Easy',
    cuisine: 'French',
    mealType: 'Dessert',
    dietaryTags: ['Vegetarian'],
    tags: ['chocolate', 'dessert', 'romantic'],
    images: ['/api/placeholder/400/300'],
    rating: 4.7,
    reviewCount: 203,
    likesCount: 891,
    isPublished: true,
    creatorId: 'user3',
    creator: {
      id: 'user3',
      username: 'pastry_queen',
      email: 'emma@example.com',
      displayName: 'Emma Thompson',
      avatar: '/api/placeholder/40/40',
      bio: 'Pastry chef and dessert enthusiast',
      favoriteCuisines: ['French', 'American'],
      followersCount: 23450,
      followingCount: 567,
      recipesCount: 234,
      createdAt: new Date('2021-03-10'),
      updatedAt: new Date('2024-01-15')
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  }
]

export function RecipeFeed() {
  const [recipes] = useState<Recipe[]>(mockRecipes)
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'popular'>('newest')

  const handleLike = (recipeId: string) => {
    // TODO: Implement like functionality
    console.log('Liked recipe:', recipeId)
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="p-6">
      {/* Filters and Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating' | 'popular')}
              className="text-sm border-gray-200 rounded-md focus:border-orange-300 focus:ring-orange-300"
            >
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          {recipes.length} recipes found
        </p>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
          >
            {/* Recipe Image */}
            <div className="relative aspect-[4/3]">
              <PlaceholderImage className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(recipe.id)}
                  className="bg-white/90 hover:bg-white text-gray-700 hover:text-red-500"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                  {recipe.difficulty}
                </span>
              </div>
            </div>

            {/* Recipe Content */}
            <div className="p-4">
              {/* Creator Info */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {recipe.creator.displayName.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {recipe.creator.displayName}
                </span>
              </div>

              {/* Recipe Title and Description */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                {recipe.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {recipe.description}
              </p>

              {/* Recipe Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(recipe.totalTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{recipe.rating}</span>
                  <span>({recipe.reviewCount})</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {recipe.dietaryTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {tag}
                  </span>
                ))}
                {recipe.tags.slice(0, 1).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                size="sm"
              >
                View Recipe
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" size="lg">
          Load More Recipes
        </Button>
      </div>
    </div>
  )
}
