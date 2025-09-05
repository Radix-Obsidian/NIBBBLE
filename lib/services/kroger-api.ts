import { logger } from '@/lib/logger'

// Configuration
const CLIENT_ID = process.env.KROGER_CLIENT_ID
const CLIENT_SECRET = process.env.KROGER_CLIENT_SECRET
const BASE_URL = process.env.KROGER_BASE_URL || 'https://api.kroger.com/v1'
const RATE_LIMIT = parseInt(process.env.KROGER_RATE_LIMIT || '1000')

// Types
export interface KrogerToken {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: number
}

export interface KrogerProduct {
  productId: string
  upc: string
  name: string
  description?: string
  brand?: string
  categories: string[]
  images: Array<{
    perspective: string
    featured: boolean
    sizes: Array<{
      size: string
      url: string
    }>
  }>
  items: Array<{
    itemId: string
    favorite: boolean
    fulfillment: {
      curbside: boolean
      delivery: boolean
      inStore: boolean
      shipToHome: boolean
    }
    price: {
      regular: number
      promo: number
    }
    size: string
    soldBy: string
  }>
}

export interface KrogerStore {
  locationId: string
  chain: string
  name: string
  address: {
    addressLine1: string
    city: string
    state: string
    zipCode: string
    county: string
  }
  geolocation: {
    latitude: number
    longitude: number
  }
  phone: string
  hours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  services: string[]
  departments: string[]
}

export interface KrogerSearchResponse {
  data: KrogerProduct[]
  meta: {
    pagination: {
      start: number
      limit: number
      total: number
    }
    warnings?: string[]
  }
}

export interface KrogerLocationResponse {
  data: KrogerStore[]
  meta: {
    pagination: {
      start: number
      limit: number
      total: number
    }
  }
}

// Rate limiting tracking
let requestCount = 0
let lastResetTime = new Date()
let currentToken: KrogerToken | null = null

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

class KrogerAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'KrogerAPIError'
  }
}

/**
 * Check rate limits and throw error if exceeded
 */
function checkRateLimit(): void {
  const now = new Date()
  
  // Reset monthly counter if it's been a month
  if (now.getMonth() !== lastResetTime.getMonth()) {
    requestCount = 0
    lastResetTime = now
  }
  
  if (requestCount >= RATE_LIMIT) {
    throw new KrogerAPIError(
      `Monthly API limit exceeded. ${RATE_LIMIT} requests per month allowed.`,
      429
    )
  }
}

/**
 * Get OAuth2 access token for Kroger API
 */
