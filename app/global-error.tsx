'use client';

import * as Sentry from "@sentry/nextjs";
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF375F] to-[#FFD84D] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-lg">BBB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              className="bg-gradient-to-r from-[#FF375F] to-[#FFD84D] hover:from-[#FF375F]/90 hover:to-[#FFD84D]/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
