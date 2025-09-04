'use client';

import { Search, BookOpen, ChevronDown, User, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/signin');
  };

  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">BBB</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-[#FF375F] tracking-tight">
                NIBBBLE
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wider">
                SNACK. SHARE. SAVOR.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <button className="text-white hover:text-[#FFD84D] transition-colors font-medium flex items-center">
              Recipes
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <button className="text-white hover:text-[#FFD84D] transition-colors font-medium">
              Meal Plans
            </button>
            <button className="text-white hover:text-[#FFD84D] transition-colors font-medium">
              Classes
            </button>
            <button className="text-white hover:text-[#FFD84D] transition-colors font-medium">
              Blog
            </button>
            <button className="text-white hover:text-[#FFD84D] transition-colors font-medium">
              Contact
            </button>
          </nav>

          {/* Right Side - Search, User, Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
              />
            </div>
            
            {/* User Icon */}
            <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF375F] transition-colors">
              <User className="w-5 h-5 text-gray-300" />
            </button>
            
            {/* Cart Icon */}
            <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF375F] transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
