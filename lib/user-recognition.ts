/**
 * User Recognition System for NIBBBLE
 * 
 * This module handles email and IP-based user recognition to prevent
 * repeat signups and provide seamless access for approved users.
 */

import { useState, useEffect } from 'react';

export interface StoredUserData {
  email: string;
  type: 'creator' | 'cooker';
  name: string;
  accessStatus: 'pending' | 'approved' | 'rejected';
  signupTimestamp: string;
}

export interface UserRecognitionResult {
  isRecognized: boolean;
  userData?: StoredUserData;
  shouldRedirect: boolean;
  redirectPath?: string;
  message?: string;
}

export class UserRecognitionService {
  private static readonly STORAGE_KEYS = {
    EMAIL: 'nibbble_user_email',
    TYPE: 'nibbble_user_type',
    NAME: 'nibbble_user_name',
    ACCESS_STATUS: 'nibbble_access_status',
    SIGNUP_TIMESTAMP: 'nibbble_signup_timestamp',
    IP_HASH: 'nibbble_ip_hash'
  } as const;

  /**
   * Store user data in localStorage after successful signup
   */
  static storeUserData(userData: {
    email: string;
    type: 'creator' | 'cooker';
    name: string;
    accessStatus: 'pending' | 'approved' | 'rejected';
  }): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.EMAIL, userData.email);
      localStorage.setItem(this.STORAGE_KEYS.TYPE, userData.type);
      localStorage.setItem(this.STORAGE_KEYS.NAME, userData.name);
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_STATUS, userData.accessStatus);
      localStorage.setItem(this.STORAGE_KEYS.SIGNUP_TIMESTAMP, new Date().toISOString());
      
      // Store a simple hash of user agent + screen dimensions as IP alternative
      const fingerprint = this.generateBrowserFingerprint();
      localStorage.setItem(this.STORAGE_KEYS.IP_HASH, fingerprint);
      
      console.log('User data stored successfully:', { email: userData.email, type: userData.type });
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get stored user data from localStorage
   */
  static getStoredUserData(): StoredUserData | null {
    try {
      const email = localStorage.getItem(this.STORAGE_KEYS.EMAIL);
      const type = localStorage.getItem(this.STORAGE_KEYS.TYPE) as 'creator' | 'cooker';
      const name = localStorage.getItem(this.STORAGE_KEYS.NAME);
      const accessStatus = localStorage.getItem(this.STORAGE_KEYS.ACCESS_STATUS) as 'pending' | 'approved' | 'rejected';
      const signupTimestamp = localStorage.getItem(this.STORAGE_KEYS.SIGNUP_TIMESTAMP);

      if (!email || !type || !accessStatus) {
        return null;
      }

      return {
        email,
        type,
        name: name || '',
        accessStatus,
        signupTimestamp: signupTimestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get stored user data:', error);
      return null;
    }
  }

  /**
   * Update user access status
   */
  static updateAccessStatus(newStatus: 'pending' | 'approved' | 'rejected'): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_STATUS, newStatus);
      console.log('Access status updated:', newStatus);
    } catch (error) {
      console.error('Failed to update access status:', error);
    }
  }

  /**
   * Check if user is recognized and should be redirected
   */
  static async checkUserRecognition(): Promise<UserRecognitionResult> {
    const storedData = this.getStoredUserData();
    
    if (!storedData) {
      return {
        isRecognized: false,
        shouldRedirect: false,
        message: 'No previous signup found'
      };
    }

    // If user has approved access, redirect to feed
    if (storedData.accessStatus === 'approved') {
      return {
        isRecognized: true,
        userData: storedData,
        shouldRedirect: true,
        redirectPath: '/feed',
        message: 'Welcome back! Redirecting to your feed...'
      };
    }

    // Check current status with API
    try {
      const response = await fetch(`/api/waitlist?email=${encodeURIComponent(storedData.email)}`);
      if (response.ok) {
        const apiData = await response.json();
        
        // Update stored status if it changed
        if (apiData.status !== storedData.accessStatus) {
          this.updateAccessStatus(apiData.status);
          storedData.accessStatus = apiData.status;
        }

        if (apiData.status === 'approved') {
          return {
            isRecognized: true,
            userData: storedData,
            shouldRedirect: true,
            redirectPath: '/feed',
            message: 'Great news! You now have access. Redirecting...'
          };
        } else if (apiData.status === 'pending') {
          return {
            isRecognized: true,
            userData: storedData,
            shouldRedirect: false,
            message: `You're already on our ${storedData.type} waitlist. We'll notify you when access is available!`
          };
        } else if (apiData.status === 'rejected') {
          return {
            isRecognized: true,
            userData: storedData,
            shouldRedirect: false,
            message: 'Your previous application was not approved. You can apply again below.'
          };
        }
      }
    } catch (error) {
      console.error('Failed to check API status:', error);
    }

    // Return stored data even if API check failed
    return {
      isRecognized: true,
      userData: storedData,
      shouldRedirect: false,
      message: `You're on our ${storedData.type} waitlist. Check your email for updates!`
    };
  }

  /**
   * Clear all stored user data (for testing or user logout)
   */
  static clearStoredData(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('All user data cleared');
    } catch (error) {
      console.error('Failed to clear stored data:', error);
    }
  }

  /**
   * Generate a simple browser fingerprint for user recognition
   * (Alternative to IP tracking for client-side recognition)
   */
  private static generateBrowserFingerprint(): string {
    try {
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset().toString(),
        navigator.platform
      ];
      
      // Simple hash function
      let hash = 0;
      const combined = components.join('|');
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36);
    } catch (error) {
      console.error('Failed to generate browser fingerprint:', error);
      return 'unknown';
    }
  }

  /**
   * Check if current browser matches stored fingerprint
   */
  static isSameBrowser(): boolean {
    try {
      const storedFingerprint = localStorage.getItem(this.STORAGE_KEYS.IP_HASH);
      const currentFingerprint = this.generateBrowserFingerprint();
      
      return storedFingerprint === currentFingerprint;
    } catch (error) {
      console.error('Failed to check browser match:', error);
      return false;
    }
  }

  /**
   * Get user signup age in days
   */
  static getSignupAge(): number | null {
    try {
      const signupTimestamp = localStorage.getItem(this.STORAGE_KEYS.SIGNUP_TIMESTAMP);
      if (!signupTimestamp) return null;
      
      const signupDate = new Date(signupTimestamp);
      const now = new Date();
      const diffTime = now.getTime() - signupDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Failed to calculate signup age:', error);
      return null;
    }
  }
}

/**
 * React hook for user recognition
 */
export function useUserRecognition() {
  const [recognition, setRecognition] = useState<UserRecognitionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkRecognition();
  }, []);

  const checkRecognition = async () => {
    try {
      setIsLoading(true);
      const result = await UserRecognitionService.checkUserRecognition();
      setRecognition(result);
    } catch (error) {
      console.error('User recognition failed:', error);
      setRecognition({
        isRecognized: false,
        shouldRedirect: false,
        message: 'Unable to check user status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecognition = () => {
    checkRecognition();
  };

  const clearUser = () => {
    UserRecognitionService.clearStoredData();
    setRecognition({
      isRecognized: false,
      shouldRedirect: false,
      message: 'User data cleared'
    });
  };

  return {
    recognition,
    isLoading,
    refreshRecognition,
    clearUser
  };
}