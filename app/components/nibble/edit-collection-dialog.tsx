// File: app/components/nibble/edit-collection-dialog.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { NibbleCollection, UpdateCollectionInput, MOOD_TAGS, CUISINE_TYPES, DIETARY_TAGS } from '@/types/nibble-collections';

interface EditCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  collection: NibbleCollection;
  onUpdate: (collection: UpdateCollectionInput) => void;
}

export function EditCollectionDialog({ open, onClose, collection, onUpdate }: EditCollectionDialogProps) {
  const [formData, setFormData] = useState<UpdateCollectionInput>({
    title: collection.title,
    description: collection.description || '',
    mood_tags: collection.mood_tags,
    cuisine_type: collection.cuisine_type || '',
    dietary_tags: collection.dietary_tags,
    is_public: collection.is_public
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      title: collection.title,
      description: collection.description || '',
      mood_tags: collection.mood_tags,
      cuisine_type: collection.cuisine_type || '',
      dietary_tags: collection.dietary_tags,
      is_public: collection.is_public
    });
  }, [collection]);

  const toggleMood = (mood: string) => {
    const newMoods = formData.mood_tags?.includes(mood)
      ? formData.mood_tags?.filter(m => m !== mood) || []
      : [...(formData.mood_tags || []), mood];
    setFormData(prev => ({ ...prev, mood_tags: newMoods }));
  };

  const toggleDietary = (dietary: string) => {
    const newDietary = formData.dietary_tags?.includes(dietary)
      ? formData.dietary_tags?.filter(d => d !== dietary) || []
      : [...(formData.dietary_tags || []), dietary];
    setFormData(prev => ({ ...prev, dietary_tags: newDietary }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Collection title is required';
    }

    if (formData.title?.length && formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onUpdate(formData);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Collection</h2>
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
              Collection Name *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Comfort Food Classics"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
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
              placeholder="What's this collection about?"
            />
          </div>

          {/* Mood Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mood & Feeling
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOOD_TAGS.map((mood) => (
                <label key={mood} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mood_tags?.includes(mood) || false}
                    onChange={() => toggleMood(mood)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center ${
                    formData.mood_tags?.includes(mood)
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.mood_tags?.includes(mood) && (
                      <Plus className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{mood}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine Type
            </label>
            <select
              value={formData.cuisine_type}
              onChange={(e) => setFormData(prev => ({ ...prev, cuisine_type: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select Cuisine</option>
              {CUISINE_TYPES.map((cuisine) => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Preferences
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {DIETARY_TAGS.map((dietary) => (
                <label key={dietary} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dietary_tags?.includes(dietary) || false}
                    onChange={() => toggleDietary(dietary)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center ${
                    formData.dietary_tags?.includes(dietary)
                      ? 'border-mint-500 bg-mint-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.dietary_tags?.includes(dietary) && (
                      <Plus className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{dietary}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Make Collection Public</h4>
              <p className="text-sm text-gray-600">
                Public collections can be discovered by other NIBBBLE users
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${
                formData.is_public ? 'bg-orange-500' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
                  formData.is_public ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </label>
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
              Update Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
