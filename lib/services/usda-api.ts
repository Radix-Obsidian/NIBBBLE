import { logger } from '@/lib/logger'

// Configuration
const API_KEY = process.env.USDA_FOODDATA_API_KEY || 'DEMO_KEY'
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1'
const RATE_LIMIT = parseInt(process.env.USDA_RATE_LIMIT || '1000')

// Types
export interface USDAFood {
  fdcId: number
  description: string
  dataType: string
  brandOwner?: string
  ingredients?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients: Array<{
    nutrientId: number
    nutrientName: string
    nutrientNumber: string
    unitName: string
    value: number
  }>
}

export interface USDASearchResult {
  foods: Array<{
    fdcId: number
    description: string
    dataType: string
    brandOwner?: string
    ingredients?: string
    score: number
  }>
  totalPages: number
  currentPage: number
  totalHits: number
}

export interface USDANutrientInfo {
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
  calcium?: number
  iron?: number
  vitaminC?: number
  vitaminA?: number
}

// Rate limiting tracking
let requestCount = 0
let lastResetTime = new Date()

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

class USDAAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'USDAAPIError'
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
    throw new USDAAPIError(
      `Monthly API limit exceeded. ${RATE_LIMIT} requests per month allowed.`,
      429
    )
  }
}

/**
 * Make request to USDA API
 */
async function makeRequest<T>(
  endpoint: string,
  params: Record<string, any> = {},
  retries: number = 2
): Promise<T> {
  if (API_KEY === 'DEMO_KEY') {
    logger.warn('Using DEMO_KEY for USDA API - limited functionality')
  }

  checkRateLimit()

  // Create cache key
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    logger.info('Serving USDA data from cache', { endpoint, params })
    return cached.data
  }

  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.append('api_key', API_KEY)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString())
    }
  })

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info('Making USDA API request', {
        endpoint,
        params,
        attempt,
        url: url.toString().replace(API_KEY, '***')
      })

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NIBBBLE/1.0'
        }
      })

      // Update rate limiting counter
      requestCount++

      if (!response.ok) {
        const errorText = await response.text()
        throw new USDAAPIError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          response.status
        )
      }

      const data: T = await response.json()
      
      // Cache successful response
      cache.set(cacheKey, { data, timestamp: Date.now() })
      
      logger.info('USDA API request successful', {
        endpoint,
        attempt,
        cacheKey: cacheKey.substring(0, 50) + '...'
      })

      return data

    } catch (error) {
      lastError = error as Error
      
      if (error instanceof USDAAPIError && error.statusCode === 429) {
        throw error
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000
        logger.warn('USDA API request failed, retrying', {
          endpoint,
          attempt,
          error: error instanceof Error ? error.message : String(error),
          delay
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new USDAAPIError('Request failed after all retries', 500)
}

/**
 * Search for foods in USDA database
 */
export async function searchFoods(
  query: string,
  dataType?: string[],
  pageSize: number = 25,
  pageNumber: number = 1,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<USDASearchResult> {
  const params: Record<string, any> = {
    query: query,
    pageSize: Math.min(pageSize, 200),
    pageNumber: pageNumber
  }

  if (dataType && dataType.length > 0) {
    params.dataType = dataType.join(',')
  }

  if (sortBy) {
    params.sortBy = sortBy
    if (sortOrder) {
      params.sortOrder = sortOrder
    }
  }

  return makeRequest<USDASearchResult>('/foods/search', params)
}

/**
 * Get food details by FDC ID
 */
export async function getFoodById(fdcId: number): Promise<USDAFood | null> {
  try {
    return await makeRequest<USDAFood>(`/food/${fdcId}`)
  } catch (error) {
    if (error instanceof USDAAPIError && error.statusCode === 404) {
      return null
    }
    throw error
  }
}

/**
 * Get multiple foods by FDC IDs
 */
export async function getFoodsByIds(fdcIds: number[]): Promise<USDAFood[]> {
  if (fdcIds.length === 0) return []

  return makeRequest<USDAFood[]>('/foods', {}, 0, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fdcIds })
  })
}

/**
 * Search for nutrition information by food name
 */
export async function getNutritionByName(foodName: string): Promise<USDANutrientInfo | null> {
  try {
    const searchResult = await searchFoods(foodName, ['Foundation', 'SR Legacy'], 1)
    
    if (!searchResult.foods || searchResult.foods.length === 0) {
      return null
    }

    const food = await getFoodById(searchResult.foods[0].fdcId)
    if (!food) return null

    return extractNutrientInfo(food)

  } catch (error) {
    logger.error('Failed to get nutrition by name', { foodName, error })
    return null
  }
}

/**
 * Extract key nutrient information from USDA food data
 */
export function extractNutrientInfo(food: USDAFood): USDANutrientInfo {
  const nutrients: USDANutrientInfo = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0
  }

  food.foodNutrients.forEach(nutrient => {
    const name = nutrient.nutrientName.toLowerCase()
    const value = nutrient.value

    switch (name) {
      case 'energy':
        nutrients.calories = value
        break
      case 'protein':
        nutrients.protein = value
        break
      case 'total lipid (fat)':
        nutrients.fat = value
        break
      case 'carbohydrate, by difference':
        nutrients.carbs = value
        break
      case 'fiber, total dietary':
        nutrients.fiber = value
        break
      case 'sugars, total including nlea':
        nutrients.sugar = value
        break
      case 'sodium, na':
        nutrients.sodium = value
        break
      case 'cholesterol':
        nutrients.cholesterol = value
        break
      case 'calcium, ca':
        nutrients.calcium = value
        break
      case 'iron, fe':
        nutrients.iron = value
        break
      case 'vitamin c, total ascorbic acid':
        nutrients.vitaminC = value
        break
      case 'vitamin a, iu':
        nutrients.vitaminA = value
        break
    }
  })

  return nutrients
}

/**
 * Get foods by category
 */
export async function getFoodsByCategory(
  category: string,
  pageSize: number = 25,
  pageNumber: number = 1
): Promise<USDASearchResult> {
  // USDA doesn't have explicit categories, so we search by keywords
  const categoryKeywords: Record<string, string> = {
    'vegetables': 'vegetables OR vegetable',
    'fruits': 'fruits OR fruit',
    'meat': 'meat OR beef OR pork OR chicken',
    'dairy': 'milk OR cheese OR yogurt OR dairy',
    'grains': 'bread OR rice OR pasta OR grain',
    'seafood': 'fish OR seafood OR salmon OR tuna',
    'nuts': 'nuts OR almonds OR walnuts',
    'spices': 'spices OR herbs OR seasoning'
  }

  const searchQuery = categoryKeywords[category.toLowerCase()] || category
  return searchFoods(searchQuery, ['Foundation', 'SR Legacy'], pageSize, pageNumber)
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
  logger.info('USDA API cache cleared')
}

// Export error class
export { USDAAPIError }