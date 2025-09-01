import { 
  SpoonacularSearchResponse, 
  SpoonacularRecipeDetails, 
  SpoonacularSearchParams,
  SpoonacularErrorResponse,
  SpoonacularRateLimit 
} from '@/types/spoonacular'
import { logger } from '@/lib/logger'

// Configuration
const API_KEY = process.env.SPOONACULAR_API_KEY
const BASE_URL = process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com/recipes'
const RATE_LIMIT = parseInt(process.env.SPOONACULAR_RATE_LIMIT || '5000')
const REQUESTS_PER_DAY = parseInt(process.env.SPOONACULAR_REQUESTS_PER_DAY || '150')

// Rate limiting tracking
let requestCount = 0
let lastResetTime = new Date()
let requestsToday = 0
let lastDayReset = new Date()

// Cache for API responses (in-memory cache for development)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

class SpoonacularAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: number
  ) {
    super(message)
    this.name = 'SpoonacularAPIError'
  }
}

/**
 * Check rate limits and throw error if exceeded
 */
function checkRateLimit(): void {
  const now = new Date()
  
  // Reset daily counter if it's a new day
  if (now.getDate() !== lastDayReset.getDate()) {
    requestsToday = 0
    lastDayReset = now
  }
  
  // Check daily limit
  if (requestsToday >= REQUESTS_PER_DAY) {
    throw new SpoonacularAPIError(
      `Daily API limit exceeded. ${REQUESTS_PER_DAY} requests per day allowed.`,
      429
    )
  }
  
  // Check monthly limit
  if (requestCount >= RATE_LIMIT) {
    throw new SpoonacularAPIError(
      `Monthly API limit exceeded. ${RATE_LIMIT} requests per month allowed.`,
      429
    )
  }
}

/**
 * Make HTTP request to Spoonacular API with error handling and retry logic
 */
async function makeRequest<T>(
  endpoint: string, 
  params: Record<string, any> = {},
  retries: number = 3
): Promise<T> {
  if (!API_KEY) {
    throw new SpoonacularAPIError('Spoonacular API key not configured', 500)
  }

  checkRateLimit()

  // Create cache key
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logger.info('Serving from cache', { endpoint, params })
    return cached.data
  }

  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.append('apiKey', API_KEY)
  
  // Add parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString())
    }
  })

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info('Making Spoonacular API request', { 
        endpoint, 
        params, 
        attempt,
        url: url.toString().replace(API_KEY, '***')
      })

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PantryPals/1.0'
        }
      })

      // Update rate limiting counters
      requestCount++
      requestsToday++

      if (!response.ok) {
        const errorData: SpoonacularErrorResponse = await response.json().catch(() => ({
          status: 'error',
          code: response.status,
          message: response.statusText
        }))

        if (response.status === 429) {
          // Rate limit exceeded
          const resetTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          throw new SpoonacularAPIError(
            `Rate limit exceeded. Reset time: ${resetTime.toISOString()}`,
            429,
            errorData.code
          )
        }

        throw new SpoonacularAPIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        )
      }

      const data: T = await response.json()
      
      // Cache successful response
      cache.set(cacheKey, { data, timestamp: Date.now() })
      
      logger.info('Spoonacular API request successful', { 
        endpoint, 
        attempt,
        cacheKey: cacheKey.substring(0, 50) + '...'
      })

      return data

    } catch (error) {
      lastError = error as Error
      
      if (error instanceof SpoonacularAPIError && error.statusCode === 429) {
        // Don't retry rate limit errors
        throw error
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        logger.warn('Spoonacular API request failed, retrying', { 
          endpoint, 
          attempt, 
          error: error instanceof Error ? error.message : String(error),
          delay 
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new SpoonacularAPIError('Request failed after all retries', 500)
}

/**
 * Search for recipes with various filters
 */
export async function searchRecipes(params: SpoonacularSearchParams = {}): Promise<SpoonacularSearchResponse> {
  const searchParams = {
    number: Math.min(params.number || 20, 100), // Max 100 results per request
    offset: params.offset || 0,
    addRecipeInformation: true,
    fillIngredients: true,
    ...params
  }

  return makeRequest<SpoonacularSearchResponse>('/complexSearch', searchParams)
}

/**
 * Get detailed recipe information by ID
 */
export async function getRecipeDetails(id: number): Promise<SpoonacularRecipeDetails> {
  const params = {
    includeNutrition: true,
    addRecipeInformation: true,
    fillIngredients: true
  }

  return makeRequest<SpoonacularRecipeDetails>(`/${id}/information`, params)
}

/**
 * Get multiple recipe details by IDs
 */
export async function getMultipleRecipeDetails(ids: number[]): Promise<SpoonacularRecipeDetails[]> {
  if (ids.length === 0) return []
  
  // Spoonacular allows up to 100 IDs per request
  const batchSize = 100
  const results: SpoonacularRecipeDetails[] = []
  
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const params = {
      ids: batch.join(','),
      includeNutrition: true,
      addRecipeInformation: true,
      fillIngredients: true
    }
    
    const batchResults = await makeRequest<{ [key: string]: SpoonacularRecipeDetails }>('/informationBulk', params)
    results.push(...Object.values(batchResults))
  }
  
  return results
}

/**
 * Get random recipes
 */
export async function getRandomRecipes(
  number: number = 10,
  tags?: string[]
): Promise<{ recipes: SpoonacularRecipeDetails[] }> {
  const params: Record<string, any> = {
    number: Math.min(number, 100),
    includeNutrition: true,
    addRecipeInformation: true,
    fillIngredients: true
  }
  
  if (tags && tags.length > 0) {
    params.tags = tags.join(',')
  }
  
  return makeRequest<{ recipes: SpoonacularRecipeDetails[] }>('/random', params)
}

/**
 * Get recipe by ingredients (what can I make with these ingredients?)
 */
export async function getRecipesByIngredients(
  ingredients: string[],
  number: number = 10,
  ranking: number = 1
): Promise<SpoonacularRecipeDetails[]> {
  const params = {
    ingredients: ingredients.join(','),
    number: Math.min(number, 100),
    ranking,
    ignorePantry: true,
    includeNutrition: true,
    addRecipeInformation: true,
    fillIngredients: true
  }
  
  return makeRequest<SpoonacularRecipeDetails[]>('/findByIngredients', params)
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): SpoonacularRateLimit {
  const now = new Date()
  const resetTime = new Date(lastResetTime.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
  
  return {
    requestsRemaining: Math.max(0, RATE_LIMIT - requestCount),
    requestsUsed: requestCount,
    resetTime
  }
}

/**
 * Clear cache (useful for testing or when you need fresh data)
 */
export function clearCache(): void {
  cache.clear()
  logger.info('Spoonacular API cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  }
}

// Export error class for external use
export { SpoonacularAPIError }
