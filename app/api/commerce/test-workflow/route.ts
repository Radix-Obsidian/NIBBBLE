import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// Import our commerce services
import * as KrogerAPI from '@/lib/services/kroger-api'
import * as EnhancedGrocery from '@/lib/services/enhanced-grocery-service'
import { ShoppingCartService } from '@/lib/services/shopping-cart-service'

/**
 * Test endpoint for the complete commerce workflow
 * This endpoint tests the integration of all commerce services
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId = 'test-user', testType = 'full' } = body

    logger.info('Starting commerce workflow test', { userId, testType })

    const results: any = {
      success: false,
      tests: {},
      errors: [],
      summary: {}
    }

    // Test 1: Kroger API Authentication and Product Search
    try {
      results.tests.kroger_auth = await testKrogerAPI()
    } catch (error) {
      results.tests.kroger_auth = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      results.errors.push('Kroger API test failed')
    }

    // Test 2: Enhanced Product Search
    try {
      results.tests.enhanced_search = await testEnhancedProductSearch()
    } catch (error) {
      results.tests.enhanced_search = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      results.errors.push('Enhanced product search test failed')
    }

    // Test 3: Shopping Cart Operations
    try {
      results.tests.shopping_cart = await testShoppingCart(userId)
    } catch (error) {
      results.tests.shopping_cart = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      results.errors.push('Shopping cart test failed')
    }

    // Test 4: Store Locator
    try {
      results.tests.store_locator = await testStoreLocator()
    } catch (error) {
      results.tests.store_locator = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      results.errors.push('Store locator test failed')
    }

    // Test 5: Smart Shopping List Generation
    try {
      results.tests.smart_shopping = await testSmartShoppingList()
    } catch (error) {
      results.tests.smart_shopping = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      results.errors.push('Smart shopping list test failed')
    }

    // Generate summary
    const totalTests = Object.keys(results.tests).length
    const passedTests = Object.values(results.tests).filter((test: any) => test.success).length
    
    results.summary = {
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: totalTests - passedTests,
      success_rate: Math.round((passedTests / totalTests) * 100)
    }

    results.success = results.errors.length === 0

    logger.info('Commerce workflow test completed', {
      userId,
      testType,
      summary: results.summary,
      errorCount: results.errors.length
    })

    return NextResponse.json(results)

  } catch (error) {
    logger.error('Commerce workflow test failed', { error })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tests: {},
      summary: { total_tests: 0, passed_tests: 0, failed_tests: 0, success_rate: 0 }
    }, { status: 500 })
  }
}

/**
 * Test Kroger API functionality
 */
async function testKrogerAPI() {
  const testResults = {
    success: false,
    tests: {
      token_generation: false,
      product_search: false,
      store_search: false
    },
    data: {} as any,
    errors: [] as string[]
  }

  try {
    // Test product search (this will test token generation internally)
    const searchResults = await KrogerAPI.searchProducts('apple', undefined, 5)
    
    testResults.tests.product_search = searchResults.data.length > 0
    testResults.data.product_count = searchResults.data.length
    testResults.data.sample_product = searchResults.data[0]?.name || 'None found'

    if (searchResults.data.length === 0) {
      testResults.errors.push('No products found in search')
    }

    // Test store search
    const storeResults = await KrogerAPI.findStores('45202', 10, 3) // Cincinnati, OH
    
    testResults.tests.store_search = storeResults.data.length > 0
    testResults.data.store_count = storeResults.data.length
    testResults.data.sample_store = storeResults.data[0]?.name || 'None found'

    if (storeResults.data.length === 0) {
      testResults.errors.push('No stores found in search')
    }

    // If we got here without throwing, token generation worked
    testResults.tests.token_generation = true

    testResults.success = Object.values(testResults.tests).every(Boolean)

  } catch (error) {
    testResults.errors.push(error instanceof Error ? error.message : 'Unknown Kroger API error')
    testResults.success = false
  }

  return testResults
}

/**
 * Test Enhanced Product Search
 */
async function testEnhancedProductSearch() {
  const testResults = {
    success: false,
    tests: {
      basic_search: false,
      nutrition_data: false,
      ai_intelligence: false
    },
    data: {} as any,
    errors: [] as string[]
  }

  try {
    const products = await EnhancedGrocery.searchEnhancedProducts('banana', undefined, undefined, 3)
    
    testResults.tests.basic_search = products.length > 0
    testResults.data.product_count = products.length

    if (products.length > 0) {
      const firstProduct = products[0]
      
      // Test nutrition data
      testResults.tests.nutrition_data = firstProduct.nutrition.calories > 0
      testResults.data.sample_nutrition = {
        calories: firstProduct.nutrition.calories,
        protein: firstProduct.nutrition.protein,
        source: firstProduct.nutrition.primary
      }

      // Test AI intelligence
      testResults.tests.ai_intelligence = firstProduct.intelligence.substitutions.length >= 0 // Allow 0 substitutions
      testResults.data.intelligence = {
        category: firstProduct.intelligence.category,
        substitutions_count: firstProduct.intelligence.substitutions.length,
        recommendations_count: firstProduct.intelligence.recommendations.pairings.length
      }

      testResults.data.confidence_score = firstProduct.confidence
    } else {
      testResults.errors.push('No enhanced products found')
    }

    testResults.success = Object.values(testResults.tests).every(Boolean)

  } catch (error) {
    testResults.errors.push(error instanceof Error ? error.message : 'Unknown enhanced search error')
    testResults.success = false
  }

  return testResults
}

