import { logger } from '@/lib/logger'

// Import all food API services
import * as KrogerAPI from './kroger-api'
import * as USDAAPI from './usda-api'
import * as EdamamAPI from './edamam-api'
import * as FatSecretAPI from './fatsecret-api'
import * as SpoonacularAPI from './spoonacular-api'

// Types
export interface EnhancedProduct {
  // Kroger data
  kroger?: {
    productId: string
    upc: string
    name: string
    description?: string
    brand?: string
    price?: {
      regular: number
      promo: number
    }
    inStock: boolean
    storeAvailability: string[]
    images: Array<{
      size: string
      url: string
    }>
  }
  
  // Nutrition data (from multiple sources)
  nutrition: {
    primary: NutritionSource
    usda?: USDAAPI.USDANutrientInfo
    edamam?: any
    fatsecret?: FatSecretAPI.FatSecretNutrition
    calories: number
    protein: number
    fat: number
    carbs: number
    fiber?: number
    sugar?: number
    sodium?: number
  }
  
  // Health and dietary information
  health: {
    dietLabels: string[]
    healthLabels: string[]
    cautions: string[]
    allergens: string[]
  }
  
  // AI-enhanced data
  intelligence: {
    category: string
    subcategory: string
    seasonality?: {
      peak: string[]
      available: string[]
    }
    substitutions: Array<{
      name: string
      reason: string
      nutritionDiff: string
    }>
    recommendations: {
      pairings: string[]
      cookingMethods: string[]
      storageAdvice: string
    }
  }
  
  // Aggregated data
  id: string
  name: string
  brand?: string
  category: string
  averagePrice?: number
  confidence: number // 0-1 rating of data quality
  lastUpdated: Date
}

export interface StoreWithAvailability extends KrogerAPI.KrogerStore {
  products?: {
    available: number
    outOfStock: number
    totalRequested: number
  }
  estimatedTime?: {
    curbside: string
    delivery: string
  }
  fees?: {
    delivery: number
    pickup: number
  }
}

export interface ShoppingListItem {
  ingredient: string
  quantity: number
  unit: string
  priority: number
  substitutions: string[]
  stores: Array<{
    storeId: string
    available: boolean
    price: number
    estimatedTime: string
  }>
}

export interface SmartShoppingList {
  items: ShoppingListItem[]
  recommendations: {
    preferredStore: string
    alternativeStores: string[]
    estimatedTotal: number
    estimatedTime: string
    moneySavingTips: string[]
  }
  optimization: {
    route: string[]
    groupedItems: Record<string, string[]>
    bulkOpportunities: string[]
  }
}

type NutritionSource = 'usda' | 'edamam' | 'fatsecret' | 'spoonacular' | 'kroger' | 'fallback'

// Cache for enhanced products
const productCache = new Map<string, { data: EnhancedProduct; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

class EnhancedGroceryError extends Error {
  constructor(
    message: string,
    public code: string,
    public source?: string
  ) {
    super(message)
    this.name = 'EnhancedGroceryError'
  }
}

/**
 * Search for enhanced products combining Kroger with nutrition data
 */
export async function searchEnhancedProducts(
  query: string,
  locationId?: string,
  filters?: {
    category?: string
    maxPrice?: number
    organic?: boolean
    dietaryRestrictions?: string[]
    healthLabels?: string[]
  },
  limit: number = 20
): Promise<EnhancedProduct[]> {
  try {
    logger.info('Searching enhanced products', { query, locationId, filters, limit })

    // Search Kroger products first
    const krogerResults = await KrogerAPI.searchProducts(query, locationId, limit)
    
    // Enhance each product with nutrition and intelligence data
    const enhancedProducts = await Promise.all(
      krogerResults.data.map(async (krogerProduct) => {
        return await enhanceProduct(krogerProduct, query)
      })
    )

    // Apply filters
    let filteredProducts = enhancedProducts

    if (filters) {
      filteredProducts = filteredProducts.filter(product => {
        // Category filter
        if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) {
          return false
        }

        // Price filter
        if (filters.maxPrice && product.kroger?.price && product.kroger.price.regular > filters.maxPrice) {
          return false
        }

        // Organic filter
        if (filters.organic && !product.health.healthLabels.includes('Organic')) {
          return false
        }

        // Dietary restrictions
        if (filters.dietaryRestrictions) {
          const hasAllRestrictions = filters.dietaryRestrictions.every(restriction =>
            product.health.dietLabels.includes(restriction) || 
            product.health.healthLabels.includes(restriction)
          )
          if (!hasAllRestrictions) return false
        }

        // Health labels
        if (filters.healthLabels) {
          const hasAllLabels = filters.healthLabels.every(label =>
            product.health.healthLabels.includes(label)
          )
          if (!hasAllLabels) return false
        }

        return true
      })
    }

    // Sort by confidence and relevance
    filteredProducts.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence
      }
      return a.name.localeCompare(b.name)
    })

    logger.info('Enhanced product search completed', {
      query,
      krogerResults: krogerResults.data.length,
      enhancedResults: enhancedProducts.length,
      filteredResults: filteredProducts.length
    })

    return filteredProducts

  } catch (error) {
    logger.error('Enhanced product search failed', { query, error })
    
    // Fallback to simulated data
    return generateFallbackProducts(query, limit)
  }
}

