'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Users, ChefHat, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VideoRecipe } from '@/types';
import { supabase } from '@/lib/supabase/client';

export default function VideoRecipePage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<VideoRecipe | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [servings, setServings] = useState(4);

  // Update servings when recipe loads
  useEffect(() => {
    if (recipe?.servings) {
      setServings(recipe.servings);
    } else {
      setServings(4); // Default servings if not available
    }
  }, [recipe]);

  // Load recipe from localStorage and refresh video URL if needed
  useEffect(() => {
    const recipeId = params.id as string;
    const storedRecipe = localStorage.getItem(`recipe_${recipeId}`);
    
    if (storedRecipe) {
      try {
        const parsedRecipe = JSON.parse(storedRecipe);
        console.log('🔍 Loaded Recipe Debug:', {
          recipeId,
          videoUrl: parsedRecipe.videoUrl,
          title: parsedRecipe.title,
          duration: parsedRecipe.duration
        });
        
        // Check if we need to refresh the signed URL
        if (parsedRecipe.videoUrl && parsedRecipe.videoUrl.includes('tsqtruntoqahnewlotka.supabase.co')) {
          refreshVideoUrl(parsedRecipe);
        } else {
          setRecipe(parsedRecipe);
        }
      } catch (error) {
        console.error('Error parsing stored recipe:', error);
      }
    } else {
      console.warn('No recipe found in localStorage for ID:', recipeId);
    }
  }, [params.id]);

  const refreshVideoUrl = async (recipe: any) => {
    try {
      // Extract the file path from the old URL
      const urlParts = recipe.videoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;
      
      console.log('🔄 Refreshing video URL for path:', filePath);
      
      // Create a new signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('recipe-videos')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedUrlError) {
        console.error('❌ Failed to refresh signed URL:', signedUrlError);
        setRecipe(recipe); // Use old recipe data
        return;
      }
      
      if (signedUrlData?.signedUrl) {
        // Update the recipe with the new URL
        const updatedRecipe = { ...recipe, videoUrl: signedUrlData.signedUrl };
        
        // Update localStorage
        localStorage.setItem(`recipe_${recipe.id}`, JSON.stringify(updatedRecipe));
        
        console.log('✅ Video URL refreshed successfully');
        setRecipe(updatedRecipe);
      } else {
        setRecipe(recipe); // Use old recipe data
      }
    } catch (error) {
      console.error('Error refreshing video URL:', error);
      setRecipe(recipe); // Use old recipe data
    }
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setCurrentTime(video.currentTime);
  };

  const togglePlay = async () => {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      try {
        if (isPlaying) {
          video.pause();
          setIsPlaying(false);
        } else {
          // Check if video is ready to play
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            await video.play();
            setIsPlaying(true);
          } else {
            console.warn('Video not ready to play yet');
          }
        }
      } catch (error) {
        console.error('Video play/pause error:', error);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = document.querySelector('video');
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Scale ingredients based on servings adjustment
  const scaleIngredients = (multiplier: number) => {
    if (!recipe?.ingredients) return [];

    const baseServings = recipe.servings || 4;
    const scaleFactor = multiplier / baseServings;

    return recipe.ingredients.map((ingredient: any) => ({
      ...ingredient,
      amount: Math.round((ingredient.amount * scaleFactor) * 100) / 100
    }));
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 mb-4">
             {recipe.title || 'Delicious Recipe'}
           </h1>
           <p className="text-gray-600 mb-6">
             {recipe.description || 'A delicious recipe created with AI'}
           </p>

           {/* Recipe Stats */}
           <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
             <span>Prep: {recipe.prepTime || 15} min |</span>
             <span>Cook: {recipe.cookTime || 30} min</span>
           </div>

           {/* Servings Control */}
           <div className="flex items-center gap-4 mb-6">
             <span className="text-sm font-medium text-gray-700">Servings:</span>
             <span>{recipe.servings || 4} servings</span>
           </div>

          {/* Recipe Meta */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Prep: {recipe.prepTime || 15} min | 
                Cook: {recipe.cookTime || 30} min
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{recipe.servings || 4} servings</span>
            </div>
            <div className="flex items-center">
              <ChefHat className="w-4 h-4 mr-2" />
              <span>Medium</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Video Player */}
           <div className="lg:col-span-2">
             <div className="bg-black rounded-xl overflow-hidden relative">
               {recipe.videoUrl ? (
                                                     <video
                    className="w-full h-auto"
                    onLoadedMetadata={handleVideoLoad}
                    onTimeUpdate={handleTimeUpdate}
                    onError={(e) => {
                      const video = e.currentTarget as HTMLVideoElement;
                      console.error('Video error details:', {
                        error: video.error,
                        networkState: video.networkState,
                        readyState: video.readyState,
                        src: video.src,
                        currentSrc: video.currentSrc,
                        errorCode: video.error?.code,
                        errorMessage: video.error?.message
                      });
                    }}
                    onLoadStart={() => console.log('Video load started')}
                    onCanPlay={() => console.log('Video can play')}
                    onCanPlayThrough={() => console.log('Video can play through')}
                    onLoadedData={() => console.log('Video loaded data')}
                    onProgress={() => console.log('Video progress')}
                    poster={recipe.thumbnailUrl}
                    controls={false}
                    preload="metadata"
                    crossOrigin="anonymous"
                  >
                    <source src={recipe.videoUrl} type="video/mp4" />
                    <source src={recipe.videoUrl} type="video/webm" />
                    <source src={recipe.videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
               ) : (
                 <div className="w-full h-64 bg-gray-800 flex items-center justify-center">
                   <div className="text-center text-white">
                     <p className="text-lg mb-2">Video URL not available</p>
                     <p className="text-sm text-gray-300">Please check the console for debugging info</p>
                   </div>
                 </div>
               )}
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-orange-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-orange-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  <div className="flex-1 text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>
            </div>

                       {/* Creator Info */}
           <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
             <div className="flex items-center">
               <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                 <ChefHat className="w-6 h-6 text-orange-600" />
               </div>
               <div>
                 <h3 className="font-semibold text-gray-900">
                   {recipe.creator?.name || 'NIBBBLE Creator'}
                 </h3>
                 <p className="text-sm text-gray-600">
                   {recipe.creator?.bio || 'Passionate food creator sharing amazing recipes'}
                 </p>
               </div>
             </div>
           </div>
           
                       
          </div>

          {/* Recipe Sidebar */}
          <div className="lg:col-span-1">
            {/* Servings Adjuster */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Servings</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-900">{servings}</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

                         {/* Ingredients */}
             <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
               <ul className="space-y-3">
                 {scaleIngredients(servings).map((ingredient, index) => (
                   <li key={index} className="flex items-start">
                     <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                     <div>
                       <span className="font-medium text-gray-600">
                         {ingredient.amount && typeof ingredient.amount === 'number' && !isNaN(ingredient.amount)
                           ? `${ingredient.amount} ${ingredient.unit || ''}`.trim()
                           : ingredient.unit || ''
                         }
                       </span>
                       <span className="text-gray-900"> {ingredient.name}</span>
                       {ingredient.notes && (
                         <span className="text-sm text-gray-500 block">({ingredient.notes})</span>
                       )}
                     </div>
                   </li>
                 ))}
               </ul>
             </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions?.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{instruction}</p>
                  </li>
                )) || (
                  <li className="text-gray-500">No instructions available</li>
                )}
              </ol>
            </div>

            {/* Nutrition */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition (per serving)</h3>
              <div className="text-center text-gray-500">
                <p>Nutrition information will be available in future updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
