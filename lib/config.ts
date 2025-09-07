/**
 * Production-ready configuration management for NIBBBLE
 * Handles environment variables and client-server configuration consistency
 */

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isServer = typeof window === 'undefined';

// Base URL configuration with proper port handling
const getBaseUrl = (): string => {
  // Server-side: use environment variables or defaults
  if (isServer) {
    const port = process.env.PORT || '3000';
    const host = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${port}`;
    return host;
  }
  
  // Client-side: use current origin (handles development and production)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback
  return 'http://localhost:3000';
};

export const config = {
  // Base URLs
  baseUrl: getBaseUrl(),
  apiUrl: `${getBaseUrl()}/api`,
  
  // Environment flags
  isDevelopment,
  isProduction,
  isServer,
  
  // External services
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID!,
  },
  
  
  // Feature flags
  features: {
    alphaMode: process.env.NEXT_PUBLIC_ALPHA_MODE === 'true',
    betaFeatures: process.env.NEXT_PUBLIC_BETA_FEATURES === 'true',
    analytics: isProduction,
    errorTracking: true,
  },
  
  // API Configuration
  api: {
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

export function validateConfig(): void {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(error);
    
    if (isProduction) {
      throw new Error(error);
    }
  }
}

// API helper functions
export const apiHelpers = {
  /**
   * Create a properly formatted API URL
   */
  createUrl: (endpoint: string, params?: Record<string, string | number | boolean>): string => {
    const url = new URL(`${config.apiUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  },
  
  /**
   * Get default fetch options with proper headers
   */
  getDefaultOptions: (options: RequestInit = {}): RequestInit => ({
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }),
  
  /**
   * Fetch with automatic retries and proper error handling
   */
  fetchWithRetry: async (
    url: string, 
    options: RequestInit = {}, 
    retries: number = config.api.retries
  ): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...apiHelpers.getDefaultOptions(options),
        signal: AbortSignal.timeout(config.api.timeout),
      });
      
      if (!response.ok && response.status >= 500 && retries > 0) {
        // Retry on server errors
        await new Promise(resolve => setTimeout(resolve, config.api.retryDelay));
        return apiHelpers.fetchWithRetry(url, options, retries - 1);
      }
      
      return response;
    } catch (error) {
      if (retries > 0 && !(error instanceof DOMException && error.name === 'AbortError')) {
        await new Promise(resolve => setTimeout(resolve, config.api.retryDelay));
        return apiHelpers.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  },
};

// Development helpers
export const devHelpers = {
  /**
   * Log configuration in development
   */
  logConfig: (): void => {
    if (isDevelopment && !isServer) {
      console.group('🔧 NIBBBLE Configuration');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Base URL:', config.baseUrl);
      console.log('API URL:', config.apiUrl);
      console.log('Features:', config.features);
      console.groupEnd();
    }
  },
  
  /**
   * Check for common configuration issues
   */
  validateDevSetup: (): void => {
    if (isDevelopment && !isServer) {
      // Check for localhost port consistency
      const currentPort = window.location.port;
      if (currentPort && currentPort !== '3000') {
        console.warn(`⚠️  Development server is running on port ${currentPort}, expected 3000`);
      }
      
      // Check for required environment variables
      try {
        validateConfig();
        console.log('✅ Configuration validation passed');
      } catch (error) {
        console.error('❌ Configuration validation failed:', error);
      }
    }
  },
};

// Initialize configuration
if (isDevelopment && !isServer) {
  devHelpers.logConfig();
  devHelpers.validateDevSetup();
}