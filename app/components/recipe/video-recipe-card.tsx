'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ChefHat, User, Play } from 'lucide-react';
import { VideoRecipe } from '@/types';

interface VideoRecipeCardProps {
  recipe: VideoRecipe;
  className?: string;
}

export default function VideoRecipeCard({ recipe, className = '' }: VideoRecipeCardProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Link href={`/video-recipe/${recipe.id}`}>
      <div className={`group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}>
        {/* Video Thumbnail with Play Button */}
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          {recipe.thumbnailUrl ? (
            <Image
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
              <ChefHat className="w-12 h-12 text-orange-400" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-orange-500 ml-1" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 mb-2">
            {recipe.title}
          </h3>

          {/* Creator info */}
          <div className="flex items-center mb-3">
            {recipe.creator.profileImageUrl ? (
              <Image
                src={recipe.creator.profileImageUrl}
                alt={recipe.creator.name}
                width={20}
                height={20}
                className="rounded-full mr-2"
              />
            ) : (
              <User className="w-5 h-5 text-gray-400 mr-2" />
            )}
            <span className="text-sm text-gray-600">{recipe.creator.name}</span>
          </div>

          {/* Recipe details */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatTime(recipe.totalTimeMinutes)}</span>
            </div>
            <div className="flex items-center">
              <ChefHat className="w-4 h-4 mr-1" />
              <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Difficulty and tags */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficultyLevel)}`}>
              {recipe.difficultyLevel}
            </span>
            
            {/* First few tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex gap-1">
                {recipe.tags.slice(0, 2).map((tag: string, index: number) => (
                  <span
                    key={`${tag}-${index}`}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {recipe.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{recipe.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick nutrition preview */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Calories: {recipe.nutrition?.calories || 'N/A'}</span>
              <span>Protein: {recipe.nutrition?.protein || 'N/A'}g</span>
              <span>Carbs: {recipe.nutrition?.carbs || 'N/A'}g</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
