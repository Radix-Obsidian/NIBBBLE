// File: app/components/nibble/add-item-dialog.tsx

'use client';

import React, { useState } from 'react';
import { X, Plus, Search, ExternalLink } from 'lucide-react';
import { AddItemInput } from '@/types/nibble-collections';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: AddItemInput) => void;
  collectionId: string;
}

export function AddItemDialog({ open, onClose, onAdd, collectionId }: AddItemDialogProps) {
  const [formData, setFormData] = useState<AddItemInput>({
    collection_id: collectionId,
    title: '',
    media_url: '',
    link_url: '',
    description: '',
    recipe_metadata: {
      cook_time: undefined,
      prep_time: undefined,
      difficulty: undefined,
      servings: undefined,
      ingredients_preview: [],
      tags: []
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim() && !formData.link_url?.trim()) {
      newErrors.title = 'Either title or recipe link is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAdd(formData);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      recipe_metadata: {
        ...prev.recipe_metadata!,
        ingredients_preview: [...(prev.recipe_metadata?.ingredients_preview || []), '']
      }
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipe_metadata: {
        ...prev.recipe_metadata!,
        ingredients_preview: prev.recipe_metadata?.ingredients_preview?.map((ing, i) => 
          i === index ? value : ing
        ) || []
      }
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe_metadata: {
        ...prev.recipe_metadata!,
        ingredients_preview: prev.recipe_metadata?.ingredients_preview?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      recipe_metadata: {
        ...prev.recipe_metadata!,
        tags: [...(prev.recipe_metadata?.tags || []), '']
      }
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipe_metadata: {
        ...prev.recipe_metadata!,
        tags: prev.recipe_metadata?.tags?.map((tag, i) => 
          i === index ? value : tag
        ) || []
      }
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipe_metadata: {
        ...prev.recipe_metadata!,
        tags: prev.recipe_metadata?.tags?.filter((_, i) => i !== index) || []
      }
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Recipe to Collection</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Creamy Mushroom Pasta"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Recipe Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/recipe"
              />
              {formData.link_url && (
                <button
                  type="button"
                  onClick={() => window.open(formData.link_url, '_blank')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Describe this recipe..."
            />
          </div>

          {/* Recipe Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Recipe Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={formData.recipe_metadata?.prep_time || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipe_metadata: {
                      ...prev.recipe_metadata!,
                      prep_time: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  value={formData.recipe_metadata?.cook_time || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipe_metadata: {
                      ...prev.recipe_metadata!,
                      cook_time: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.recipe_metadata?.difficulty || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipe_metadata: {
                      ...prev.recipe_metadata!,
                      difficulty: e.target.value as 'easy' | 'medium' | 'hard' | undefined
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={formData.recipe_metadata?.servings || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    recipe_metadata: {
                      ...prev.recipe_metadata!,
                      servings: e.target.value ? parseInt(e.target.value) : undefined
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="4"
                />
              </div>
            </div>

            {/* Ingredients Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Ingredients
              </label>
              <div className="space-y-2">
                {formData.recipe_metadata?.ingredients_preview?.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 2 cups flour"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Ingredient
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {formData.recipe_metadata?.tags?.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., pasta, vegetarian"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
            >
              Add to Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