/**
 * Enhance a Kroger product with nutrition and intelligence data
 */
async function enhanceProduct(
  krogerProduct: KrogerAPI.KrogerProduct,
  originalQuery?: string
): Promise<EnhancedProduct> {
  const cacheKey = `enhanced_${krogerProduct.productId}`
  
  // Check cache first
  const cached = productCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const productName = krogerProduct.name || originalQuery || 'unknown'
    
    logger.info('Enhancing product with nutrition and intelligence data', {
      productId: krogerProduct.productId,
      name: productName
    })

    // Gather nutrition data from multiple sources in parallel
    const [usdaNutrition, edamamData, fatSecretData] = await Promise.all([
      USDAAPI.getNutritionByName(productName).catch(() => null),
      EdamamAPI.analyzeIngredient(productName).catch(() => null),
      FatSecretAPI.getNutritionByName(productName).catch(() => null)
    ])

    // Get Spoonacular data for substitutions and recommendations
    const spoonacularData = await SpoonacularAPI.searchRecipes({ query: productName, number: 1 })
      .catch(() => null)

    // Determine primary nutrition source and aggregate data
    const nutritionData = aggregateNutritionData({
      usda: usdaNutrition,
      edamam: edamamData,
      fatsecret: fatSecretData
    })

    // Generate AI intelligence
    const intelligence = await generateProductIntelligence(productName, nutritionData)

    // Extract health and dietary information
    const healthData = {
      dietLabels: edamamData?.dietLabels || [],
      healthLabels: edamamData?.healthLabels || [],
      cautions: edamamData?.cautions || [],
      allergens: extractAllergens(krogerProduct, edamamData)
    }

    const enhanced: EnhancedProduct = {
      id: krogerProduct.productId,
      name: krogerProduct.name,
      brand: krogerProduct.brand,
      category: determineCategoryFromKroger(krogerProduct),
      averagePrice: krogerProduct.items?.[0]?.price?.regular,
      confidence: calculateConfidence(usdaNutrition, edamamData, fatSecretData),
      lastUpdated: new Date(),
      
      kroger: {
        productId: krogerProduct.productId,
        upc: krogerProduct.upc,
        name: krogerProduct.name,
        description: krogerProduct.description,
        brand: krogerProduct.brand,
        price: krogerProduct.items?.[0]?.price,
        inStock: krogerProduct.items?.[0]?.fulfillment?.inStore || false,
        storeAvailability: [], // Would be populated with store-specific data
        images: krogerProduct.images?.map(img => ({
          size: img.sizes?.[0]?.size || 'medium',
          url: img.sizes?.[0]?.url || ''
        })) || []
      },
      
      nutrition: {
        primary: determinePrimaryNutritionSource(usdaNutrition, edamamData, fatSecretData),
        usda: usdaNutrition || undefined,
        edamam: edamamData,
        fatsecret: fatSecretData || undefined,
        ...nutritionData
      },
      
      health: healthData,
      intelligence
    }

    // Cache the enhanced product
    productCache.set(cacheKey, { data: enhanced, timestamp: Date.now() })

    return enhanced

  } catch (error) {
    logger.error('Failed to enhance product', {
      productId: krogerProduct.productId,
      name: krogerProduct.name,
      error
    })

    // Return basic enhanced product on error
    return createFallbackEnhancedProduct(krogerProduct)
  }
}

/**
 * Aggregate nutrition data from multiple sources
 */
