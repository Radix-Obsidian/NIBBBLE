'use client';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          
          <div className="space-y-3">
            <a
              href="/stripe/connect"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
            
            <button
              onClick={() => window.history.back()}
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