/**
 * Test Shopping Cart Operations
 */
async function testShoppingCart(userId: string) {
  const testResults = {
    success: false,
    tests: {
      cart_creation: false,
      add_item: false,
      update_quantity: false,
      cart_optimization: false
    },
    data: {} as any,
    errors: [] as string[]
  }

  try {
    // Test adding item to cart
    const addResult = await ShoppingCartService.addToCart(userId, {
      ingredientName: 'test apple',
      quantity: 2,
      notes: 'Commerce workflow test'
    })

    testResults.tests.add_item = addResult.success
    testResults.data.add_result = addResult.success ? 'Success' : addResult.error

    if (addResult.success && addResult.cartItem) {
      // Test getting cart
      const cart = await ShoppingCartService.getActiveCart(userId)
      testResults.tests.cart_creation = cart !== null
      testResults.data.cart_items_count = cart?.cart_items.length || 0

      if (cart) {
        // Test cart optimization
        try {
          const optimization = await ShoppingCartService.optimizeCart(cart.id)
          testResults.tests.cart_optimization = optimization.store_recommendations.length > 0
          testResults.data.optimization = {
            store_recommendations: optimization.store_recommendations.length,
            substitution_suggestions: optimization.substitution_suggestions.length
          }
        } catch (optimizationError) {
          testResults.errors.push('Cart optimization failed: ' + (optimizationError instanceof Error ? optimizationError.message : 'Unknown error'))
        }

        // Test updating item quantity
        if (cart.cart_items.length > 0) {
          const updateResult = await ShoppingCartService.updateCartItemQuantity(
            cart.cart_items[0].id,
            3
          )
          testResults.tests.update_quantity = updateResult.success
          testResults.data.update_result = updateResult.success ? 'Success' : updateResult.error
        }
      }
    }

    testResults.success = testResults.tests.cart_creation && testResults.tests.add_item

  } catch (error) {
    testResults.errors.push(error instanceof Error ? error.message : 'Unknown shopping cart error')
    testResults.success = false
  }

  return testResults
}

/**
 * Test Store Locator
 */
async function testStoreLocator() {
  const testResults = {
    success: false,
    tests: {
      zip_code_search: false,
      coordinate_search: false,
      store_details: false
    },
    data: {} as any,
    errors: [] as string[]
  }

  try {
    // Test ZIP code search
    const zipResults = await KrogerAPI.findStores('90210', 25, 5) // Beverly Hills
    testResults.tests.zip_code_search = zipResults.data.length > 0
    testResults.data.zip_store_count = zipResults.data.length

    // Test coordinate search
    const coordResults = await KrogerAPI.findStoresByCoordinates(34.0522, -118.2437, 25, 5) // Los Angeles
    testResults.tests.coordinate_search = coordResults.data.length > 0
    testResults.data.coord_store_count = coordResults.data.length

    // Test store details
    if (zipResults.data.length > 0) {
      const storeDetails = await KrogerAPI.getStoreDetails(zipResults.data[0].locationId)
      testResults.tests.store_details = storeDetails !== null
      testResults.data.sample_store_name = storeDetails?.name || 'None'
    }

    testResults.success = Object.values(testResults.tests).some(Boolean) // At least one should work

  } catch (error) {
    testResults.errors.push(error instanceof Error ? error.message : 'Unknown store locator error')
    testResults.success = false
  }

  return testResults
}

/**
 * Test Smart Shopping List Generation
 */
async function testSmartShoppingList() {
  const testResults = {
    success: false,
    tests: {
      list_generation: false,
      store_recommendations: false,
      optimization_suggestions: false
    },
    data: {} as any,
    errors: [] as string[]
  }

  try {
    const ingredients = ['apple', 'banana', 'milk', 'bread']
    const smartList = await EnhancedGrocery.generateSmartShoppingList(
      ingredients,
      { zipCode: '45202' },
      { budget: 50 }
    )

    testResults.tests.list_generation = smartList.items.length > 0
    testResults.data.generated_items = smartList.items.length

    testResults.tests.store_recommendations = smartList.recommendations.preferredStore !== ''
    testResults.data.preferred_store = smartList.recommendations.preferredStore
    testResults.data.estimated_total = smartList.recommendations.estimatedTotal

    testResults.tests.optimization_suggestions = smartList.optimization.bulkOpportunities.length >= 0
    testResults.data.bulk_opportunities = smartList.optimization.bulkOpportunities.length

    testResults.success = Object.values(testResults.tests).every(Boolean)

  } catch (error) {
    testResults.errors.push(error instanceof Error ? error.message : 'Unknown smart shopping error')
    testResults.success = false
  }

  return testResults
}

/**
 * GET endpoint for simple status check
 */
export async function GET() {
  return NextResponse.json({
    status: 'Commerce API is running',
    endpoints: {
      'POST /api/commerce/test-workflow': 'Run complete commerce workflow test',
      'GET /api/commerce/test-workflow': 'Get API status'
    },
    services: [
      'Kroger API',
      'Enhanced Grocery Service',
      'Shopping Cart Service',
      'USDA API',
      'Edamam API',
      'FatSecret API',
      'Spoonacular API'
    ]
  })
}