function aggregateNutritionData(sources: {
  usda: USDAAPI.USDANutrientInfo | null
  edamam: any
  fatsecret: FatSecretAPI.FatSecretNutrition | null
}): Pick<EnhancedProduct['nutrition'], 'calories' | 'protein' | 'fat' | 'carbs' | 'fiber' | 'sugar' | 'sodium'> {
  // Priority: USDA > FatSecret > Edamam
  const primary = sources.usda || sources.fatsecret || sources.edamam

  return {
    calories: primary?.calories || 0,
    protein: primary?.protein || 0,
    fat: primary?.fat || 0,
    carbs: primary?.carbs || primary?.carbohydrate || 0,
    fiber: primary?.fiber,
    sugar: primary?.sugar,
    sodium: primary?.sodium
  }
}

/**
 * Determine the primary nutrition data source
 */
function determinePrimaryNutritionSource(
  usda: USDAAPI.USDANutrientInfo | null,
  edamam: any,
  fatsecret: FatSecretAPI.FatSecretNutrition | null
): NutritionSource {
  if (usda) return 'usda'
  if (fatsecret) return 'fatsecret'
  if (edamam) return 'edamam'
  return 'fallback'
}

/**
 * Calculate confidence score based on available data
 */
function calculateConfidence(
  usda: USDAAPI.USDANutrientInfo | null,
  edamam: any,
  fatsecret: FatSecretAPI.FatSecretNutrition | null
): number {
  let score = 0.3 // Base score for having Kroger data
  
  if (usda) score += 0.3
  if (edamam) score += 0.2
  if (fatsecret) score += 0.2
  
  return Math.min(score, 1.0)
}

/**
 * Generate AI-powered product intelligence
 */
async function generateProductIntelligence(
  productName: string,
  nutrition: any
): Promise<EnhancedProduct['intelligence']> {
  // This would typically call your AI service
  // For now, we'll use rule-based intelligence
  
  const category = categorizeProduct(productName)
  const substitutions = await generateSubstitutions(productName, category)
  
  return {
    category: category.main,
    subcategory: category.sub,
    seasonality: getSeasonality(productName),
    substitutions,
    recommendations: {
      pairings: generatePairings(productName, category.main),
      cookingMethods: generateCookingMethods(category.main),
      storageAdvice: generateStorageAdvice(category.main)
    }
  }
}

/**
 * Generate smart shopping list from ingredients
 */
export async function generateSmartShoppingList(
  ingredients: string[],
  location: { latitude?: number; longitude?: number; zipCode?: string } = {},
  preferences: {
    budget?: number
    dietary?: string[]
    preferredStores?: string[]
    deliveryPreference?: 'pickup' | 'delivery' | 'instore'
  } = {}
): Promise<SmartShoppingList> {
  try {
    logger.info('Generating smart shopping list', { ingredients, location, preferences })

    // Find nearby stores
    let stores: KrogerAPI.KrogerStore[] = []
    if (location.zipCode) {
      const storeResponse = await KrogerAPI.findStores(location.zipCode)
      stores = storeResponse.data
    } else if (location.latitude && location.longitude) {
      const storeResponse = await KrogerAPI.findStoresByCoordinates(location.latitude, location.longitude)
      stores = storeResponse.data
    }

    // Search for each ingredient across stores
    const shoppingItems: ShoppingListItem[] = await Promise.all(
      ingredients.map(async (ingredient, index) => {
        const enhancedProducts = await searchEnhancedProducts(ingredient, stores[0]?.locationId, undefined, 3)
        const substitutions = enhancedProducts.slice(1).map(p => p.name)

        const storeAvailability = await Promise.all(
          stores.slice(0, 3).map(async (store) => {
            const storeProducts = await KrogerAPI.searchProducts(ingredient, store.locationId, 1)
            const available = storeProducts.data.length > 0
            const price = storeProducts.data[0]?.items?.[0]?.price?.regular || 0

            return {
              storeId: store.locationId,
              available,
              price,
              estimatedTime: available ? '2 hours' : 'N/A'
            }
          })
        )

        return {
          ingredient,
          quantity: 1,
          unit: 'item',
          priority: index + 1,
          substitutions,
          stores: storeAvailability
        }
      })
    )

    // Generate recommendations
    const recommendations = generateShoppingRecommendations(shoppingItems, stores, preferences)
    
    // Generate route optimization
    const optimization = generateShoppingOptimization(shoppingItems, stores)

    return {
      items: shoppingItems,
      recommendations,
      optimization
    }

  } catch (error) {
    logger.error('Failed to generate smart shopping list', { ingredients, error })
    throw new EnhancedGroceryError('Failed to generate shopping list', 'GENERATION_FAILED')
  }
}

