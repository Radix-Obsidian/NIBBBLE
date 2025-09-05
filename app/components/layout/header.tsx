'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignIn = () => {
    router.push('/signin');
  };

  const handleGetStarted = () => {
    router.push('/signin');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">BBB</span>
            </div>
            <h1 className="text-2xl font-bold text-[#111827] font-['Inter']">
              NIBBBLE
            </h1>
          </div>

          {/* Right Side - CTA */}
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="text-[#111827] hover:text-[#f97316] transition-colors font-medium"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={handleSignIn}
                  className="text-[#111827] hover:text-[#f97316] transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-[#f97316] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d97706] transition-all duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
