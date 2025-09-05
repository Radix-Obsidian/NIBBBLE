import { supabase } from '@/lib/database/supabase'
import { logger } from '@/lib/logger'
import { v4 as uuidv4 } from 'uuid'
import * as EnhancedGrocery from './enhanced-grocery-service'
import * as KrogerAPI from './kroger-api'

// Types
export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
  notes?: string
  priority: number
  recipe_id?: string
  substitution_for?: string
  enhanced_data?: {
    name: string
    brand?: string
    nutrition: any
    health: any
    availability: {
      in_stock: boolean
      estimated_delivery: string
      store_locations: string[]
    }
  }
  created_at: string
  updated_at: string
}

export interface ShoppingCart {
  id: string
  user_id: string
  status: 'active' | 'checked_out' | 'abandoned' | 'completed'
  store_id?: string
  estimated_total: number
  tax_amount: number
  delivery_fee: number
  subtotal: number
  items_count: number
  optimization_data?: {
    preferred_store: string
    alternative_stores: string[]
    route_suggestions: string[]
    bulk_opportunities: string[]
  }
  created_at: string
  updated_at: string
}

export interface CartWithItems extends ShoppingCart {
  cart_items: CartItem[]
}

export interface AddToCartRequest {
  productId?: string
  ingredientName?: string
  quantity: number
  unit?: string
  recipeId?: string
  notes?: string
  priority?: number
  substituteFor?: string
}

export interface CartOptimization {
  store_recommendations: Array<{
    store_id: string
    store_name: string
    total_availability: number
    estimated_total: number
    estimated_time: string
    distance?: string
  }>
  item_groupings: Record<string, string[]>
  substitution_suggestions: Array<{
    original_item: string
    suggested_items: Array<{
      name: string
      price_difference: number
      nutrition_comparison: string
      reason: string
    }>
  }>
  bulk_opportunities: Array<{
    items: string[]
    savings_estimate: number
    minimum_quantity: number
  }>
}

class ShoppingCartError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ShoppingCartError'
  }
}

