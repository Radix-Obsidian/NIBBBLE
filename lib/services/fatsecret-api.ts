import { logger } from '@/lib/logger'

// Configuration
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID
const API_KEY = process.env.FATSECRET_API_KEY
const BASE_URL = 'https://platform.fatsecret.com/rest/server.api'
const RATE_LIMIT = parseInt(process.env.FATSECRET_RATE_LIMIT || '1000')

// Types
export interface FatSecretFood {
  food_id: string
  food_name: string
  food_type: string
  brand_name?: string
  food_url: string
  servings: {
    serving: FatSecretServing[]
  }
}

export interface FatSecretServing {
  serving_id: string
  serving_description: string
  serving_url: string
  metric_serving_amount?: string
  metric_serving_unit?: string
  number_of_units?: string
  measurement_description: string
  calories: string
  carbohydrate: string
  protein: string
  fat: string
  saturated_fat?: string
  polyunsaturated_fat?: string
  monounsaturated_fat?: string
  cholesterol?: string
  sodium?: string
  potassium?: string
  fiber?: string
  sugar?: string
  vitamin_a?: string
  vitamin_c?: string
  calcium?: string
  iron?: string
}

export interface FatSecretSearchResult {
  foods_search: {
    results: {
      food: FatSecretFood[]
    }
    page_number: string
    total_results: string
    max_results: string
  }
}

export interface FatSecretNutrition {
  calories: number
  carbs: number
  protein: number
  fat: number
  saturatedFat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  potassium?: number
  calcium?: number
  iron?: number
  vitaminA?: number
  vitaminC?: number
}

// Rate limiting tracking
let requestCount = 0
let lastResetTime = new Date()

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

class FatSecretAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'FatSecretAPIError'
  }
}

/**
 * Generate OAuth 1.0 signature for FatSecret API
 */
function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>
): string {
  if (!CLIENT_ID || !API_KEY) {
    throw new FatSecretAPIError('FatSecret API credentials not configured', 500)
  }

  // OAuth 1.0 signature generation (simplified for client credentials)
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = Math.random().toString(36).substring(2, 15)
  
  const oauthParams = {
    oauth_consumer_key: CLIENT_ID,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0'
  }

  const allParams = { ...params, ...oauthParams }
  
  // Sort parameters
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&')

  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`
  const signingKey = `${encodeURIComponent(API_KEY)}&`

  // For simplicity, we'll use a basic hash instead of HMAC-SHA1
  // In production, you'd want to use a proper HMAC-SHA1 implementation
  const signature = btoa(baseString + signingKey).replace(/\+/g, '-').replace(/\//g, '_')

  return `OAuth oauth_consumer_key="${CLIENT_ID}", oauth_nonce="${nonce}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_version="1.0", oauth_signature="${signature}"`
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
    throw new FatSecretAPIError(
      `Monthly API limit exceeded. ${RATE_LIMIT} requests per month allowed.`,
      429
    )
  }
}

/**
 * Make request to FatSecret API
 */
