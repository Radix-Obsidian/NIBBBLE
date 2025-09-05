import { logger } from '@/lib/logger'

// Configuration
const APP_ID = process.env.EDAMAM_APP_ID
const APP_KEY = process.env.EDAMAM_APP_KEY
const BASE_URL = 'https://api.edamam.com/api'
const RATE_LIMIT = parseInt(process.env.EDAMAM_RATE_LIMIT || '5000')

// Types
export interface EdamamNutritionAnalysis {
  uri: string
  calories: number
  totalWeight: number
  dietLabels: string[]
  healthLabels: string[]
  cautions: string[]
  totalNutrients: Record<string, {
    label: string
    quantity: number
    unit: string
  }>
  totalDaily: Record<string, {
    label: string
    quantity: number
    unit: string
  }>
  ingredients: Array<{
    text: string
    parsed: Array<{
      quantity: number
      measure: string
      foodMatch: string
      food: string
      foodId: string
      weight: number
      retainedWeight: number
      nutrients: Record<string, {
        label: string
        quantity: number
        unit: string
      }>
      measureURI: string
      status: string
    }>
  }>
}

export interface EdamamFoodSearchResult {
  text: string
  parsed: Array<{
    food: {
      foodId: string
      label: string
      knownAs: string
      nutrients: Record<string, number>
      category: string
      categoryLabel: string
      image?: string
    }
    measure: {
      uri: string
      label: string
      weight: number
    }
  }>
  hints: Array<{
    food: {
      foodId: string
      label: string
      knownAs: string
      nutrients: Record<string, number>
      category: string
      categoryLabel: string
      image?: string
    }
    measures: Array<{
      uri: string
      label: string
      weight: number
    }>
  }>
}

export interface EdamamDietaryRestrictions {
  balanced?: boolean
  highFiber?: boolean
  highProtein?: boolean
  lowCarb?: boolean
  lowFat?: boolean
  lowSodium?: boolean
}

export interface EdamamHealthLabels {
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  dairyFree?: boolean
  eggFree?: boolean
  fishFree?: boolean
  shellFishFree?: boolean
  treeNutFree?: boolean
  soyFree?: boolean
  wheatFree?: boolean
}

// Rate limiting tracking
let requestCount = 0
let lastResetTime = new Date()

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

class EdamamAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'EdamamAPIError'
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
    throw new EdamamAPIError(
      `Monthly API limit exceeded. ${RATE_LIMIT} requests per month allowed.`,
      429
    )
  }
}

/**
 * Make request to Edamam API
 */
async function makeRequest<T>(
  endpoint: string,
  params: Record<string, any> = {},
  method: string = 'GET',
  body?: any,
  retries: number = 2
): Promise<T> {
  if (!APP_ID || !APP_KEY) {
    throw new EdamamAPIError('Edamam API credentials not configured', 500)
  }

  checkRateLimit()

  // Create cache key
  const cacheKey = `${endpoint}:${JSON.stringify(params)}:${JSON.stringify(body)}`
  
  // Check cache first for GET requests
  if (method === 'GET') {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info('Serving Edamam data from cache', { endpoint, params })
      return cached.data
    }
  }

  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.append('app_id', APP_ID)
  url.searchParams.append('app_key', APP_KEY)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v.toString()))
      } else {
        url.searchParams.append(key, value.toString())
      }
    }
  })

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info('Making Edamam API request', {
        endpoint,
        params,
        method,
        attempt,
        url: url.toString().replace(APP_KEY, '***')
      })

      const requestOptions: RequestInit = {
        method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NIBBBLE/1.0'
        }
      }

      if (body && method === 'POST') {
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/json'
        }
        requestOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url.toString(), requestOptions)

      // Update rate limiting counter
      requestCount++

      if (!response.ok) {
        const errorText = await response.text()
        throw new EdamamAPIError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          response.status
        )
      }

      const data: T = await response.json()
      
      // Cache successful GET responses
      if (method === 'GET') {
        cache.set(cacheKey, { data, timestamp: Date.now() })
      }
      
      logger.info('Edamam API request successful', {
        endpoint,
        attempt,
        method,
        cacheKey: method === 'GET' ? cacheKey.substring(0, 50) + '...' : 'N/A'
      })

      return data

    } catch (error) {
      lastError = error as Error
      
      if (error instanceof EdamamAPIError && error.statusCode === 429) {
        throw error
      }

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000
        logger.warn('Edamam API request failed, retrying', {
          endpoint,
          attempt,
          error: error instanceof Error ? error.message : String(error),
          delay
        })
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new EdamamAPIError('Request failed after all retries', 500)
}

/**
 * Analyze nutrition for a list of ingredients
 */
export async function analyzeNutrition(ingredients: string[]): Promise<EdamamNutritionAnalysis> {
  const body = {
    ingr: ingredients
  }

  return makeRequest<EdamamNutritionAnalysis>('/nutrition-details', {}, 'POST', body)
}

/**
 * Search for food items
 */
