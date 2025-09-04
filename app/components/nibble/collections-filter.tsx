// File: app/components/nibble/collections-filter.tsx

'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { MOOD_TAGS, CUISINE_TYPES, DIETARY_TAGS } from '@/types/nibble-collections';

interface CollectionsFilterProps {
  filters: {
    mood: string[];
    cuisine: string;
    dietary: string[];
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function CollectionsFilter({ filters, onFiltersChange, onClose }: CollectionsFilterProps) {
  const toggleMood = (mood: string) => {
    const newMoods = filters.mood.includes(mood)
      ? filters.mood.filter(m => m !== mood)
      : [...filters.mood, mood];
    onFiltersChange({ ...filters, mood: newMoods });
  };

  const toggleDietary = (dietary: string) => {
    const newDietary = filters.dietary.includes(dietary)
      ? filters.dietary.filter(d => d !== dietary)
      : [...filters.dietary, dietary];
    onFiltersChange({ ...filters, dietary: newDietary });
  };

  const clearFilters = () => {
    onFiltersChange({
      mood: [],
      cuisine: '',
      dietary: [],
      search: filters.search
    });
  };

  const hasActiveFilters = filters.mood.length > 0 || filters.cuisine || filters.dietary.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Collections</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mood Tags */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Mood</h4>
          <div className="space-y-2">
            {MOOD_TAGS.map((mood) => (
              <label key={mood} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.mood.includes(mood)}
                  onChange={() => toggleMood(mood)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                  filters.mood.includes(mood)
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300'
                }`}>
                  {filters.mood.includes(mood) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{mood}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cuisine Type */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Cuisine</h4>
          <select
            value={filters.cuisine}
            onChange={(e) => onFiltersChange({ ...filters, cuisine: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Cuisines</option>
            {CUISINE_TYPES.map((cuisine) => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        {/* Dietary Tags */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Dietary</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {DIETARY_TAGS.map((dietary) => (
              <label key={dietary} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dietary.includes(dietary)}
                  onChange={() => toggleDietary(dietary)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                  filters.dietary.includes(dietary)
                    ? 'border-mint-500 bg-mint-500'
                    : 'border-gray-300'
                }`}>
                  {filters.dietary.includes(dietary) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{dietary}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={clearFilters}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
