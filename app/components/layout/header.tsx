'use client';

import { Search, BookOpen, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              PantryPals
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Input
              placeholder="Search recipes, ingredients, or chefs..."
              icon={<Search className="w-5 h-5" />}
              className="w-full"
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <button className="text-gray-600 hover:text-orange-600 transition-colors">
              Explore
            </button>
            {user && (
              <button className="text-gray-600 hover:text-orange-600 transition-colors">
                Create
              </button>
            )}
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 hidden sm:block">{user.email}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="md" asChild>
                <a href="/signin">Sign In</a>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
