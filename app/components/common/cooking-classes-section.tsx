'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Star, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function CookingClassesSection() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current && videoRef.current) {
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const isVisible = sectionRect.bottom > 0 && sectionRect.top < window.innerHeight;
        
        if (isVisible !== isVideoVisible) {
          setIsVideoVisible(isVisible);
          
          if (isVisible) {
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {
                // Silently handle autoplay restrictions
              });
            }
          } else {
            if (!videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        }
      }
    };

    handleScroll();
    
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
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [isVideoVisible]);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-[#111827] leading-tight font-['Poppins']">
              Learn from AI-Enhanced Cooking Creators
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our community of verified chefs and home cooks share their expertise through 
              interactive classes powered by AI. Learn techniques that actually work, 
              with personalized guidance based on your skill level and kitchen setup.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#10b981]" />
                </div>
                <span className="text-gray-700">Verified creator community</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#f59e0b]/10 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <span className="text-gray-700">Success-based creator earnings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#f97316]/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#f97316]" />
                </div>
                <span className="text-gray-700">AI-personalized learning paths</span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Classes Coming Soon</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Creator Video */}
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
                style={{ aspectRatio: '9/16', minHeight: '500px' }}
              >
                <source src="/INSTANT Knife Skills.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Creator Attribution */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-sm font-medium">Knife Skills Masterclass</p>
                <p className="text-gray-300 text-xs">Professional Technique</p>
              </div>
            </div>
            
            {/* Creator Stats */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">JW</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#111827]">@JoshuaWeissman</h4>
                    <p className="text-sm text-gray-600">Verified YouTube Chef • 2.3k students</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-[#f59e0b] fill-current" />
                  <span className="text-sm font-medium text-[#111827]">4.9</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                "NIBBBLE's AI helps me teach techniques that actually work for each student's skill level. 
                My students have a 94% success rate!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}