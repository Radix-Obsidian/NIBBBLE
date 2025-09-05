import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface InventoryCheckResult {
  productId: string;
  productName: string;
  stores: Array<{
    storeId: string;
    storeName: string;
    inStock: boolean;
    quantity?: number;
    price: number;
    salePrice?: number;
    lastUpdated: string;
    estimatedRestockDate?: string;
  }>;
  aggregateStats: {
    totalStoresChecked: number;
    inStockCount: number;
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
  };
}

// POST - Check real-time inventory for products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productIds, storeIds, checkType = 'both' } = body;

    if (!userId || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { success: false, error: 'userId and productIds array are required' },
        { status: 400 }
      );
    }

    const inventoryResults: InventoryCheckResult[] = [];

    for (const productId of productIds) {
      const result = await checkProductInventory(
        productId,
        storeIds,
        checkType,
        userId
      );
      inventoryResults.push(result);
    }

    // Store inventory check logs for analytics
    await logInventoryChecks(userId, inventoryResults);

    // Check for low stock alerts
    await checkLowStockAlerts(userId, inventoryResults);

    return NextResponse.json({
      success: true,
      data: {
        inventoryResults,
        summary: {
          totalProductsChecked: inventoryResults.length,
          totalStoresChecked: getTotalStoresChecked(inventoryResults),
          outOfStockProducts: getOutOfStockProducts(inventoryResults),
          averageAvailability: calculateAverageAvailability(inventoryResults),
          priceRange: calculatePriceRange(inventoryResults)
        }
      }
    });

  } catch (error) {
    console.error('Inventory check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get inventory status for user's cart or specific products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const cartId = searchParams.get('cartId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let productIds: string[] = [];

    if (productId) {
      productIds = [productId];
    } else if (cartId) {
      // Get products from cart
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('product_id')
        .eq('cart_id', cartId);
      
      productIds = cartItems?.map(item => item.product_id) || [];
    } else {
      // Get products from user's active cart
      const { data: cart } = await supabase
        .from('shopping_carts')
        .select(`
          cart_items (
            product_id
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      productIds = cart?.cart_items?.map((item: any) => item.product_id) || [];
    }

    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { inventoryResults: [], summary: {} }
      });
    }

    // Check inventory for all products
    const inventoryResults: InventoryCheckResult[] = [];
    for (const productId of productIds) {
      const result = await checkProductInventory(productId, null, 'both', userId);
      inventoryResults.push(result);
    }

    return NextResponse.json({
      success: true,
      data: {
        inventoryResults,
        summary: {
          totalProductsChecked: inventoryResults.length,
          inStockProducts: inventoryResults.filter(r => r.aggregateStats.inStockCount > 0).length,
          outOfStockProducts: inventoryResults.filter(r => r.aggregateStats.inStockCount === 0).length
        }
      }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check inventory for a single product across stores
async function checkProductInventory(
  productId: string,
  storeIds: string[] | null,
  checkType: string,
  userId: string
): Promise<InventoryCheckResult> {
  const startTime = Date.now();

  // Get product details
  const { data: product } = await supabase
    .from('products')
    .select('id, name')
    .eq('id', productId)
    .single();

  if (!product) {
    throw new Error(`Product ${productId} not found`);
  }

  // Build store filter
  let storeQuery = supabase
    .from('store_products')
    .select(`
      *,
      grocery_stores (
        id,
        name,
        provider_id,
        city,
        state,
        grocery_providers (
          name,
          slug
        )
      )
    `)
    .eq('product_id', productId);

  if (storeIds && storeIds.length > 0) {
    storeQuery = storeQuery.in('store_id', storeIds);
  }

  const { data: storeProducts } = await storeQuery;

  const stores = [];
  let totalPrice = 0;
  let priceCount = 0;
  let lowestPrice = Infinity;
  let highestPrice = 0;
  let inStockCount = 0;

  if (storeProducts) {
    for (const storeProduct of storeProducts) {
      const store = storeProduct.grocery_stores;
      const currentPrice = storeProduct.sale_price || storeProduct.price;
      
      // Simulate real-time inventory check (in real implementation, this would call store APIs)
      const realTimeStock = await simulateRealTimeInventoryCheck(
        storeProduct,
        checkType
      );

      stores.push({
        storeId: store.id,
        storeName: `${store.grocery_providers?.name || 'Unknown'} - ${store.name}`,
        inStock: realTimeStock.inStock,
        quantity: realTimeStock.quantity,
        price: currentPrice,
        salePrice: storeProduct.sale_price,
        lastUpdated: realTimeStock.lastUpdated,
        estimatedRestockDate: realTimeStock.estimatedRestockDate
      });

      // Calculate aggregate stats
      totalPrice += currentPrice;
      priceCount++;
      lowestPrice = Math.min(lowestPrice, currentPrice);
      highestPrice = Math.max(highestPrice, currentPrice);
      
      if (realTimeStock.inStock) {
        inStockCount++;
      }
    }
  }

  const responseTime = Date.now() - startTime;

  // Log this inventory check
  await supabase
    .from('inventory_checks')
    .insert({
      id: uuidv4(),
      user_id: userId,
      product_id: productId,
      store_id: null, // Multiple stores checked
      check_type: checkType,
      result: { stores, responseTime },
      in_stock: inStockCount > 0,
      price: priceCount > 0 ? totalPrice / priceCount : null,
      response_time_ms: responseTime
    });

  return {
    productId: product.id,
    productName: product.name,
    stores,
    aggregateStats: {
      totalStoresChecked: stores.length,
      inStockCount,
      averagePrice: priceCount > 0 ? totalPrice / priceCount : 0,
      lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice,
      highestPrice
    }
  };
}

// Simulate real-time inventory check (replace with actual API calls in production)
async function simulateRealTimeInventoryCheck(
  storeProduct: any,
  checkType: string
): Promise<{
  inStock: boolean;
  quantity?: number;
  lastUpdated: string;
  estimatedRestockDate?: string;
}> {
  // Simulate API response time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));

  // Simulate real-time stock status (90% of items are in stock)
  const inStock = Math.random() > 0.1;
  const quantity = inStock ? Math.floor(Math.random() * 50) + 1 : 0;
  
  let estimatedRestockDate;
  if (!inStock) {
    // Estimate restock in 2-7 days
    const restockDays = Math.floor(Math.random() * 6) + 2;
    const restockDate = new Date();
    restockDate.setDate(restockDate.getDate() + restockDays);
    estimatedRestockDate = restockDate.toISOString();
  }

  return {
    inStock,
    quantity: checkType === 'availability' || checkType === 'both' ? quantity : undefined,
    lastUpdated: new Date().toISOString(),
    estimatedRestockDate
  };
}

// Log inventory checks for analytics
async function logInventoryChecks(
  userId: string,
  results: InventoryCheckResult[]
): Promise<void> {
  const logEntries = results.flatMap(result =>
    result.stores.map(store => ({
      id: uuidv4(),
      user_id: userId,
      product_id: result.productId,
      store_id: store.storeId,
      check_type: 'both',
      result: {
        inStock: store.inStock,
        price: store.price,
        quantity: store.quantity
      },
      in_stock: store.inStock,
      price: store.price,
      response_time_ms: 0 // Already logged in individual checks
    }))
  );

  if (logEntries.length > 0) {
    await supabase
      .from('inventory_checks')
      .insert(logEntries);
  }
}

// Check for low stock alerts
async function checkLowStockAlerts(
  userId: string,
  results: InventoryCheckResult[]
): Promise<void> {
  for (const result of results) {
    const outOfStockStores = result.stores.filter(store => !store.inStock);
    
    if (outOfStockStores.length > result.stores.length * 0.5) { // More than 50% out of stock
      // Create alert
      await supabase
        .from('inventory_alerts')
        .insert({
          id: uuidv4(),
          user_id: userId,
          inventory_id: null, // This would reference user_inventory if checking personal stock
          alert_type: 'low_availability',
          message: `${result.productName} has limited availability - ${result.aggregateStats.inStockCount} of ${result.aggregateStats.totalStoresChecked} stores have it in stock`,
          is_read: false,
          scheduled_for: new Date().toISOString()
        });
    }
  }
}

// Helper functions
function getTotalStoresChecked(results: InventoryCheckResult[]): number {
  return results.reduce((total, result) => total + result.aggregateStats.totalStoresChecked, 0);
}

function getOutOfStockProducts(results: InventoryCheckResult[]): InventoryCheckResult[] {
  return results.filter(result => result.aggregateStats.inStockCount === 0);
}

function calculateAverageAvailability(results: InventoryCheckResult[]): number {
  if (results.length === 0) return 0;
  
  const totalAvailability = results.reduce((sum, result) => {
    return sum + (result.aggregateStats.inStockCount / result.aggregateStats.totalStoresChecked);
  }, 0);
  
  return totalAvailability / results.length;
}

function calculatePriceRange(results: InventoryCheckResult[]): {
  lowest: number;
  highest: number;
  average: number;
} {
  let totalAverage = 0;
  let count = 0;
  let globalLowest = Infinity;
  let globalHighest = 0;

  results.forEach(result => {
    if (result.aggregateStats.averagePrice > 0) {
      totalAverage += result.aggregateStats.averagePrice;
      count++;
    }
    if (result.aggregateStats.lowestPrice > 0) {
      globalLowest = Math.min(globalLowest, result.aggregateStats.lowestPrice);
    }
    globalHighest = Math.max(globalHighest, result.aggregateStats.highestPrice);
  });

  return {
    lowest: globalLowest === Infinity ? 0 : globalLowest,
    highest: globalHighest,
    average: count > 0 ? totalAverage / count : 0
  };
}