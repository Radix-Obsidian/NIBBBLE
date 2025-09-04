'use client';

import React, { useState } from 'react';
import { ArrowLeft, ChefHat, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VideoUpload from '@/app/components/recipe/video-upload';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { VideoUploadResult } from '@/types';
import { VideoProcessingResult } from '@/types'

export default function UploadVideoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'upload' | 'complete'>('upload');
  const [uploadResult, setUploadResult] = useState<VideoUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (result: VideoUploadResult) => {
    setUploadResult(result);
    setCurrentStep('complete');
  };

  const handleProcessingComplete = (result: VideoUploadResult) => {
    setUploadResult(result);
    setCurrentStep('complete');
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setUploadResult(null);
    setError(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Your Cooking Video</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Share your cooking skills with the world! Upload a video and our AI will automatically extract the recipe, ingredients, and cooking instructions.
              </p>
            </div>

            <VideoUpload
              onUploadComplete={handleUploadComplete}
              onProcessingComplete={handleProcessingComplete}
            />

            <div className="max-w-2xl mx-auto">
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">1</div>
                    <span>Upload your cooking video (max 2 minutes, 100MB)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">2</div>
                    <span>Our AI analyzes the video and extracts ingredients, instructions, and timing</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">3</div>
                    <span>Review and edit the extracted recipe before publishing</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">4</div>
                    <span>Share your recipe with the community!</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Recipe Extracted!</h1>
              <p className="text-xl text-gray-600">
                Congratulations! Our AI has successfully extracted the recipe from your video.
              </p>
            </div>

            {uploadResult && (
              <div className="max-w-4xl mx-auto">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Extracted Recipe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {uploadResult.processingResult.ingredients.map((ingredient, index) => (
                          <li key={index}>
                            {ingredient.amount} {ingredient.unit} {ingredient.name}
                            {ingredient.notes && <span className="text-gray-500"> ({ingredient.notes})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {uploadResult.processingResult.instructions?.map((instruction, index) => (
                          <li key={index}>{index + 1}. {instruction}</li>
                        )) || (
                          <li className="text-gray-500 italic">No instructions extracted</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Servings:</span>
                        <span className="ml-2 text-gray-600">{uploadResult.processingResult.servings}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Prep Time:</span>
                        <span className="ml-2 text-gray-600">{uploadResult.processingResult.prepTime} min</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Cook Time:</span>
                        <span className="ml-2 text-gray-600">{uploadResult.processingResult.cookTime} min</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-4">
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={handleBackToUpload}>
                  Upload Another Video
                </Button>
              </div>
              <p className="text-gray-600">
                Your recipe has been extracted and is ready for review!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h2 className="text-lg font-medium text-gray-900">Upload Video Recipe</h2>
            </div>
            
            {/* Progress Steps */}
            <div className="hidden md:flex items-center space-x-4">
              {[
                { key: 'upload', label: 'Upload', active: currentStep === 'upload' },
                { key: 'complete', label: 'Complete', active: currentStep === 'complete' }
              ].map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.active
                      ? 'bg-blue-600 text-white'
                      : index < ['upload', 'complete'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step.active ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < 1 && (
                    <div className={`ml-4 w-8 h-0.5 ${
                      index < ['upload', 'complete'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">Error: {error}</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
}

// Recipe Review Form Component
interface RecipeReviewFormProps {
  processingResult: VideoProcessingResult;
  onSave: (recipeData: any) => void;
  onBack: () => void;
}

function RecipeReviewForm({ processingResult, onSave, onBack }: RecipeReviewFormProps) {
  const [title, setTitle] = useState('My Recipe');
  const [description, setDescription] = useState(processingResult.description || '');
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      difficultyLevel,
      tags
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipe Preview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recipe Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {processingResult.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {processingResult.instructions?.map((instruction, index) => (
                  <li key={index}>{index + 1}. {instruction}</li>
                )) || (
                  <li className="text-gray-500 italic">No instructions extracted</li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Servings:</span>
                <span className="ml-2 text-gray-600">{processingResult.servings}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prep Time:</span>
                <span className="ml-2 text-gray-600">{processingResult.prepTime} min</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Cook Time:</span>
                <span className="ml-2 text-gray-600">{processingResult.cookTime} min</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recipe Details Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recipe Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your recipe..."
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to Upload
          </Button>
          <Button type="submit">
            Publish Recipe
          </Button>
        </div>
      </form>
    </div>
  );
}
