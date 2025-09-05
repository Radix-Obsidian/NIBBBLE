'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, Target, Zap } from 'lucide-react';

export function CookForYourselfSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-[#111827] leading-tight font-['Poppins']">
              AI-Powered Cooking That Actually Works
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stop abandoning recipes halfway through. NIBBBLE's AI adapts every recipe 
              to your skill level, available ingredients, and dietary needs. 
              Experience cooking success, not just inspiration.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#f97316]/10 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#f97316]" />
                </div>
                <span className="text-gray-700">AI recipe personalization</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-[#10b981]" />
                </div>
                <span className="text-gray-700">Success-focused recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#d97706]/10 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#d97706]" />
                </div>
                <span className="text-gray-700">Integrated shopping & cooking</span>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/signin?mode=signup')}
              className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-200 hover:shadow-lg"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Images and Text */}
          <div className="space-y-6">
            {/* Top Image - AI Adaptation */}
            <div className="bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] rounded-2xl p-8 aspect-video flex items-center justify-center border border-gray-100">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2 font-['Poppins']">AI Recipe Adaptation</h3>
                <p className="text-gray-600 text-sm">Every recipe personalized to your kitchen</p>
              </div>
            </div>
            
            {/* Bottom Image - Success Tracking */}
            <div className="bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb] rounded-2xl p-8 aspect-video flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#111827] mb-2 font-['Poppins']">Success Prediction</h3>
                <p className="text-gray-600 text-sm">Know before you cook if you'll succeed</p>
              </div>
            </div>
            
            {/* Text Block - Creator Economy */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-[#111827] mb-3 font-['Poppins']">
                Join the Smart Cooking Movement
              </h3>
              <p className="text-gray-600 mb-4">
                NIBBBLE isn't just another recipe app. We're building the infrastructure 
                layer for how humanity will cook in the AI era. Share your cooking wisdom, 
                earn from successful outcomes, and help others cook better.
              </p>
              <div className="flex items-center space-x-2 text-sm text-[#f97316] font-medium">
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
