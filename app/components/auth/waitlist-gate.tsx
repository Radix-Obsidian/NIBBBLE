'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { UserRecognitionService } from '@/lib/user-recognition';

interface WaitlistGateProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function WaitlistGate({ children, userEmail }: WaitlistGateProps) {
  const [waitlistStatus, setWaitlistStatus] = useState<'loading' | 'not_found' | 'pending' | 'approved' | 'rejected'>('loading');
  const [userType, setUserType] = useState<'creator' | 'cooker' | null>(null);
  const [nextSteps, setNextSteps] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    checkUserAccess();
  }, [userEmail]);

  const checkUserAccess = async () => {
    try {
      // Use UserRecognitionService for comprehensive user checking
      const recognition = await UserRecognitionService.checkUserRecognition();
      
      if (recognition.isRecognized && recognition.userData) {
        setUserType(recognition.userData.type);
        setWaitlistStatus(recognition.userData.accessStatus);
        setNextSteps(recognition.message || '');
        
        // If user should be redirected, they have approved status
        if (recognition.shouldRedirect && recognition.redirectPath) {
          // Auto-redirect approved users to their feed
          router.push(recognition.redirectPath);
          return;
        }
      } else if (userEmail) {
        // Fallback to direct API check if userEmail is provided but not recognized
        await checkWaitlistStatus(userEmail);
      } else {
        setWaitlistStatus('not_found');
      }
      
    } catch (error) {
      console.error('Error checking user access:', error);
      setWaitlistStatus('not_found');
    }
  };

  const checkWaitlistStatus = async (email: string) => {
    try {
      const response = await fetch(`/api/waitlist?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setWaitlistStatus(data.status);
        setNextSteps(data.nextSteps || '');
        
        // Get user type from API response
        const apiUserType = data.entry?.type as 'creator' | 'cooker' | null;
        setUserType(apiUserType);
        
        // Store using UserRecognitionService if we have entry data
        if (data.entry && data.entry.name) {
          UserRecognitionService.storeUserData({
            email: email,
            type: apiUserType || 'cooker',
            name: data.entry.name,
            accessStatus: data.status
          });
        }
        
      } else {
        setWaitlistStatus('not_found');
      }
    } catch (error) {
      console.error('Error checking waitlist status:', error);
      setWaitlistStatus('not_found');
    }
  };

  if (waitlistStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking waitlist status...</p>
        </div>
      </div>
    );
  }

  if (waitlistStatus === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Join Our Waitlist First
            </h1>
            <p className="text-gray-600 mb-6">
              To access NIBBBLE's features, you need to join our waitlist first. Choose your path below:
            </p>
            <div className="space-y-4">
              <Button 
                size="xl" 
                onClick={() => router.push('/cookers/beta')}
                className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white"
              >
                <span>Join as Home Cook</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                onClick={() => router.push('/creators/waitlist')}
                className="w-full border-2 border-gray-300 hover:border-[#f97316] hover:text-[#f97316]"
              >
                Join as Content Creator
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (waitlistStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Waitlist Pending
            </h1>
            <p className="text-gray-600 mb-6">
              {nextSteps || "Your waitlist application is being reviewed. We'll notify you as soon as you're approved for early access."}
            </p>
            <div className="space-y-4">
              <Button 
                size="xl" 
                onClick={() => router.push('/cookers/learn-more')}
                className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white"
              >
                Learn More About NIBBBLE
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (waitlistStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Application Not Approved
            </h1>
            <p className="text-gray-600 mb-6">
              {nextSteps || "Unfortunately, your waitlist application wasn't approved at this time. You can reapply or join our general waitlist."}
            </p>
            <div className="space-y-4">
              <Button 
                size="xl" 
                onClick={() => router.push('/cookers/beta')}
                className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white"
              >
                Reapply to Waitlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (waitlistStatus === 'approved') {
    return <>{children}</>;
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
