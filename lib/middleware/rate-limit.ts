import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Get current rate limit data for this IP
    const rateLimitData = rateLimitMap.get(ip)
    
    if (!rateLimitData || now > rateLimitData.resetTime) {
      // First request or window expired, reset
      rateLimitMap.set(ip, { count: 1, resetTime: now + config.windowMs })
      return null // No rate limiting needed
    }
    
    if (rateLimitData.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: config.message || 'Too many requests, please try again later',
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitData.resetTime.toString()
          }
        }
      )
    }
    
    // Increment request count
    rateLimitData.count++
    rateLimitMap.set(ip, rateLimitData)
    
    return null // No rate limiting needed
  }
}

// Predefined rate limiters for different endpoints
export const apiRateLimit = createRateLimiter({
  maxRequests: 100, // 100 requests per window
  windowMs: 60 * 1000, // 1 minute
  message: 'API rate limit exceeded. Please try again in a minute.'
})

export const authRateLimit = createRateLimiter({
  maxRequests: 5, // 5 auth attempts per window
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
})

export const searchRateLimit = createRateLimiter({
  maxRequests: 30, // 30 searches per window
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many search requests. Please try again in a minute.'
})

// Clean up old entries periodically (every 5 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip)
      }
    }
  }, 5 * 60 * 1000)
}