export async function searchFood(
  query: string,
  category?: string,
  limit: number = 20
): Promise<EdamamFoodSearchResult> {
  const params: Record<string, any> = {
    ingr: query,
    'nutrition-type': 'cooking'
  }

  if (category) {
    params.category = category
  }

  return makeRequest<EdamamFoodSearchResult>('/food-database/v2/parser', params)
}

/**
 * Get detailed food information by food ID
 */
export async function getFoodDetails(foodId: string): Promise<any> {
  const params = {
    'nutrition-type': 'cooking'
  }

  return makeRequest<any>(`/food-database/v2/nutrients/${foodId}`, params)
}

/**
 * Analyze ingredient for dietary restrictions and health labels
 */
export async function analyzeIngredient(ingredient: string): Promise<{
  dietLabels: string[]
  healthLabels: string[]
  cautions: string[]
  calories: number
  nutrients: Record<string, any>
}> {
  try {
    const analysis = await analyzeNutrition([ingredient])
    
    return {
      dietLabels: analysis.dietLabels,
      healthLabels: analysis.healthLabels,
      cautions: analysis.cautions,
      calories: analysis.calories,
      nutrients: analysis.totalNutrients
    }

  } catch (error) {
    logger.error('Failed to analyze ingredient', { ingredient, error })
    
    // Return default analysis if API fails
    return {
      dietLabels: [],
      healthLabels: [],
      cautions: [],
      calories: 0,
      nutrients: {}
    }
  }
}

/**
 * Check if ingredients meet dietary restrictions
 */
export async function checkDietaryRestrictions(
  ingredients: string[],
  restrictions: EdamamDietaryRestrictions
): Promise<{
  compatible: boolean
  incompatibleIngredients: string[]
  suggestions: string[]
}> {
  try {
    const analysis = await analyzeNutrition(ingredients)
    
    const requiredLabels: string[] = []
    if (restrictions.balanced) requiredLabels.push('Balanced')
    if (restrictions.highFiber) requiredLabels.push('High-Fiber')
    if (restrictions.highProtein) requiredLabels.push('High-Protein')
    if (restrictions.lowCarb) requiredLabels.push('Low-Carb')
    if (restrictions.lowFat) requiredLabels.push('Low-Fat')
    if (restrictions.lowSodium) requiredLabels.push('Low-Sodium')

    const compatible = requiredLabels.every(label => 
      analysis.dietLabels.includes(label)
    )

    return {
      compatible,
      incompatibleIngredients: compatible ? [] : ingredients,
      suggestions: compatible ? [] : ['Consider reducing portions', 'Add more vegetables']
    }

  } catch (error) {
    logger.error('Failed to check dietary restrictions', { ingredients, restrictions, error })
    
    return {
      compatible: true,
      incompatibleIngredients: [],
      suggestions: []
    }
  }
}

/**
 * Check if ingredients meet health requirements
 */
export async function checkHealthLabels(
  ingredients: string[],
  healthLabels: EdamamHealthLabels
): Promise<{
  compatible: boolean
  violations: string[]
  warnings: string[]
}> {
  try {
    const analysis = await analyzeNutrition(ingredients)
    
    const requiredLabels: string[] = []
    if (healthLabels.vegetarian) requiredLabels.push('Vegetarian')
    if (healthLabels.vegan) requiredLabels.push('Vegan')
    if (healthLabels.glutenFree) requiredLabels.push('Gluten-Free')
    if (healthLabels.dairyFree) requiredLabels.push('Dairy-Free')
    if (healthLabels.eggFree) requiredLabels.push('Egg-Free')
    if (healthLabels.fishFree) requiredLabels.push('Fish-Free')
    if (healthLabels.shellFishFree) requiredLabels.push('Shellfish-Free')
    if (healthLabels.treeNutFree) requiredLabels.push('Tree-Nut-Free')
    if (healthLabels.soyFree) requiredLabels.push('Soy-Free')
    if (healthLabels.wheatFree) requiredLabels.push('Wheat-Free')

    const violations = requiredLabels.filter(label => 
      !analysis.healthLabels.includes(label)
    )

    return {
      compatible: violations.length === 0,
      violations,
      warnings: analysis.cautions
    }

  } catch (error) {
    logger.error('Failed to check health labels', { ingredients, healthLabels, error })
    
    return {
      compatible: true,
      violations: [],
      warnings: []
    }
  }
}

/**
 * Get nutrient breakdown for ingredients
 */
export async function getNutrientBreakdown(ingredients: string[]): Promise<{
  perServing: Record<string, { quantity: number; unit: string; label: string }>
  dailyValues: Record<string, { quantity: number; unit: string; label: string }>
  totalCalories: number
  totalWeight: number
}> {
  try {
    const analysis = await analyzeNutrition(ingredients)
    
    return {
      perServing: analysis.totalNutrients,
      dailyValues: analysis.totalDaily,
      totalCalories: analysis.calories,
      totalWeight: analysis.totalWeight
    }

  } catch (error) {
    logger.error('Failed to get nutrient breakdown', { ingredients, error })
    
    return {
      perServing: {},
      dailyValues: {},
      totalCalories: 0,
      totalWeight: 0
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
  logger.info('Edamam API cache cleared')
}

// Export error class
export { EdamamAPIError }