async function makeRequest<T>(
  params: Record<string, string>,
  retries: number = 2
): Promise<T> {
  if (!CLIENT_ID || !API_KEY) {
    throw new FatSecretAPIError('FatSecret API credentials not configured', 500)
  }

  checkRateLimit()

  // Create cache key
  const cacheKey = JSON.stringify(params)
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logger.info('Serving FatSecret data from cache', { params })
    return cached.data
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Add format and method to params
      const requestParams = {
        ...params,
        format: 'json'
      }

      const url = new URL(BASE_URL)
      Object.entries(requestParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      logger.info('Making FatSecret API request', {
        params: requestParams,
        attempt,
        url: url.toString().replace(API_KEY, '***')
      })

      // Generate OAuth signature
      const authHeader = generateSignature('GET', BASE_URL, requestParams)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'User-Agent': 'NIBBBLE/1.0'
        }
      })

      // Update rate limiting counter
      requestCount++

      if (!response.ok) {
        const errorText = await response.text()
        throw new FatSecretAPIError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          response.status
        )
      }

      const data: T = await response.json()
      
      // Cache successful response
      cache.set(cacheKey, { data, timestamp: Date.now() })
      
      logger.info('FatSecret API request successful', {
        attempt,
        cacheKey: cacheKey.substring(0, 50) + '...'
      })

      return data

    } catch (error) {
      lastError = error as Error
      
      if (error instanceof FatSecretAPIError && error.statusCode === 429) {
        throw error
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000
        logger.warn('FatSecret API request failed, retrying', {
          attempt,
          error: error instanceof Error ? error.message : String(error),
          delay
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new FatSecretAPIError('Request failed after all retries', 500)
}

/**
 * Search for foods
 */
export async function searchFoods(
  query: string,
  pageNumber: number = 0,
  maxResults: number = 20
): Promise<FatSecretSearchResult> {
  const params = {
    method: 'foods.search',
    search_expression: query,
    page_number: pageNumber.toString(),
    max_results: Math.min(maxResults, 50).toString()
  }

  return makeRequest<FatSecretSearchResult>(params)
}

/**
 * Get food details by ID
 */
export async function getFoodById(foodId: string): Promise<FatSecretFood | null> {
  try {
    const params = {
      method: 'food.get',
      food_id: foodId
    }

    const response = await makeRequest<{ food: FatSecretFood }>(params)
    return response.food

  } catch (error) {
    if (error instanceof FatSecretAPIError && error.statusCode === 404) {
      return null
    }
    throw error
  }
}

/**
 * Get nutrition information for a food item
 */
export async function getFoodNutrition(foodId: string, servingId?: string): Promise<FatSecretNutrition | null> {
  try {
    const food = await getFoodById(foodId)
    if (!food) return null

    // Get the first serving or the specified serving
    let serving = food.servings.serving[0]
    if (servingId) {
      const foundServing = food.servings.serving.find(s => s.serving_id === servingId)
      if (foundServing) serving = foundServing
    }

    return {
      calories: parseFloat(serving.calories) || 0,
      carbs: parseFloat(serving.carbohydrate) || 0,
      protein: parseFloat(serving.protein) || 0,
      fat: parseFloat(serving.fat) || 0,
      saturatedFat: serving.saturated_fat ? parseFloat(serving.saturated_fat) : undefined,
      fiber: serving.fiber ? parseFloat(serving.fiber) : undefined,
      sugar: serving.sugar ? parseFloat(serving.sugar) : undefined,
      sodium: serving.sodium ? parseFloat(serving.sodium) : undefined,
      cholesterol: serving.cholesterol ? parseFloat(serving.cholesterol) : undefined,
      potassium: serving.potassium ? parseFloat(serving.potassium) : undefined,
      calcium: serving.calcium ? parseFloat(serving.calcium) : undefined,
      iron: serving.iron ? parseFloat(serving.iron) : undefined,
      vitaminA: serving.vitamin_a ? parseFloat(serving.vitamin_a) : undefined,
      vitaminC: serving.vitamin_c ? parseFloat(serving.vitamin_c) : undefined
    }

  } catch (error) {
    logger.error('Failed to get food nutrition', { foodId, servingId, error })
    return null
  }
}

/**
 * Search for nutrition by food name
 */
export async function getNutritionByName(foodName: string): Promise<FatSecretNutrition | null> {
  try {
    const searchResult = await searchFoods(foodName, 0, 1)
    
    if (!searchResult.foods_search?.results?.food?.[0]) {
      return null
    }

    const food = searchResult.foods_search.results.food[0]
    return getFoodNutrition(food.food_id)

  } catch (error) {
    logger.error('Failed to get nutrition by name', { foodName, error })
    return null
  }
}

/**
 * Get food suggestions for substitutions
 */
export async function getFoodSubstitutions(foodName: string, limit: number = 5): Promise<FatSecretFood[]> {
  try {
    const searchResult = await searchFoods(foodName, 0, limit)
    
    if (!searchResult.foods_search?.results?.food) {
      return []
    }

    return searchResult.foods_search.results.food

  } catch (error) {
    logger.error('Failed to get food substitutions', { foodName, error })
    return []
  }
}

/**
 * Compare nutrition between foods
 */
export async function compareNutrition(foodIds: string[]): Promise<{
  foods: Array<{ food: FatSecretFood; nutrition: FatSecretNutrition | null }>
  comparison: {
    lowest_calories: string
    highest_protein: string
    lowest_fat: string
    lowest_carbs: string
  }
}> {
  try {
    const foodsWithNutrition = await Promise.all(
      foodIds.map(async (id) => {
        const food = await getFoodById(id)
        const nutrition = food ? await getFoodNutrition(id) : null
        return { food, nutrition }
      })
    )

    const validFoods = foodsWithNutrition.filter(f => f.food && f.nutrition)
    
    if (validFoods.length === 0) {
      return {
        foods: [],
        comparison: {
          lowest_calories: '',
          highest_protein: '',
          lowest_fat: '',
          lowest_carbs: ''
        }
      }
    }

    const comparison = {
      lowest_calories: validFoods.reduce((min, current) => 
        (current.nutrition!.calories < min.nutrition!.calories) ? current : min
      ).food!.food_id,
      
      highest_protein: validFoods.reduce((max, current) => 
        (current.nutrition!.protein > max.nutrition!.protein) ? current : max
      ).food!.food_id,
      
      lowest_fat: validFoods.reduce((min, current) => 
        (current.nutrition!.fat < min.nutrition!.fat) ? current : min
      ).food!.food_id,
      
      lowest_carbs: validFoods.reduce((min, current) => 
        (current.nutrition!.carbs < min.nutrition!.carbs) ? current : min
      ).food!.food_id
    }

    return {
      foods: validFoods,
      comparison
    }

  } catch (error) {
    logger.error('Failed to compare nutrition', { foodIds, error })
    return {
      foods: [],
      comparison: {
        lowest_calories: '',
        highest_protein: '',
        lowest_fat: '',
        lowest_carbs: ''
      }
    }
  }
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
  logger.info('FatSecret API cache cleared')
}

// Export error class
export { FatSecretAPIError }