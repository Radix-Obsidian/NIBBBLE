'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection by getting the current user session
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // If we get here, the connection is working
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {connectionStatus === 'loading' && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {connectionStatus === 'connected' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {connectionStatus === 'error' && (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            Supabase Connection
          </p>
          <p className="text-xs text-gray-500">
            {connectionStatus === 'loading' && 'Testing connection...'}
            {connectionStatus === 'connected' && 'Connected successfully'}
            {connectionStatus === 'error' && 'Connection failed'}
          </p>
          {connectionStatus === 'error' && errorMessage && (
            <p className="text-xs text-red-500 mt-1 truncate" title={errorMessage}>
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
