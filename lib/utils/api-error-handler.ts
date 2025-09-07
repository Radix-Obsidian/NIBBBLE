import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
  context?: Record<string, any>;
}

export class ApiErrorHandler {
  /**
   * Creates a standardized error response
   */
  static createErrorResponse(
    error: ApiError,
    requestId?: string
  ): NextResponse {
    const errorResponse = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
      ...(process.env.NODE_ENV === 'development' && error.details && { details: error.details })
    };

    return NextResponse.json(errorResponse, {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...(requestId && { 'X-Request-ID': requestId })
      }
    });
  }

  /**
   * Handles and logs API errors with proper classification
   */
  static async handleApiError(
    error: unknown,
    context: {
      endpoint: string;
      method: string;
      userId?: string;
      requestId?: string;
      additionalContext?: Record<string, any>;
    }
  ): Promise<NextResponse> {
    const requestId = context.requestId || Math.random().toString(36).substr(2, 9);

    // Log error with full context
    logger.error('API error occurred', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context: {
        ...context,
        requestId,
        timestamp: new Date().toISOString(),
      }
    });

    // Classify error and create appropriate response
    let apiError: ApiError;

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'ValidationError') {
        apiError = {
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: error.message,
        };
      } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
        apiError = {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          statusCode: 401,
        };
      } else if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
        apiError = {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
          statusCode: 403,
        };
      } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
        apiError = {
          message: 'Resource not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        };
      } else if (error.name === 'ConflictError' || error.message.includes('conflict')) {
        apiError = {
          message: 'Resource conflict',
          code: 'CONFLICT',
          statusCode: 409,
        };
      } else if (error.name === 'RateLimitError' || error.message.includes('rate limit')) {
        apiError = {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT',
          statusCode: 429,
        };
      } else if (error.message.includes('timeout')) {
        apiError = {
          message: 'Request timeout. Please try again.',
          code: 'TIMEOUT',
          statusCode: 408,
        };
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        apiError = {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
          statusCode: 503,
        };
      } else {
        // Generic server error
        apiError = {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
      }
    } else {
      // Handle non-Error objects
      apiError = {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      };
    }

    // Report to Sentry for server errors
    if (apiError.statusCode >= 500) {
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
        tags: {
          endpoint: context.endpoint,
          method: context.method,
          errorCode: apiError.code,
        },
        user: context.userId ? { id: context.userId } : undefined,
        extra: {
          requestId,
          context: context.additionalContext,
        },
      });
    }

    return this.createErrorResponse(apiError, requestId);
  }

  /**
   * Validates request body with proper error handling
   */
  static validateRequestBody<T>(
    body: any,
    requiredFields: (keyof T)[],
    fieldValidators?: Partial<Record<keyof T, (value: any) => boolean>>
  ): T {
    if (!body || typeof body !== 'object') {
      throw new Error('Request body is required and must be a valid JSON object');
    }

    // Check required fields
    const missingFields = requiredFields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate field formats if validators provided
    if (fieldValidators) {
      for (const [field, validator] of Object.entries(fieldValidators)) {
        if (body[field] !== undefined && !validator(body[field])) {
          throw new Error(`Invalid format for field: ${field}`);
        }
      }
    }

    return body as T;
  }

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates password strength
   */
  static isValidPassword(password: string): boolean {
    // At least 8 characters, with uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Sanitizes input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter() {
    const requests = new Map<string, { count: number; resetTime: number }>();
    
    return (identifier: string, maxRequests: number = 10, windowMs: number = 60000) => {
      const now = Date.now();
      const userRequests = requests.get(identifier);
      
      if (!userRequests || now > userRequests.resetTime) {
        requests.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (userRequests.count >= maxRequests) {
        return false;
      }
      
      userRequests.count++;
      return true;
    };
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
};

// Common field validators
export const FieldValidators = {
  email: (value: string) => ValidationPatterns.email.test(value),
  password: (value: string) => ValidationPatterns.password.test(value),
  url: (value: string) => ValidationPatterns.url.test(value),
  phone: (value: string) => ValidationPatterns.phone.test(value),
  username: (value: string) => ValidationPatterns.username.test(value),
  nonEmpty: (value: any) => value !== null && value !== undefined && String(value).trim().length > 0,
  maxLength: (max: number) => (value: string) => value.length <= max,
  minLength: (min: number) => (value: string) => value.length >= min,
  isNumber: (value: any) => !isNaN(Number(value)),
  isPositive: (value: number) => value > 0,
};

// Export default instance
export default ApiErrorHandler;