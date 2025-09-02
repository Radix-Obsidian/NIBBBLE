'use client';

import { Heart, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import { Card } from '../ui/card';
import { PlaceholderImage } from '../ui/placeholder-image';

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
  image?: string;
  emoji?: string;
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
  image,
  emoji,
  isTrending = false,
  isLiked = false,
  onLike,
  onView
}: RecipeCardProps) {
  const handleLike = () => {
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

  const cuisine = ''

  return (
    <Card
      variant="elevated"
      className="hover:-translate-y-2 transition-all duration-300 cursor-pointer"
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
          <PlaceholderImage title={title} className="aspect-video rounded-t-2xl" />
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
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{title}</h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{rating}</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{cookTime} min</span>
            </div>
            <span>•</span>
            <span>{difficulty}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{creator.initials}</span>
            </div>
            <span className="text-sm text-gray-600">{creator.name}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
