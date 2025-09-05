'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ChefHat, ShoppingCart, Brain, CheckCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current && videoRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const isVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
        
        if (isVisible !== isVideoVisible) {
          setIsVideoVisible(isVisible);
          
          if (isVisible) {
            // Only play if not already playing
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {
                // Silently handle autoplay restrictions
              });
            }
          } else {
            // Only pause if currently playing
            if (!videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        }
      }
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener with throttling
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [isVideoVisible]);

  return (
    <section ref={heroRef} className="bg-white text-gray-900 relative overflow-hidden">
      {/* Top Bar - NIBBBLE Features */}
      <div className="bg-gradient-to-r from-[#f97316] to-[#d97706] text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Recipe Adaptation</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Integrated Shopping</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>94% Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full px-4 py-2">
              <span className="text-[#f97316] font-semibold text-sm">SNACK. SHARE. SAVOR.</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-[#111827]">
                The Shopify for{' '}
                <span className="bg-gradient-to-r from-[#f97316] to-[#d97706] bg-clip-text text-transparent">
                  Home Cooks
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Stop wasting time on recipes that don't work. NIBBBLE creates complete cooking experiences with AI-adapted recipes, integrated grocery delivery, and success prediction.{' '}
                <span className="text-[#f97316] font-semibold">Cook with confidence.</span>
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex items-center justify-center min-h-[80px]">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-900 font-semibold text-center">94% Success Rate</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex items-center justify-center min-h-[80px]">
                <div className="flex items-center justify-center space-x-3">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                  <span className="text-gray-900 font-semibold text-center">Integrated Shopping</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex items-center justify-center min-h-[80px]">
                <div className="flex items-center justify-center space-x-3">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <span className="text-gray-900 font-semibold text-center">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/signin')}
                className="group bg-gradient-to-r from-[#f97316] via-[#d97706] to-[#f97316] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-[#f97316]/25 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Start Cooking Better</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/learn-more')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300"
              >
                See How It Works
              </button>
            </div>

            {/* Community */}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-lg">
                    👨‍🍳
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-lg">
                    👩‍🍳
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-lg">
                    🧑‍🍳
                  </div>
                </div>
                <span>Join the NIBBBLE Community</span>
              </div>
            </div>
          </div>

          {/* Right Side - Video Demo */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-100">
              <video
                ref={videoRef}
                className="w-full h-auto object-contain bg-black"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                webkit-playsinline="true"
                controls
                style={{ aspectRatio: '9/16' }}
              >
                <source src="/ssstik.io_@createaplatewithdina_Tacos.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Creator Attribution - Moved to top right */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm font-medium">@createaplatewithdina</p>
                <p className="text-gray-300 text-xs">Taco Recipe</p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}