/**
 * Get detailed store information with product availability
 */
export async function getStoreWithAvailability(
  storeId: string,
  productIds: string[] = []
): Promise<StoreWithAvailability | null> {
  try {
    const store = await KrogerAPI.getStoreDetails(storeId)
    if (!store) return null

    const enhanced: StoreWithAvailability = {
      ...store,
      estimatedTime: {
        curbside: '2 hours',
        delivery: '4 hours'
      },
      fees: {
        delivery: 5.99,
        pickup: 0
      }
    }

    if (productIds.length > 0) {
      const availability = await Promise.all(
        productIds.map(async (id) => {
          try {
            const product = await KrogerAPI.getProduct(id, storeId)
            return product?.items?.[0]?.fulfillment?.inStore || false
          } catch {
            return false
          }
        })
      )

      const available = availability.filter(Boolean).length
      enhanced.products = {
        available,
        outOfStock: availability.length - available,
        totalRequested: availability.length
      }
    }

    return enhanced

  } catch (error) {
    logger.error('Failed to get store with availability', { storeId, error })
    return null
  }
}

// Helper functions
function determineCategoryFromKroger(product: KrogerAPI.KrogerProduct): string {
  return product.categories?.[0] || 'General'
}

function extractAllergens(krogerProduct: KrogerAPI.KrogerProduct, edamamData: any): string[] {
  const allergens: string[] = []
  
  // Extract from Edamam cautions
  if (edamamData?.cautions) {
    allergens.push(...edamamData.cautions)
  }
  
  // Add common allergen detection based on product name
  const name = krogerProduct.name.toLowerCase()
  if (name.includes('milk') || name.includes('dairy')) allergens.push('Dairy')
  if (name.includes('egg')) allergens.push('Eggs')
  if (name.includes('wheat') || name.includes('gluten')) allergens.push('Gluten')
  if (name.includes('soy')) allergens.push('Soy')
  if (name.includes('nut')) allergens.push('Tree Nuts')
  
  return [...new Set(allergens)]
}

function categorizeProduct(name: string): { main: string; sub: string } {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange')) {
    return { main: 'Produce', sub: 'Fruits' }
  }
  if (lowerName.includes('lettuce') || lowerName.includes('carrot') || lowerName.includes('tomato')) {
    return { main: 'Produce', sub: 'Vegetables' }
  }
  if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
    return { main: 'Dairy', sub: 'Dairy Products' }
  }
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork')) {
    return { main: 'Meat', sub: 'Fresh Meat' }
  }
  
  return { main: 'General', sub: 'Miscellaneous' }
}

async function generateSubstitutions(name: string, category: { main: string; sub: string }) {
  // This would typically use AI or a comprehensive database
  const commonSubs: Record<string, string[]> = {
    'milk': ['almond milk', 'oat milk', 'soy milk'],
    'butter': ['margarine', 'coconut oil', 'olive oil'],
    'sugar': ['honey', 'maple syrup', 'stevia'],
    'flour': ['almond flour', 'coconut flour', 'whole wheat flour']
  }
  
  const lowerName = name.toLowerCase()
  const matches = Object.keys(commonSubs).find(key => lowerName.includes(key))
  
  if (matches) {
    return commonSubs[matches].map(sub => ({
      name: sub,
      reason: 'Common substitution',
      nutritionDiff: 'Similar nutrition profile'
    }))
  }
  
  return []
}

function generatePairings(name: string, category: string): string[] {
  const pairings: Record<string, string[]> = {
    'Produce': ['olive oil', 'herbs', 'spices'],
    'Meat': ['vegetables', 'herbs', 'marinades'],
    'Dairy': ['fruits', 'cereals', 'baking ingredients']
  }
  
  return pairings[category] || []
}

function generateCookingMethods(category: string): string[] {
  const methods: Record<string, string[]> = {
    'Produce': ['raw', 'steamed', 'roasted', 'grilled'],
    'Meat': ['grilled', 'baked', 'pan-fried', 'braised'],
    'Dairy': ['direct use', 'melted', 'whipped', 'cultured']
  }
  
  return methods[category] || ['various methods']
}

function generateStorageAdvice(category: string): string {
  const advice: Record<string, string> = {
    'Produce': 'Store in refrigerator crisper drawer. Some items prefer room temperature.',
    'Meat': 'Keep refrigerated below 40°F. Use within 2-3 days or freeze.',
    'Dairy': 'Refrigerate at 35-40°F. Check expiration dates regularly.'
  }
  
  return advice[category] || 'Follow package instructions for optimal storage.'
}

