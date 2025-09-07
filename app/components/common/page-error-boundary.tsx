'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { logger } from '@/lib/logger';

interface PageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface PageErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
  pageName?: string;
}

class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    const errorId = Math.random().toString(36).substr(2, 9);
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId || Math.random().toString(36).substr(2, 9);
    
    // Enhanced error logging with context
    const errorContext = {
      errorId,
      pageName: this.props.pageName,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
      errorBoundary: 'PageErrorBoundary',
    };

    logger.error('Page-level error caught', { error, errorInfo, context: errorContext });

    // Log to Sentry with additional context
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          errorBoundary: 'page',
          pageName: this.props.pageName,
        },
        extra: {
          errorId,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
        },
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }

    this.setState({
      error,
      errorInfo,
      errorId,
    });
  }

  handleRetry = () => {
    // Clear error state and attempt to re-render
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });

    // Log retry attempt
    logger.info('User initiated error boundary retry', {
      pageName: this.props.pageName,
      errorId: this.state.errorId,
    });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      logger.info('User initiated page reload from error boundary', {
        pageName: this.props.pageName,
        errorId: this.state.errorId,
      });
      window.location.reload();
    }
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      logger.info('User navigated to home from error boundary', {
        pageName: this.props.pageName,
        errorId: this.state.errorId,
      });
      window.location.href = '/dashboard';
    }
  };

  handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      logger.info('User went back from error boundary', {
        pageName: this.props.pageName,
        errorId: this.state.errorId,
      });
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Production-ready error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-lg text-gray-600 mb-2">
              {this.props.pageName 
                ? `We encountered an error loading the ${this.props.pageName} page.` 
                : 'We encountered an unexpected error.'
              }
            </p>

            <p className="text-sm text-gray-500 mb-8">
              Our team has been notified and is working to fix this issue.
              {this.state.errorId && (
                <span className="block mt-1">
                  Error ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{this.state.errorId}</code>
                </span>
              )}
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleGoBack}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </div>

            {/* Development error details */}
            {this.props.showDetails && this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-4">
                  Show Error Details (Development Mode)
                </summary>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs font-mono text-red-800 overflow-auto max-h-60">
                  <div className="mb-3">
                    <strong>Error:</strong> {this.state.error.name}
                  </div>
                  <div className="mb-3">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-3">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* User feedback section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                If this problem persists, please contact our support team.
              </p>
              <a 
                href="/feedback" 
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Report this issue →
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;

// Higher-order component for easy page wrapping
export function withPageErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  pageName?: string
) {
  const ComponentWithPageErrorBoundary = (props: T) => (
    <PageErrorBoundary 
      pageName={pageName}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <WrappedComponent {...props} />
    </PageErrorBoundary>
  );

  ComponentWithPageErrorBoundary.displayName = `withPageErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name
  })`;

  return ComponentWithPageErrorBoundary;
}

// Specialized error boundaries for different page types
export const DashboardErrorBoundary = ({ children }: { children: ReactNode }) => (
  <PageErrorBoundary
    pageName="Dashboard"
    showDetails={process.env.NODE_ENV === 'development'}
    onError={(error, errorInfo, errorId) => {
      // Dashboard-specific error handling
      logger.error('Dashboard error', { error, errorInfo, errorId, section: 'dashboard' });
    }}
  >
    {children}
  </PageErrorBoundary>
);

export const ProfileErrorBoundary = ({ children }: { children: ReactNode }) => (
  <PageErrorBoundary
    pageName="Profile"
    showDetails={process.env.NODE_ENV === 'development'}
    onError={(error, errorInfo, errorId) => {
      // Profile-specific error handling
      logger.error('Profile error', { error, errorInfo, errorId, section: 'profile' });
    }}
  >
    {children}
  </PageErrorBoundary>
);

export const RecipeErrorBoundary = ({ children }: { children: ReactNode }) => (
  <PageErrorBoundary
    pageName="Recipe"
    showDetails={process.env.NODE_ENV === 'development'}
    onError={(error, errorInfo, errorId) => {
      // Recipe-specific error handling
      logger.error('Recipe error', { error, errorInfo, errorId, section: 'recipe' });
    }}
  >
    {children}
  </PageErrorBoundary>
);