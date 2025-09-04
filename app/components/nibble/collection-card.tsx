// File: app/components/nibble/collection-card.tsx

'use client';

import React from 'react';
import { Heart, Users, Lock, Globe, ChefHat } from 'lucide-react';
import { NibbleCollection } from '@/types/nibble-collections';
import { cn } from '@/lib/utils';

interface CollectionCardProps {
  collection: NibbleCollection;
  onClick: () => void;
  className?: string;
}

export function CollectionCard({ collection, onClick, className }: CollectionCardProps) {
  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      'Comfort Food': 'bg-orange-100 text-orange-800',
      'Quick & Easy': 'bg-green-100 text-green-800',
      'Date Night': 'bg-pink-100 text-pink-800',
      'Weekend Project': 'bg-purple-100 text-purple-800',
      'Healthy': 'bg-blue-100 text-blue-800',
      'Indulgent': 'bg-red-100 text-red-800',
    };
    return moodColors[mood] || 'bg-gray-100 text-gray-800';
  };

  const getCuisineIcon = (cuisine: string) => {
    const cuisineIcons: Record<string, React.ReactNode> = {
      'Italian': '🍝',
      'Asian Fusion': '🥢',
      'Mediterranean': '🌊',
      'Mexican': '🌮',
      'Indian': '🍛',
      'French': '🥖',
      'American': '🍔',
      'Middle Eastern': '🌙',
      'African': '🌶️',
      'Caribbean': '🥥',
    };
    return cuisineIcons[cuisine] || '🍽️';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-yellow-100">
        {collection.cover_image ? (
          <img
            src={collection.cover_image}
            alt={collection.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-orange-400" />
          </div>
        )}
        
        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          {collection.is_public ? (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Public
            </div>
          ) : (
            <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private
            </div>
          )}
        </div>

        {/* Collaborators Badge */}
        {collection.collaborators.length > 0 && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Users className="w-3 h-3" />
            {collection.collaborators.length + 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-orange-600 transition-colors">
          {collection.title}
        </h3>
        
        {collection.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}

        {/* Mood Tags */}
        {collection.mood_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {collection.mood_tags.slice(0, 3).map((mood, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getMoodColor(mood)
                )}
              >
                {mood}
              </span>
            ))}
            {collection.mood_tags.length > 3 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{collection.mood_tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Cuisine Type */}
        {collection.cuisine_type && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span className="text-lg">{getCuisineIcon(collection.cuisine_type)}</span>
            <span>{collection.cuisine_type}</span>
          </div>
        )}

        {/* Dietary Tags */}
        {collection.dietary_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {collection.dietary_tags.slice(0, 2).map((diet, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs font-medium bg-mint-100 text-mint-800"
              >
                {diet}
              </span>
            ))}
            {collection.dietary_tags.length > 2 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{collection.dietary_tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