async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new KrogerAPIError('Kroger API credentials not configured', 500)
  }

  // Check if current token is still valid
  if (currentToken && Date.now() < currentToken.expires_at) {
    return currentToken.access_token
  }

  try {
    logger.info('Getting new Kroger access token')

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    
    const response = await fetch(`${BASE_URL}/connect/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials&scope=product.compact'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new KrogerAPIError(
        `OAuth token request failed: ${errorData.error_description || response.statusText}`,
        response.status,
        errorData.error
      )
    }

    const tokenData = await response.json()
    
    currentToken = {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      expires_at: Date.now() + (tokenData.expires_in * 1000) - 60000 // 1 minute buffer
    }

    logger.info('Kroger access token obtained', {
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type
    })

    return currentToken.access_token

  } catch (error) {
    logger.error('Failed to get Kroger access token', error)
    throw error
  }
}

/**
 * Make authenticated request to Kroger API
 */
async function makeRequest<T>(
  endpoint: string,
  params: Record<string, any> = {},
  retries: number = 2
): Promise<T> {
  checkRateLimit()

  // Create cache key
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logger.info('Serving from cache', { endpoint, params })
    return cached.data
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const token = await getAccessToken()
      
      const url = new URL(`${BASE_URL}${endpoint}`)
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString())
        }
      })

      logger.info('Making Kroger API request', {
        endpoint,
        params,
        attempt,
        url: url.toString()
      })

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'User-Agent': 'PantryPals/1.0'
        }
      })

      // Update rate limiting counter
      requestCount++

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear it and retry
          currentToken = null
          if (attempt < retries) {
            logger.warn('Token expired, retrying with new token')
            continue
          }
        }

        const errorData = await response.json().catch(() => ({}))
        throw new KrogerAPIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        )
      }

      const data: T = await response.json()
      
      // Cache successful response
      cache.set(cacheKey, { data, timestamp: Date.now() })
      
      logger.info('Kroger API request successful', {
        endpoint,
        attempt,
        cacheKey: cacheKey.substring(0, 50) + '...'
      })

      return data

    } catch (error) {
      lastError = error as Error
      
      if (error instanceof KrogerAPIError && error.statusCode === 429) {
        throw error
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000
        logger.warn('Kroger API request failed, retrying', {
          endpoint,
          attempt,
          error: error instanceof Error ? error.message : String(error),
          delay
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new KrogerAPIError('Request failed after all retries', 500)
}

/**
 * Search for products in Kroger stores
 */
export async function searchProducts(
  query: string,
  locationId?: string,
  limit: number = 20,
  start: number = 0
): Promise<KrogerSearchResponse> {
  const params: Record<string, any> = {
    'filter.term': query,
    'filter.limit': Math.min(limit, 50),
    'filter.start': start
  }

  if (locationId) {
    params['filter.locationId'] = locationId
  }

  return makeRequest<KrogerSearchResponse>('/products', params)
}

/**
 * Get product details by UPC or product ID
 */
export async function getProduct(
  productId: string,
  locationId?: string
): Promise<KrogerProduct | null> {
  try {
    const params: Record<string, any> = {}
    if (locationId) {
      params['filter.locationId'] = locationId
    }

    const response = await makeRequest<{ data: KrogerProduct[] }>(`/products/${productId}`, params)
    return response.data?.[0] || null

  } catch (error) {
    if (error instanceof KrogerAPIError && error.statusCode === 404) {
      return null
    }
    throw error
  }
}

/**
 * Find nearby Kroger stores
 */
export async function findStores(
  zipCode: string,
  radiusInMiles: number = 25,
  limit: number = 10
): Promise<KrogerLocationResponse> {
  const params = {
    'filter.zipCode.near': zipCode,
    'filter.radiusInMiles': radiusInMiles,
    'filter.limit': Math.min(limit, 100)
  }

  return makeRequest<KrogerLocationResponse>('/locations', params)
}

/**
 * Find stores by coordinates
 */
export async function findStoresByCoordinates(
  lat: number,
  lng: number,
  radiusInMiles: number = 25,
  limit: number = 10
): Promise<KrogerLocationResponse> {
  const params = {
    'filter.lat.near': lat,
    'filter.lon.near': lng,
    'filter.radiusInMiles': radiusInMiles,
    'filter.limit': Math.min(limit, 100)
  }

  return makeRequest<KrogerLocationResponse>('/locations', params)
}

/**
 * Get store details by location ID
 */
export async function getStoreDetails(locationId: string): Promise<KrogerStore | null> {
  try {
    const response = await makeRequest<{ data: KrogerStore[] }>(`/locations/${locationId}`)
    return response.data?.[0] || null

  } catch (error) {
    if (error instanceof KrogerAPIError && error.statusCode === 404) {
      return null
    }
    throw error
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  category: string,
  locationId?: string,
  limit: number = 20,
  start: number = 0
): Promise<KrogerSearchResponse> {
  const params: Record<string, any> = {
    'filter.categories': category,
    'filter.limit': Math.min(limit, 50),
    'filter.start': start
  }

  if (locationId) {
    params['filter.locationId'] = locationId
  }

  return makeRequest<KrogerSearchResponse>('/products', params)
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(): { requestsRemaining: number; requestsUsed: number; resetTime: Date } {
  const resetTime = new Date(lastResetTime.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
  
  return {
    requestsRemaining: Math.max(0, RATE_LIMIT - requestCount),
    requestsUsed: requestCount,
    resetTime
  }
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear()
  logger.info('Kroger API cache cleared')
}

/**
 * Clear access token (force refresh)
 */
export function clearToken(): void {
  currentToken = null
  logger.info('Kroger access token cleared')
}

// Export error class
export { KrogerAPIError }