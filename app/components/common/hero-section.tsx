'use client';

import { Play, Users, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useRef, useState } from 'react'

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Learn to Cook
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  Like a Pro
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover thousands of recipes from home cooks and professional chefs.
                Follow your favorite creators, save recipes, and build your cooking skills
                with our step-by-step video guides.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="flex items-center justify-center space-x-2">
                <a href="/signin" className="flex items-center justify-center space-x-2 w-full h-full">
                  <Play className="w-5 h-5" />
                  <span>Start Cooking</span>
                </a>
              </Button>
              <Button variant="outline" size="xl" className="flex items-center justify-center">
                <a href="https://www.tiktok.com/@createaplatewithdina" target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">Watch Chef Dina</a>
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>10K+ Creators</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>50K+ Recipes</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Trending Daily</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="relative aspect-video">
                  <video
                    ref={videoRef}
                    src="https://cdn.builder.io/o/assets%2F4218c0306881441f993eb2c79b2c9dc3%2F12bfef8eeca6445c9f98a5bc5aa5fa39?alt=media&token=272ff243-5f8e-40fd-9b84-c280f9987fdb&apiKey=4218c0306881441f993eb2c79b2c9dc3"
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    muted
                    loop
                    autoPlay
                    onClick={togglePlay}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">Braised Beef Short Ribs</h3>
                  </div>
                  <p className="text-gray-600 mb-4">Slow-braised short ribs with red wine, herbs, and aromatics—fall-off-the-bone tender.</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>3 hr</span>
                      </div>
                      <span>•</span>
                      <span>Medium</span>
                      <span>•</span>
                      <span>Dinner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Recipe Cards */}
            <div className="absolute top-10 -right-10 z-0">
              <div className="bg-white rounded-2xl shadow-xl p-4 transform -rotate-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🥗</span>
                </div>
                <p className="text-xs font-medium text-gray-700 mt-2">Fresh Salad</p>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 z-0">
              <div className="bg-white rounded-2xl shadow-xl p-4 transform rotate-6">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-200 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍰</span>
                </div>
                <p className="text-xs font-medium text-gray-700 mt-2">Sweet Cake</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
