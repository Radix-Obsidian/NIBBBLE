'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error caught:', error)
  }, [error])

  const handleReloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-8">
              We're sorry, but something unexpected happened. Our team has been notified and we're working to fix the issue.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={reset}
                className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={handleReloadPage}
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Error Details (Development Mode)
                </summary>
                <div className="p-4 bg-red-50 border border-red-200 rounded text-xs font-mono text-red-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {error.name}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.digest && (
                    <div className="mb-2">
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}