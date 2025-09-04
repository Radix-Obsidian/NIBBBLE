// File: app/components/nibble/item-card.tsx

'use client';

import React, { useState } from 'react';
import { MoreVertical, Heart, Share2, ExternalLink, Trash2, Move } from 'lucide-react';
import { NibbleItem } from '@/types/nibble-collections';

interface ItemCardProps {
  item: NibbleItem;
  onRemove?: () => void;
  onMove?: () => void;
}

export function ItemCard({ item, onRemove, onMove }: ItemCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      setShowMenu(false);
    }
  };

  const handleMove = () => {
    if (onMove) {
      onMove();
      setShowMenu(false);
    }
  };

  const openLink = () => {
    if (item.link_url) {
      window.open(item.link_url, '_blank');
    }
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Media */}
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-yellow-100">
        {item.media_url ? (
          <img
            src={item.media_url}
            alt={item.title || 'Recipe'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Actions Menu */}
        {(onRemove || onMove) && (
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  {onMove && (
                    <button
                      onClick={handleMove}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Move className="w-4 h-4" />
                      Move to Another Collection
                    </button>
                  )}
                  
                  {item.link_url && (
                    <button
                      onClick={openLink}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Recipe
                    </button>
                  )}

                  {onRemove && (
                    <button
                      onClick={handleRemove}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove from Collection
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recipe Metadata Overlay */}
        {item.recipe_metadata && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-3">
                {item.recipe_metadata.cook_time && (
                  <span>⏱️ {item.recipe_metadata.cook_time} min</span>
                )}
                {item.recipe_metadata.difficulty && (
                  <span>📊 {item.recipe_metadata.difficulty}</span>
                )}
                {item.recipe_metadata.servings && (
                  <span>👥 {item.recipe_metadata.servings} servings</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {item.title && (
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
            {item.title}
          </h3>
        )}
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Recipe Tags */}
        {item.recipe_metadata?.tags && item.recipe_metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.recipe_metadata.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {item.recipe_metadata.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{item.recipe_metadata.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Ingredients Preview */}
        {item.recipe_metadata?.ingredients_preview && item.recipe_metadata.ingredients_preview.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {item.recipe_metadata.ingredients_preview.slice(0, 4).map((ingredient, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs"
                >
                  {ingredient}
                </span>
              ))}
              {item.recipe_metadata.ingredients_preview.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{item.recipe_metadata.ingredients_preview.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
