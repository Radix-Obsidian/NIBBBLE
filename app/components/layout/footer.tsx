'use client';

import { BookOpen, Instagram, ArrowRight, Utensils } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/nibbble-logo-temp.svg"
                    alt="NIBBBLE Logo"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-[#f97316] font-['Inter'] tracking-tight">NIBBBLE</h3>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-400 font-medium tracking-wider">SNACK. SHARE. SAVOR.</p>
                <Utensils className="w-4 h-4 text-[#f97316]" />
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The ultimate platform for food creators. Share your recipes, discover amazing dishes, and build your culinary community. 
              Where creativity meets flavor in every bite.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#f97316] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#f97316] transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Useful Links */}
          <div className="space-y-6 flex flex-col items-center text-center">
            <h4 className="text-lg font-semibold">Useful Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Terms</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Get weekly updates</h4>
            <p className="text-gray-400">
              Stay updated with the latest recipes, cooking tips, and culinary inspiration.
            </p>
            
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
              />
              <button className="px-4 py-3 bg-[#f97316] hover:bg-[#d97706] rounded-r-lg transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-400">© All Rights 2025</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Cookies</a>
              <a href="#" className="text-gray-400 hover:text-[#f97316] transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
