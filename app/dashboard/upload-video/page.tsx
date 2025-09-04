'use client';

import React, { useState } from 'react';
import VideoUpload from '@/app/components/recipe/video-upload';
import { VideoUploadResult } from '@/types';

export default function UploadVideoPage() {
  const [uploadResult, setUploadResult] = useState<VideoUploadResult | null>(null);

  const handleUploadComplete = (result: VideoUploadResult) => {
    setUploadResult(result);
    console.log('Video upload completed:', result);
  };

  const handleProcessingComplete = (result: VideoUploadResult) => {
    setUploadResult(result);
    console.log('Video processing completed:', result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Cooking Video
          </h1>
          <p className="text-lg text-gray-600">
            Share your cooking process and let AI extract the recipe automatically
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <VideoUpload
            onUploadComplete={handleUploadComplete}
            onProcessingComplete={handleProcessingComplete}
          />

          {uploadResult && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Video Upload Successful!
              </h3>
              <p className="text-green-700">
                Your video has been uploaded and is being processed. You'll receive a notification when the recipe extraction is complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
