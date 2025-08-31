'use client';

import { Play, Users, BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';

export function HeroSection() {
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
              <Button variant="outline" size="xl">
                Watch Demo
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
              <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center">
                  <Play className="w-16 h-16 text-orange-600" />
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-gray-900">Quick Pasta Carbonara</h3>
                  <p className="text-sm text-gray-600">15 min • Easy • Italian</p>
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
