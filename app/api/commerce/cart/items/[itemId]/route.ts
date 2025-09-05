import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    // Get current item to calculate new price
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select('cart_id, unit_price')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    const newTotalPrice = quantity * item.unit_price;

    // Update item
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({
        quantity,
        total_price: newTotalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Update cart totals
    await updateCartTotals(item.cart_id);

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;

    // Get cart_id before deletion
    const { data: item } = await supabase
      .from('cart_items')
      .select('cart_id')
      .eq('id', itemId)
      .single();

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    // Update cart totals
    await updateCartTotals(item.cart_id);

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Remove cart item error:', error);
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