function getSeasonality(name: string) {
  // Simple seasonality data - would be more comprehensive in production
  const seasonal: Record<string, { peak: string[]; available: string[] }> = {
    'apple': { peak: ['Fall'], available: ['Fall', 'Winter'] },
    'tomato': { peak: ['Summer'], available: ['Summer', 'Fall'] },
    'lettuce': { peak: ['Spring', 'Fall'], available: ['Spring', 'Summer', 'Fall'] }
  }
  
  const lowerName = name.toLowerCase()
  const match = Object.keys(seasonal).find(key => lowerName.includes(key))
  
  return match ? seasonal[match] : undefined
}

function generateShoppingRecommendations(
  items: ShoppingListItem[],
  stores: KrogerAPI.KrogerStore[],
  preferences: any
) {
  const preferredStore = stores[0]?.locationId || ''
  const alternativeStores = stores.slice(1, 3).map(s => s.locationId)
  
  const estimatedTotal = items.reduce((sum, item) => {
    const lowestPrice = Math.min(...item.stores.map(s => s.price))
    return sum + lowestPrice
  }, 0)
  
  return {
    preferredStore,
    alternativeStores,
    estimatedTotal,
    estimatedTime: '2-4 hours',
    moneySavingTips: [
      'Consider store brands for 10-30% savings',
      'Check for digital coupons in store app',
      'Buy in bulk for non-perishables'
    ]
  }
}

function generateShoppingOptimization(items: ShoppingListItem[], stores: KrogerAPI.KrogerStore[]) {
  return {
    route: stores.slice(0, 2).map(s => s.locationId),
    groupedItems: {
      'Produce': items.filter(i => i.ingredient.includes('apple')).map(i => i.ingredient),
      'Dairy': items.filter(i => i.ingredient.includes('milk')).map(i => i.ingredient),
      'Meat': items.filter(i => i.ingredient.includes('chicken')).map(i => i.ingredient)
    },
    bulkOpportunities: ['Rice', 'Pasta', 'Canned goods']
  }
}

function createFallbackEnhancedProduct(krogerProduct: KrogerAPI.KrogerProduct): EnhancedProduct {
  return {
    id: krogerProduct.productId,
    name: krogerProduct.name,
    brand: krogerProduct.brand,
    category: determineCategoryFromKroger(krogerProduct),
    confidence: 0.3,
    lastUpdated: new Date(),
    
    kroger: {
      productId: krogerProduct.productId,
      upc: krogerProduct.upc,
      name: krogerProduct.name,
      description: krogerProduct.description,
      brand: krogerProduct.brand,
      inStock: false,
      storeAvailability: [],
      images: []
    },
    
    nutrition: {
      primary: 'fallback' as NutritionSource,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    
    health: {
      dietLabels: [],
      healthLabels: [],
      cautions: [],
      allergens: []
    },
    
    intelligence: {
      category: 'General',
      subcategory: 'Unknown',
      substitutions: [],
      recommendations: {
        pairings: [],
        cookingMethods: [],
        storageAdvice: 'Follow package instructions'
      }
    }
  }
}

function generateFallbackProducts(query: string, limit: number): EnhancedProduct[] {
  // Generate simulated products when APIs fail
  return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    id: `fallback_${i}`,
    name: `${query} (Simulated Product ${i + 1})`,
    category: 'General',
    confidence: 0.1,
    lastUpdated: new Date(),
    
    nutrition: {
      primary: 'fallback' as NutritionSource,
      calories: 100 + i * 50,
      protein: 2 + i,
      fat: 1 + i * 0.5,
      carbs: 20 + i * 5
    },
    
    health: {
      dietLabels: [],
      healthLabels: [],
      cautions: [],
      allergens: []
    },
    
    intelligence: {
      category: 'General',
      subcategory: 'Simulated',
      substitutions: [],
      recommendations: {
        pairings: [],
        cookingMethods: [],
        storageAdvice: 'Standard storage'
      }
    }
  }))
}

/**
 * Clear all caches
 */
export function clearCache(): void {
  productCache.clear()
  KrogerAPI.clearCache()
  USDAAPI.clearCache()
  EdamamAPI.clearCache()
  FatSecretAPI.clearCache()
  SpoonacularAPI.clearCache()
  logger.info('Enhanced grocery service cache cleared')
}

// Export error class
export { EnhancedGroceryError }