export class ShoppingCartService {
  /**
   * Get active cart for user
   */
  static async getActiveCart(userId: string): Promise<CartWithItems | null> {
    try {
      const { data, error } = await supabase
        .from('shopping_carts')
        .select(`
          *,
          cart_items (
            *,
            products (
              name,
              brand,
              image_url,
              unit_type,
              organic,
              gluten_free,
              vegetarian,
              vegan
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) return null

      // Transform the data to match our interface
      const cart: CartWithItems = {
        ...data,
        cart_items: data.cart_items || []
      }

      logger.info('Retrieved active cart', { 
        userId, 
        cartId: cart.id, 
        itemsCount: cart.cart_items.length 
      })

      return cart

    } catch (error) {
      logger.error('Failed to get active cart', { userId, error })
      return null
    }
  }

  /**
   * Create new shopping cart
   */
  static async createCart(userId: string, storeId?: string): Promise<CartWithItems> {
    try {
      const cartData = {
        id: uuidv4(),
        user_id: userId,
        status: 'active' as const,
        store_id: storeId,
        estimated_total: 0,
        tax_amount: 0,
        delivery_fee: 0,
        subtotal: 0,
        items_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('shopping_carts')
        .insert(cartData)
        .select()
        .single()

      if (error) throw error

      logger.info('Created new shopping cart', { userId, cartId: data.id })

      return {
        ...data,
        cart_items: []
      }

    } catch (error) {
      logger.error('Failed to create cart', { userId, storeId, error })
      throw new ShoppingCartError('Failed to create cart', 'CREATION_FAILED', error)
    }
  }

  /**
   * Add item to cart with enhanced data
   */
  static async addToCart(
    userId: string,
    request: AddToCartRequest
  ): Promise<{ success: boolean; cartItem?: CartItem; error?: string }> {
    try {
      logger.info('Adding item to cart', { userId, request })

      // Get or create active cart
      let cart = await this.getActiveCart(userId)
      if (!cart) {
        cart = await this.createCart(userId)
      }

      // If productId is provided, get enhanced product data
      let enhancedProduct: EnhancedGrocery.EnhancedProduct | null = null
      if (request.productId) {
        try {
          const products = await EnhancedGrocery.searchEnhancedProducts(
            request.productId,
            cart.store_id,
            undefined,
            1
          )
          enhancedProduct = products[0] || null
        } catch (error) {
          logger.warn('Failed to get enhanced product data', { productId: request.productId, error })
        }
      } else if (request.ingredientName) {
        // Search for the ingredient
        try {
          const products = await EnhancedGrocery.searchEnhancedProducts(
            request.ingredientName,
            cart.store_id,
            undefined,
            1
          )
          enhancedProduct = products[0] || null
        } catch (error) {
          logger.warn('Failed to search for ingredient', { ingredientName: request.ingredientName, error })
        }
      }

      // Determine product details and pricing
      const productId = enhancedProduct?.id || request.productId || uuidv4()
      const productName = enhancedProduct?.name || request.ingredientName || 'Unknown Item'
      const unitPrice = enhancedProduct?.kroger?.price?.regular || 
                       enhancedProduct?.averagePrice || 
                       2.99 // Fallback price

      // Check if item already exists in cart
      const existingItem = cart.cart_items.find(item => 
        item.product_id === productId || 
        (item.enhanced_data?.name === productName)
      )

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + request.quantity
        const newTotalPrice = newQuantity * unitPrice

        const { data: updatedItem, error } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price: newTotalPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id)
          .select()
          .single()

        if (error) throw error

        await this.updateCartTotals(cart.id)

        logger.info('Updated existing cart item', {
          cartId: cart.id,
          itemId: existingItem.id,
          newQuantity,
          newTotalPrice
        })

        return { success: true, cartItem: updatedItem }
      }

      // Add new item to cart
      const itemData: Partial<CartItem> = {
        id: uuidv4(),
        cart_id: cart.id,
        product_id: productId,
        quantity: request.quantity,
        unit: request.unit || 'item',
        unit_price: unitPrice,
        total_price: request.quantity * unitPrice,
        notes: request.notes,
        priority: request.priority || 1,
        recipe_id: request.recipeId,
        substitution_for: request.substituteFor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add enhanced data if available
      if (enhancedProduct) {
        itemData.enhanced_data = {
          name: enhancedProduct.name,
          brand: enhancedProduct.brand,
          nutrition: enhancedProduct.nutrition,
          health: enhancedProduct.health,
          availability: {
            in_stock: enhancedProduct.kroger?.inStock || false,
            estimated_delivery: '2-4 hours',
            store_locations: enhancedProduct.kroger?.storeAvailability || []
          }
        }
      }

      const { data: newItem, error } = await supabase
        .from('cart_items')
        .insert(itemData)
        .select()
        .single()

      if (error) throw error

      // Update cart totals
      await this.updateCartTotals(cart.id)

      logger.info('Added new item to cart', {
        cartId: cart.id,
        itemId: newItem.id,
        productName,
        quantity: request.quantity
      })

      return { success: true, cartItem: newItem }

    } catch (error) {
      logger.error('Failed to add item to cart', { userId, request, error })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Update item quantity in cart
   */
  static async updateCartItemQuantity(
    itemId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (quantity <= 0) {
        return this.removeCartItem(itemId)
      }

      const { data: item, error: fetchError } = await supabase
        .from('cart_items')
        .select('cart_id, unit_price')
        .eq('id', itemId)
        .single()

      if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity,
          total_price: quantity * item.unit_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)

      if (updateError) throw updateError

      await this.updateCartTotals(item.cart_id)

      logger.info('Updated cart item quantity', { itemId, quantity })
      return { success: true }

    } catch (error) {
      logger.error('Failed to update cart item quantity', { itemId, quantity, error })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: item, error: fetchError } = await supabase
        .from('cart_items')
        .select('cart_id')
        .eq('id', itemId)
        .single()

      if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
      }

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      await this.updateCartTotals(item.cart_id)

      logger.info('Removed cart item', { itemId })
      return { success: true }

    } catch (error) {
      logger.error('Failed to remove cart item', { itemId, error })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Generate cart optimization recommendations
   */
  static async optimizeCart(cartId: string): Promise<CartOptimization> {
    try {
      const cart = await this.getCartById(cartId)
      if (!cart) {
        throw new ShoppingCartError('Cart not found', 'CART_NOT_FOUND')
      }

      logger.info('Optimizing cart', { cartId, itemsCount: cart.cart_items.length })

      // Get ingredient names from cart items
      const ingredients = cart.cart_items.map(item => 
        item.enhanced_data?.name || item.product_id
      )

      // Generate smart shopping list with optimization
      const smartList = await EnhancedGrocery.generateSmartShoppingList(
        ingredients,
        {}, // Location would come from user preferences
        { budget: cart.estimated_total }
      )

      // Transform to our optimization format
      const optimization: CartOptimization = {
        store_recommendations: [
          {
            store_id: smartList.recommendations.preferredStore,
            store_name: 'Kroger (Preferred)',
            total_availability: 90,
            estimated_total: smartList.recommendations.estimatedTotal,
            estimated_time: smartList.recommendations.estimatedTime,
            distance: '2.5 miles'
          },
          ...smartList.recommendations.alternativeStores.map((storeId, index) => ({
            store_id: storeId,
            store_name: `Alternative Store ${index + 1}`,
            total_availability: 80 - index * 10,
            estimated_total: smartList.recommendations.estimatedTotal * (1 + index * 0.05),
            estimated_time: smartList.recommendations.estimatedTime,
            distance: `${3 + index} miles`
          }))
        ],
        
        item_groupings: smartList.optimization.groupedItems,
        
        substitution_suggestions: cart.cart_items
          .filter(item => item.enhanced_data)
          .slice(0, 3) // Limit for performance
          .map(item => ({
            original_item: item.enhanced_data!.name,
            suggested_items: [
              {
                name: `${item.enhanced_data!.name} (Store Brand)`,
                price_difference: -0.50,
                nutrition_comparison: 'Similar nutrition',
                reason: 'Cost savings'
              }
            ]
          })),
          
        bulk_opportunities: smartList.optimization.bulkOpportunities.map(item => ({
          items: [item],
          savings_estimate: 2.50,
          minimum_quantity: 3
        }))
      }

      // Update cart with optimization data
      await supabase
        .from('shopping_carts')
        .update({
          optimization_data: {
            preferred_store: optimization.store_recommendations[0]?.store_id,
            alternative_stores: optimization.store_recommendations.slice(1).map(s => s.store_id),
            route_suggestions: [],
            bulk_opportunities: optimization.bulk_opportunities.map(b => b.items[0])
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId)

      logger.info('Cart optimization completed', { cartId })
      return optimization

    } catch (error) {
      logger.error('Failed to optimize cart', { cartId, error })
      throw new ShoppingCartError('Cart optimization failed', 'OPTIMIZATION_FAILED', error)
    }
  }

  /**
   * Add recipe ingredients to cart
   */
  static async addRecipeToCart(
    userId: string,
    recipeId: string,
    ingredients: Array<{
      name: string
      quantity: number
      unit: string
    }>,
    servings?: number
  ): Promise<{ success: boolean; addedItems: number; errors: string[] }> {
    try {
      logger.info('Adding recipe to cart', { userId, recipeId, ingredientCount: ingredients.length })

      const errors: string[] = []
      let addedItems = 0

      for (const ingredient of ingredients) {
        const adjustedQuantity = servings ? 
          (ingredient.quantity * servings) : 
          ingredient.quantity

        const result = await this.addToCart(userId, {
          ingredientName: ingredient.name,
          quantity: adjustedQuantity,
          unit: ingredient.unit,
          recipeId,
          priority: 1
        })

        if (result.success) {
          addedItems++
        } else {
          errors.push(`${ingredient.name}: ${result.error}`)
        }
      }

      logger.info('Recipe added to cart', {
        userId,
        recipeId,
        addedItems,
        errorCount: errors.length
      })

      return {
        success: addedItems > 0,
        addedItems,
        errors
      }

    } catch (error) {
      logger.error('Failed to add recipe to cart', { userId, recipeId, error })
      return {
        success: false,
        addedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Clear cart
   */
  static async clearCart(cartId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

      if (error) throw error

      await this.updateCartTotals(cartId)

      logger.info('Cart cleared', { cartId })
      return { success: true }

    } catch (error) {
      logger.error('Failed to clear cart', { cartId, error })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  // Helper Methods

  private static async getCartById(cartId: string): Promise<CartWithItems | null> {
    try {
      const { data, error } = await supabase
        .from('shopping_carts')
        .select(`
          *,
          cart_items (*)
        `)
        .eq('id', cartId)
        .single()

      if (error) return null

      return {
        ...data,
        cart_items: data.cart_items || []
      }

    } catch (error) {
      logger.error('Failed to get cart by ID', { cartId, error })
      return null
    }
  }

  private static async updateCartTotals(cartId: string): Promise<void> {
    try {
      const { data: items } = await supabase
        .from('cart_items')
        .select('quantity, total_price')
        .eq('cart_id', cartId)

      if (!items) return

      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
      const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
      const taxAmount = subtotal * 0.08 // 8% tax
      const deliveryFee = subtotal > 35 ? 0 : 5.99
      const estimatedTotal = subtotal + taxAmount + deliveryFee

      await supabase
        .from('shopping_carts')
        .update({
          subtotal,
          estimated_total: estimatedTotal,
          tax_amount: taxAmount,
          delivery_fee: deliveryFee,
          items_count: itemsCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId)

      logger.debug('Updated cart totals', {
        cartId,
        subtotal,
        estimatedTotal,
        itemsCount
      })

    } catch (error) {
      logger.error('Failed to update cart totals', { cartId, error })
    }
  }
}

// Export error class
export { ShoppingCartError }