'use client';

import { Heart, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import { Card } from '../ui/card';
import { RecipePlaceholder, RecipePlaceholderFallback } from './recipe-placeholder';

export interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  creator: {
    name: string;
    avatar: string;
    initials: string;
  };
  resource?: {
    name: string;
    initials: string;
  };
  image?: string;
  cuisine?: string;
  emoji?: string;
  nutrition?: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
  isTrending?: boolean;
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
}

export function RecipeCard({
  id,
  title,
  description,
  cookTime,
  difficulty,
  rating,
  creator,
  resource,
  image,
  cuisine,
  emoji,
  nutrition,
  isTrending = false,
  isLiked = false,
  onLike,
  onView
}: RecipeCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onLike?.(id);
  };

  const handleView = () => {
    try {
      const key = 'pp_recently_viewed'
      const list = JSON.parse(localStorage.getItem(key) || '[]') as string[]
      const next = [id, ...list.filter((x) => x !== id)].slice(0, 50)
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
    onView?.(id)
  }

  return (
    <Card
      variant="elevated"
      className="hover:-translate-y-2 transition-all duration-300 cursor-pointer w-full h-full flex flex-col"
      onClick={handleView}
    >
      <div className="relative">
        {image ? (
          <Image
            src={image}
            alt={title}
            width={400}
            height={225}
            className="w-full aspect-video object-cover rounded-t-2xl"
          />
        ) : (
          <RecipePlaceholder 
            title={title}
            cuisine={cuisine}
            difficulty={difficulty}
          />
        )}
        
        <div className="absolute top-4 right-4">
          <button 
            onClick={handleLike}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          >
            <Heart 
              className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
            />
          </button>
        </div>
        
        {isTrending && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-gray-700">Trending</span>
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6 flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2 flex-1 min-w-0">{title}</h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{description}</p>
        
        {cuisine && (
          <div className="mb-3">
            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {cuisine}
            </span>
          </div>
        )}
        
        {nutrition && (
          <div className="mb-4 grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{nutrition.calories}</div>
              <div className="text-gray-500">Cal</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{nutrition.protein}g</div>
              <div className="text-gray-500">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{nutrition.fats}g</div>
              <div className="text-gray-500">Fat</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{nutrition.carbs}g</div>
              <div className="text-gray-500">Carbs</div>
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-gray-500 min-w-0">
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Clock className="w-4 sm:h-4" />
              <span className="text-sm">{cookTime} min</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-sm">{difficulty}</span>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full flex-shrink-0">
                <span className="text-sm font-medium text-gray-700">{creator.initials}</span>
              </div>
              <span className="text-sm text-gray-600">{creator.name}</span>
            </div>
            
            {resource && (
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full flex-shrink-0">
                <span className="text-sm font-medium text-orange-700">{resource.initials}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
