'use client';

import { Search, BookOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              PantryPals
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes, ingredients,"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <button className="text-gray-900 hover:text-orange-600 transition-colors font-medium">
              Explore
            </button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Sign In
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
