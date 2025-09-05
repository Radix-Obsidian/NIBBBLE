'use client';

export default function OnboardingRefreshPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Onboarding Link Expired
          </h2>
          
          <p className="text-gray-600 mb-6">
            The onboarding link has expired. Please return to the dashboard to start a new onboarding process.
          </p>
          
          <div className="space-y-3">
            <a
              href="/stripe/connect"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
            
            <p className="text-sm text-gray-500">
              You can refresh your account status or start a new onboarding process from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
