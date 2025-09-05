'use client';

export default function OnboardingSuccessPage() {
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
            Onboarding Complete!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your Stripe Connect account has been successfully set up. You can now accept payments and manage your products.
          </p>
          
          <div className="space-y-3">
            <a
              href="/stripe/connect"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
            
            <p className="text-sm text-gray-500">
              You can now create products and start accepting payments from your customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
