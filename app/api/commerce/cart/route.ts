import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// GET - Get user's active cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get active cart with items
    const { data: cart, error: cartError } = await supabase
      .from('shopping_carts')
      .select(`
        *,
        cart_items (
          *,
          products (
            id,
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
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cartError && cartError.code !== 'PGRST116') {
      console.error('Cart fetch error:', cartError);
      return NextResponse.json(
        { success: false, error: cartError.message },
        { status: 500 }
      );
    }

    // If no active cart exists, create one
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('shopping_carts')
        .insert({
          id: uuidv4(),
          user_id: userId,
          status: 'active',
          estimated_total: 0,
          tax_amount: 0,
          delivery_fee: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Cart creation error:', createError);
        return NextResponse.json(
          { success: false, error: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        cart: { ...newCart, cart_items: [] }
      });
    }

    return NextResponse.json({
      success: true,
      cart
    });

  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, quantity, recipeId, notes, priority = 1 } = body;

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'userId, productId, and quantity are required' },
        { status: 400 }
      );
    }

    // Get or create active cart
    let { data: cart } = await supabase
      .from('shopping_carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('shopping_carts')
        .insert({
          id: uuidv4(),
          user_id: userId,
          status: 'active',
          estimated_total: 0
        })
        .select('id')
        .single();

      if (createError) {
        return NextResponse.json(
          { success: false, error: createError.message },
          { status: 500 }
        );
      }
      cart = newCart;
    }

    // Get product details for pricing
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, unit_type')
      .eq('id', productId)
      .single();

    if (productError) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single();

    // Get current price (mock pricing for now)
    const unitPrice = 2.99; // This would come from store_products table
    const totalPrice = quantity * unitPrice;

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

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
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
          total_price: totalPrice,
          notes,
          priority
        });

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
    }

    // Update cart total
    await updateCartTotals(cart.id);

    return NextResponse.json({
      success: true,
      message: 'Item added to cart'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update cart totals
async function updateCartTotals(cartId: string) {
  const { data: items } = await supabase
    .from('cart_items')
    .select('total_price')
    .eq('cart_id', cartId);

  if (items) {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.08; // 8% tax
    const deliveryFee = subtotal > 35 ? 0 : 5.99; // Free delivery over $35
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