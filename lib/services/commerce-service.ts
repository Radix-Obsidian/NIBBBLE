import { supabase } from '@/lib/database/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  priority: number;
  products?: {
    name: string;
    brand?: string;
    image_url?: string;
    unit_type: string;
    organic: boolean;
  };
}

export interface ShoppingCart {
  id: string;
  user_id: string;
  store_id?: string;
  status: string;
  estimated_total: number;
  tax_amount: number;
  delivery_fee: number;
  cart_items: CartItem[];
}

export interface InventoryItem {
  id: string;
  user_id: string;
  product_id?: string;
  custom_item_name?: string;
  quantity: number;
  unit: string;
  expiry_date?: string;
  location?: string;
  low_stock_alert: boolean;
  minimum_quantity: number;
}

export class CommerceService {
  // Shopping Cart Methods
  static async getCart(userId: string): Promise<ShoppingCart | null> {
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
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Get cart error:', error);
      return null;
    }
  }

  static async addToCart(
    userId: string,
    productId: string,
    quantity: number,
    recipeId?: string,
    notes?: string,
    priority: number = 1
  ): Promise<boolean> {
    try {
      // Get or create cart
      let cart = await this.getCart(userId);
      
      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from('shopping_carts')
          .insert({
            id: uuidv4(),
            user_id: userId,
            status: 'active',
            estimated_total: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        cart = { ...newCart, cart_items: [] };
      }

      // Check if item already exists
      const existingItem = cart.cart_items.find(item => item.product_id === productId);
      const unitPrice = 2.99; // This would come from store_products table

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = newQuantity * unitPrice;

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price: newTotalPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            id: uuidv4(),
            cart_id: cart.id,
            product_id: productId,
            recipe_id: recipeId,
            quantity,
            unit_price: unitPrice,
            total_price: quantity * unitPrice,
            notes,
            priority
          });

        if (insertError) throw insertError;
      }

      // Update cart totals
      await this.updateCartTotals(cart.id);
      return true;

    } catch (error) {
      console.error('Add to cart error:', error);
      return false;
    }
  }

  static async updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
    try {
      const { data: item, error: itemError } = await supabase
        .from('cart_items')
        .select('cart_id, unit_price')
        .eq('id', itemId)
        .single();

      if (itemError || !item) return false;

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity,
          total_price: quantity * item.unit_price,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      await this.updateCartTotals(item.cart_id);
      return true;

    } catch (error) {
      console.error('Update cart item error:', error);
      return false;
    }
  }

  static async removeCartItem(itemId: string): Promise<boolean> {
    try {
      const { data: item } = await supabase
        .from('cart_items')
        .select('cart_id')
        .eq('id', itemId)
        .single();

      if (!item) return false;

      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) throw deleteError;

      await this.updateCartTotals(item.cart_id);
      return true;

    } catch (error) {
      console.error('Remove cart item error:', error);
      return false;
    }
  }

  private static async updateCartTotals(cartId: string): Promise<void> {
    const { data: items } = await supabase
      .from('cart_items')
      .select('total_price')
      .eq('cart_id', cartId);

    if (items) {
      const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
      const taxAmount = subtotal * 0.08;
      const deliveryFee = subtotal > 35 ? 0 : 5.99;
      const estimatedTotal = subtotal + taxAmount + deliveryFee;

      await supabase
        .from('shopping_carts')
        .update({
          estimated_total: estimatedTotal,
          tax_amount: taxAmount,
          delivery_fee: deliveryFee,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartId);
    }
  }

  // Inventory Management Methods
  static async getUserInventory(userId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          products (
            name,
            brand,
            image_url,
            unit_type
          )
        `)
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Get inventory error:', error);
      return [];
    }
  }

  static async addInventoryItem(
    userId: string,
    productId: string | null,
    customItemName: string | null,
    quantity: number,
    unit: string,
    location?: string,
    expiryDate?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_inventory')
        .insert({
          id: uuidv4(),
          user_id: userId,
          product_id: productId,
          custom_item_name: customItemName,
          quantity,
          unit,
          expiry_date: expiryDate,
          location: location || 'pantry',
          low_stock_alert: false,
          minimum_quantity: 1,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;
      return true;

    } catch (error) {
      console.error('Add inventory item error:', error);
      return false;
    }
  }

  static async updateInventoryQuantity(inventoryId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_inventory')
        .update({
          quantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventoryId);

      if (error) throw error;

      // Check if this triggers a low stock alert
      await this.checkLowStockAlerts(inventoryId);
      return true;

    } catch (error) {
      console.error('Update inventory quantity error:', error);
      return false;
    }
  }

  static async removeInventoryItem(inventoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_inventory')
        .delete()
        .eq('id', inventoryId);

      if (error) throw error;
      return true;

    } catch (error) {
      console.error('Remove inventory item error:', error);
      return false;
    }
  }

  private static async checkLowStockAlerts(inventoryId: string): Promise<void> {
    try {
      const { data: item } = await supabase
        .from('user_inventory')
        .select('user_id, custom_item_name, quantity, minimum_quantity, low_stock_alert, products(name)')
        .eq('id', inventoryId)
        .single();

      if (item && item.quantity <= item.minimum_quantity && !item.low_stock_alert) {
        // Create alert
        await supabase
          .from('inventory_alerts')
          .insert({
            id: uuidv4(),
            user_id: item.user_id,
            inventory_id: inventoryId,
            alert_type: 'low_stock',
            message: `${item.custom_item_name || item.products?.name || 'Item'} is running low (${item.quantity} remaining)`,
            is_read: false,
            scheduled_for: new Date().toISOString()
          });

        // Mark inventory item as alerted
        await supabase
          .from('user_inventory')
          .update({ low_stock_alert: true })
          .eq('id', inventoryId);
      }
    } catch (error) {
      console.error('Low stock alert check error:', error);
    }
  }

  // Smart Procurement Methods
  static async generateSmartIngredientList(
    userId: string,
    ingredients: string[],
    preferences: any = {}
  ): Promise<any> {
    try {
      const response = await fetch('/api/commerce/ingredients/smart-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ingredients,
          preferences
        })
      });

      const result = await response.json();
      return result.success ? result.data : null;

    } catch (error) {
      console.error('Generate smart list error:', error);
      return null;
    }
  }

  // Inventory Checking Methods
  static async checkInventoryAvailability(
    userId: string,
    productIds: string[],
    storeIds?: string[]
  ): Promise<any> {
    try {
      const response = await fetch('/api/commerce/inventory/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productIds,
          storeIds,
          checkType: 'both'
        })
      });

      const result = await response.json();
      return result.success ? result.data : null;

    } catch (error) {
      console.error('Check inventory error:', error);
      return null;
    }
  }

  // Store and Product Search Methods
  static async searchProducts(query: string, filters: any = {}): Promise<any[]> {
    try {
      let searchQuery = supabase
        .from('products')
        .select(`
          *,
          store_products (
            price,
            sale_price,
            in_stock,
            grocery_stores (
              name,
              grocery_providers (
                name
              )
            )
          )
        `)
        .ilike('name', `%${query}%`)
        .limit(20);

      if (filters.organic) {
        searchQuery = searchQuery.eq('organic', true);
      }
      if (filters.glutenFree) {
        searchQuery = searchQuery.eq('gluten_free', true);
      }
      if (filters.vegan) {
        searchQuery = searchQuery.eq('vegan', true);
      }

      const { data, error } = await searchQuery;
      
      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Search products error:', error);
      return [];
    }
  }

  static async getNearbyStores(latitude: number, longitude: number, radius: number = 25): Promise<any[]> {
    try {
      // This would use PostGIS for actual geographic queries
      // For now, we'll use a simple approach
      const { data, error } = await supabase
        .from('grocery_stores')
        .select(`
          *,
          grocery_providers (
            name,
            logo_url,
            delivery_available,
            pickup_available
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Get nearby stores error:', error);
      return [];
    }
  }

  // Analytics Methods
  static async getPurchaseAnalytics(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('purchase_analytics')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data?.[0] || null;

    } catch (error) {
      console.error('Get purchase analytics error:', error);
      return null;
    }
  }

  static async getInventoryAlerts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_alerts')
        .select(`
          *,
          user_inventory (
            custom_item_name,
            quantity,
            products (
              name,
              brand
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Get inventory alerts error:', error);
      return [];
    }
  }

  static async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      return true;

    } catch (error) {
      console.error('Mark alert as read error:', error);
      return false;
    }
  }
}