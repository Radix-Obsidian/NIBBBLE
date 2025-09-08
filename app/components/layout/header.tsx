'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import Image from 'next/image';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignIn = () => {
    router.push('/signin?direct=true');
  };

  const handleJoinNow = () => {
    router.push('/cookers/beta');
  };

  const handleLogo = () => {
    router.push('/');
  };

  const handleExplore = () => {
    router.push('/discover');
  };

  const handleBrowse = () => {
    router.push('/feed');
  };

  // Navigation items for guests
  const guestNavItems = [
    { label: 'Explore', onClick: handleExplore, active: pathname === '/discover' },
    { label: 'Recipes', onClick: handleBrowse, active: pathname === '/feed' }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogo}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 relative">
              <Image
                src="/nibbble-logo-temp.svg"
                alt="NIBBBLE Logo"
                width={40}
                height={40}
                className="rounded-full shadow-sm object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-[#111827] font-['Inter']">
              NIBBBLE
            </h1>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!user && guestNavItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`text-sm font-medium transition-colors ${
                  item.active 
                    ? 'text-[#f97316] border-b-2 border-[#f97316] pb-1' 
                    : 'text-[#111827] hover:text-[#f97316]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-[#111827] hover:text-[#f97316] transition-colors font-medium"
                >
                  Dashboard
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="text-[#111827] hover:text-[#f97316] transition-colors font-medium px-4 py-2"
                >
                  Sign In
                </button>
                <Button
                  onClick={handleJoinNow}
                  className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-semibold px-6 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Join Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {!user && guestNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick();
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                  item.active 
                    ? 'bg-orange-50 text-[#f97316]' 
                    : 'text-[#111827] hover:bg-gray-50 hover:text-[#f97316]'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {user ? (
              <button
                onClick={() => {
                  router.push('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left py-3 px-4 rounded-lg font-medium text-[#111827] hover:bg-gray-50 hover:text-[#f97316] transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleSignIn();
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-center py-3 px-4 text-[#111827] hover:text-[#f97316] font-medium transition-colors"
                >
                  Sign In
                </button>
                <Button
                  onClick={() => {
                    handleJoinNow();
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-semibold py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Join Free
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
