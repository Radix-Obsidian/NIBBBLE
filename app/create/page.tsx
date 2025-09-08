'use client'

import { useState } from 'react'
import { Camera, Video, Upload, ChefHat, Clock, Users, Tag } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()
  const [contentType, setContentType] = useState<'recipe' | 'video' | null>(null)

  const createOptions = [
    {
      id: 'recipe',
      title: 'Share Recipe',
      description: 'Create a step-by-step recipe with photos',
      icon: <ChefHat className="w-12 h-12" />,
      color: 'from-orange-500 to-red-500',
      action: () => router.push('/dashboard/recipes')
    },
    {
      id: 'video',
      title: 'Record Video',
      description: 'Show your cooking process with a video',
      icon: <Video className="w-12 h-12" />,
      color: 'from-pink-500 to-purple-500',
      action: () => setContentType('video')
    },
    {
      id: 'upload',
      title: 'Upload Content',
      description: 'Upload photos or videos from your device',
      icon: <Upload className="w-12 h-12" />,
      color: 'from-blue-500 to-indigo-500',
      action: () => setContentType('recipe')
    }
  ]

  if (contentType === 'video') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Video className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Video Recording</h2>
          <p className="text-gray-300 mb-6">This feature is coming soon!</p>
          <Button
            onClick={() => setContentType(null)}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black"
          >
            Back to Options
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Something Delicious</h1>
        <p className="text-gray-600">Share your culinary creativity with the NIBBBLE community</p>
      </div>

      {/* Create Options */}
      <div className="space-y-4 max-w-md mx-auto">
        {createOptions.map((option) => (
          <button
            key={option.id}
            onClick={option.action}
            className="w-full p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-12 max-w-md mx-auto">
        <h3 className="font-bold text-gray-900 mb-4 text-center">Tips for Great Content</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Good Lighting</p>
              <p className="text-gray-600">Natural light works best for food photography</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Keep It Simple</p>
              <p className="text-gray-600">Focus on the key steps that matter most</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Engage Your Audience</p>
              <p className="text-gray-600">Share personal tips and variations</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Use Hashtags</p>
              <p className="text-gray-600">Help people discover your recipes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}