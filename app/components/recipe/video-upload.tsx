'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Video, AlertCircle, CheckCircle, Clock, X, LogIn } from 'lucide-react';
import { VideoUploadResult, VideoProcessingStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { ollamaClient } from '@/lib/ollama/client';
import { videoProcessor } from '@/lib/video/processor';
import Link from 'next/link';
import { useEffect } from 'react';

interface VideoUploadProps {
  onUploadComplete: (result: VideoUploadResult) => void;
  onProcessingComplete: (result: VideoUploadResult) => void;
  className?: string;
}

export default function VideoUpload({
  onUploadComplete,
  onProcessingComplete,
  className = ''
}: VideoUploadProps) {
  const { user, loading } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<VideoProcessingStatus | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [userDescription, setUserDescription] = useState('');

  // Progressive loading states
  const [isInitialized, setIsInitialized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const validateFile = (file: File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB (matches Supabase bucket setting)
    const maxDuration = 120; // 2 minutes in seconds

    // Debug logging for validation
    console.log('🔍 File Validation:', {
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileSizeBytes: file.size,
      maxSizeBytes: maxSize,
      maxSizeMB: maxSize / 1024 / 1024,
      isValidSize: file.size <= maxSize
    });

    if (file.size > maxSize) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size of 50MB`);
    }

    if (!file.type.startsWith('video/')) {
      errors.push('File must be a video format (MP4, MOV, AVI, etc.)');
    }

    // Note: Duration validation would require FFmpeg in production
    // For now, we'll just check file size and type

    return { valid: errors.length === 0, errors };
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setValidationErrors([]);
    setProcessingStatus(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setSelectedFile(file);
  }, []);

  const uploadToSupabase = async (file: File): Promise<string> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${user.id}/${fileName}`;

    // Debug logging
    console.log('🔍 Upload Debug Info:', {
      fileName,
      filePath,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileSizeBytes: file.size,
      fileType: file.type
    });

    try {
      console.log('📤 Attempting Supabase upload...');
      const { data, error } = await supabase.storage
        .from('recipe-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Debug logging for errors
        console.error('❌ Supabase Upload Error:', {
          error,
          errorMessage: error.message
        });
        
        // Handle specific storage errors
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          throw new Error('Storage bucket not configured. Please contact support.');
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          throw new Error('Permission denied. Please sign in again.');
        } else if (error.message.includes('exceeded') || error.message.includes('maximum')) {
          throw new Error(`File size limit exceeded: ${error.message}`);
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      // Create a signed URL for secure access to private bucket
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('recipe-videos')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (signedUrlError) {
        console.error('❌ Failed to create signed URL:', signedUrlError);
        throw new Error('Failed to create secure video URL');
      }
      
      if (!signedUrlData?.signedUrl) {
        throw new Error('No signed URL generated');
      }
      
      console.log('🔍 Signed URL Debug:', {
        filePath,
        signedUrl: signedUrlData.signedUrl
      });
      
            return signedUrlData.signedUrl;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  };

  const processVideoWithAI = async (videoFile: File, userDescription: string): Promise<VideoUploadResult> => {
    try {
      console.log('🧠 Starting AI video processing...');
      
      // Extract video metadata
      const metadata = await videoProcessor.extractVideoMetadata(videoFile);
      console.log('📊 Video metadata extracted:', metadata);

      // Extract audio transcript (or video analysis fallback)
      const transcript = await videoProcessor.extractAudioTranscript(videoFile);
      console.log('🎬 Audio transcript extracted:', transcript);

      // Create video thumbnail
      const thumbnailUrl = await videoProcessor.createVideoThumbnail(videoFile);
      console.log('🖼️ Thumbnail created');

      // Generate recipe with AI
      const recipeData = await ollamaClient.generateRecipe({
        videoTranscript: transcript.text,
        userDescription: userDescription || 'Cooking video',
        videoDuration: metadata.duration
      });

      console.log('🍳 Recipe generated with AI:', recipeData);

      // Return the complete result matching VideoUploadResult interface
      const result: VideoUploadResult = {
        videoUrl: '', // Will be set after upload
        thumbnailUrl,
        processingResult: {
          title: recipeData.title, // Use the AI-generated title
          description: recipeData.description, // Use the AI-generated description
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          servings: recipeData.servings,
          prepTime: recipeData.prepTime,
          cookTime: recipeData.cookTime
        }
      };

      return result;
    } catch (error) {
      console.error('❌ AI processing failed:', error);
      throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    setValidationErrors([]);

    try {
      // Upload to Supabase
      setUploadProgress(30);
      const videoUrl = await uploadToSupabase(selectedFile);
      console.log('✅ File uploaded to Supabase:', videoUrl);
      setUploadProgress(60);

      // Process with AI
      setUploadProgress(70);
      setProcessingStatus({
        status: 'extracting',
        message: '🧠 AI is analyzing your video...',
        progress: 70
      });
      
      const result = await processVideoWithAI(selectedFile, userDescription);
      setUploadProgress(90);
      
      setProcessingStatus({
        status: 'analyzing',
        message: '📝 Generating recipe details...',
        progress: 90
      });
      
      // Update result with video URL (already signed from upload)
      result.videoUrl = videoUrl;
      
      // Complete progress
      setUploadProgress(100);
      setProcessingStatus({
        status: 'completed',
        message: '✅ Recipe extracted successfully!',
        progress: 100
      });

      // Extract metadata for localStorage
      const metadata = await videoProcessor.extractVideoMetadata(selectedFile);

      // Store in localStorage for recipe page access
      const recipeId = `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(`recipe_${recipeId}`, JSON.stringify({
        ...result,
        id: recipeId,
        userId: user?.id || '',
        fileName: selectedFile.name,
        duration: metadata.duration,
        fileSize: selectedFile.size,
        createdAt: new Date().toISOString(),
        creator: {
          id: user?.id || 'unknown',
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'NIBBBLE Creator',
          profileImageUrl: user?.user_metadata?.avatar_url,
          bio: 'Passionate food creator sharing amazing recipes',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      
      // Notify parent components
      onUploadComplete(result);
      onProcessingComplete(result);
      
      // Show success message with AI extraction results
      setProcessingStatus({
        status: 'completed',
        message: `✅ Recipe extracted successfully! Redirecting to recipe page...`,
        progress: 100
      });
      
      // Redirect to the video recipe page after a short delay
      setTimeout(() => {
        window.location.href = `/video-recipe/${recipeId}`;
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
      setValidationErrors([`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setProcessingStatus({
        status: 'error',
        message: 'Video upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    setProcessingStatus(null);
    setUploadProgress(0);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Initialize components progressively
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Skeleton Loading State */}
      {!isInitialized && (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}

      {/* Actual Content */}
      {isInitialized && (
        <>
          {/* Alpha Constraints Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Alpha Launch Constraints</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Maximum video duration: 2 minutes</li>
              <li>• Maximum file size: 50MB (matches Supabase bucket setting)</li>
              <li>• Supported formats: MP4, MOV, AVI</li>
              <li>• Videos will be automatically processed with local AI</li>
              <li>• Storage bucket must be configured in Supabase</li>
              <li>• Speech recognition requires HTTPS (mock transcripts used in development)</li>
            </ul>
          </div>

          {/* Authentication Check */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Checking authentication...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign in to Upload Videos
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You need to be signed in to upload cooking videos and create AI-powered recipes.
              </p>
              <div className="space-x-4">
                <Link
                  href="/signin"
                  className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Welcome back, {user.email}!
                    </p>
                    <p className="text-xs text-green-600">
                      You're all set to upload cooking videos and create AI-powered recipes.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Upload Area */}
              {!selectedFile && (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <Video className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload your cooking video
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your video here, or{' '}
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-sm text-gray-500">
                      AI will automatically extract ingredients, instructions, and nutrition info
                    </p>
                  </div>
                </div>
              )}

              {/* Selected File */}
              {selectedFile && (
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Video className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* User Description */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipe Description (Optional)
                    </label>
                    <textarea
                      value={userDescription}
                      onChange={(e) => setUserDescription(e.target.value)}
                      placeholder="Describe what you're making or any special notes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="mt-4 w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center">
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Upload & Process Video
                      </div>
                    )}
                  </button>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Upload Progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <h4 className="text-sm font-medium text-red-800">Upload Requirements Not Met</h4>
          </div>
          <ul className="mt-2 text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Processing Status */}
      {processingStatus && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            {processingStatus.status === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <Clock className="w-5 h-5 text-orange-500 mr-2 animate-spin" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{processingStatus.message}</p>
              {processingStatus.progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingStatus.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
