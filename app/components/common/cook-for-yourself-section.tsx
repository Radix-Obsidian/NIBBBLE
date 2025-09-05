'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, Target, Zap } from 'lucide-react';

export function CookForYourselfSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              AI-Powered Cooking That Actually Works
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stop abandoning recipes halfway through. NIBBBLE's AI adapts every recipe 
              to your skill level, available ingredients, and dietary needs. 
              Experience cooking success, not just inspiration.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">AI recipe personalization</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-gray-700">Success-focused recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Integrated shopping & cooking</span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Start Cooking Smarter</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Images and Text */}
          <div className="space-y-6">
            {/* Top Image - AI Adaptation */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 aspect-video flex items-center justify-center border border-purple-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Recipe Adaptation</h3>
                <p className="text-gray-600 text-sm">Every recipe personalized to your kitchen</p>
              </div>
            </div>
            
            {/* Bottom Image - Success Tracking */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 aspect-video flex items-center justify-center border border-orange-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Prediction</h3>
                <p className="text-gray-600 text-sm">Know before you cook if you'll succeed</p>
              </div>
            </div>
            
            {/* Text Block - Creator Economy */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Join the AI-Native Cooking Revolution
              </h3>
              <p className="text-gray-600 mb-4">
                NIBBBLE isn't just another recipe app. We're building the infrastructure 
                layer for how humanity will cook in the AI era. Share your cooking wisdom, 
                earn from successful outcomes, and help others cook better.
              </p>
              <div className="flex items-center space-x-2 text-sm text-purple-600 font-medium">
                <span>Success-based creator economy</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
