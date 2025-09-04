'use client';

import { BookOpen, Facebook, Linkedin, Twitter, Instagram, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">BBB</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-[#FF375F] tracking-tight">NIBBBLE</h3>
                <p className="text-xs text-gray-400 font-medium tracking-wider">SNACK. SHARE. SAVOR.</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The Dribbble for food creators. Share your recipes, discover amazing dishes, and build your culinary community. 
              Where TikTok meets Pinterest for food lovers.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF375F] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF375F] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF375F] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#FF375F] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Categories</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Recipe</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Diet</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Meal</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Video</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Tutorial</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Tips</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Stories</a></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Useful Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Terms</a></li>
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
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF375F] focus:border-transparent"
              />
              <button className="px-4 py-3 bg-[#FF375F] hover:bg-[#FF375F]/90 rounded-r-lg transition-colors">
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
            <p className="text-gray-400">© All Rights 2023</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Cookies</a>
              <a href="#" className="text-gray-400 hover:text-[#FFD84D] transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
