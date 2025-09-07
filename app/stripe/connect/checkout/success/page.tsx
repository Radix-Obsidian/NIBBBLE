'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // In a real application, you would verify the session with Stripe
      // and retrieve the payment details
      setLoading(false);
    } else {
      setError('No session ID provided');
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Payment Error
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <a
              href="/stripe/connect"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          
          {sessionId && (
            <p className="text-sm text-gray-500 mb-6">
              Session ID: {sessionId}
            </p>
          )}
          
          <div className="space-y-3">
            <a
              href="/stripe/connect"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
            
            <button
              onClick={() => window.print()}
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
