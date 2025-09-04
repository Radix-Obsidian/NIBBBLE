'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, Calendar, MapPin, Link, Heart, Share2, Edit3 } from 'lucide-react';
import { Creator, VideoRecipe } from '@/types';
import { recipeService } from '@/lib/services/recipe-service';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import VideoRecipeCard from '@/app/components/recipe/video-recipe-card';

interface CreatorProfileProps {
  creatorId: string;
  isOwnProfile?: boolean;
}

export default function CreatorProfile({ creatorId, isOwnProfile = false }: CreatorProfileProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [recipes, setRecipes] = useState<VideoRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recipes' | 'about' | 'stats'>('recipes');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCreatorProfile();
  }, [creatorId]);

  const loadCreatorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load creator info and recipes
      const [creatorData, recipesData] = await Promise.all([
        loadCreatorInfo(),
        loadCreatorRecipes(1)
      ]);

      setCreator(creatorData);
      setRecipes(recipesData.recipes);
      setHasMore(recipesData.total > recipesData.recipes.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  };

  const loadCreatorInfo = async (): Promise<Creator> => {
    // For now, we'll create a mock creator since we don't have a separate creator service
    // In production, you'd fetch this from a dedicated endpoint
    return {
      id: creatorId,
      name: 'Demo Creator',
      profileImageUrl: '/api/placeholder/150/150',
      bio: 'Passionate home cook sharing delicious recipes with the world. Love experimenting with new ingredients and techniques!',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
  };

  const loadCreatorRecipes = async (page: number) => {
    return await recipeService.getRecipes(
      { creatorId, isPublic: true },
      page,
      12
    );
  };

  const loadMoreRecipes = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = currentPage + 1;
      const recipesData = await loadCreatorRecipes(nextPage);
      
      setRecipes(prev => [...prev, ...recipesData.recipes]);
      setCurrentPage(nextPage);
      setHasMore(recipesData.total > recipes.length + recipesData.recipes.length);
    } catch (err) {
      console.error('Failed to load more recipes:', err);
    }
  };

  const handleRecipeDelete = async (recipeId: string) => {
    try {
      await recipeService.deleteRecipe(recipeId);
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full" />
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64" />
              <div className="h-4 bg-gray-200 rounded w-96" />
              <div className="h-4 bg-gray-200 rounded w-80" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-8 text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error ? 'Error Loading Profile' : 'Creator Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The creator profile you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={loadCreatorProfile}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Creator Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {creator.profileImageUrl ? (
              <img
                src={creator.profileImageUrl}
                alt={creator.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <ChefHat className="w-16 h-16 text-white" />
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
              {creator.bio && (
                <p className="text-lg text-gray-600 mt-2 max-w-2xl">{creator.bio}</p>
              )}
            </div>

            {/* Creator Stats */}
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Member since {creator.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4" />
                <span>{recipes.length} recipes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center space-x-3">
              {isOwnProfile ? (
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'recipes', label: 'Recipes', count: recipes.length },
            { key: 'about', label: 'About' },
            { key: 'stats', label: 'Statistics' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            {recipes.length === 0 ? (
              <Card className="p-8 text-center">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No recipes yet
                </h3>
                <p className="text-gray-600 mb-4">
                  {isOwnProfile 
                    ? 'Start sharing your cooking videos and recipes!'
                    : 'This creator hasn\'t shared any recipes yet.'
                  }
                </p>
                {isOwnProfile && (
                  <Button>
                    Upload Your First Recipe
                  </Button>
                )}
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map((recipe) => (
                    <VideoRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreRecipes}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Recipes'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">About {creator.name}</h3>
            <div className="space-y-4">
              {creator.bio ? (
                <p className="text-gray-700 leading-relaxed">{creator.bio}</p>
              ) : (
                <p className="text-gray-500 italic">No bio available.</p>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Member since:</span>
                    <span className="ml-2 text-gray-600">
                      {creator.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total recipes:</span>
                    <span className="ml-2 text-gray-600">{recipes.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'stats' && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recipe Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{recipes.length}</div>
                <div className="text-sm text-blue-600">Total Recipes</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {recipes.filter(r => r.isPublic).length}
                </div>
                <div className="text-sm text-green-600">Public Recipes</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(recipes.reduce((acc, r) => acc + r.totalTimeMinutes, 0) / recipes.length) || 0}
                </div>
                <div className="text-sm text-purple-600">Avg. Time (min)</div>
              </div>
            </div>

            {/* Difficulty Distribution */}
            {recipes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Difficulty Distribution</h4>
                <div className="space-y-2">
                  {['easy', 'medium', 'hard'].map((difficulty) => {
                    const count = recipes.filter(r => r.difficultyLevel === difficulty).length;
                    const percentage = (count / recipes.length) * 100;
                    
                    return (
                      <div key={difficulty} className="flex items-center space-x-3">
                        <span className="w-16 text-sm font-medium text-gray-700 capitalize">
                          {difficulty}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-gray-600 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
