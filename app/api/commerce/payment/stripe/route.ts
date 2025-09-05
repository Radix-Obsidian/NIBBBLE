import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/database/supabase';
import { v4 as uuidv4 } from 'uuid';

// Initialize Stripe (you'll need to add STRIPE_SECRET_KEY to your .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil',
});

// POST - Create payment intent for grocery order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      cartId, 
      paymentMethodId,
      deliveryAddress,
      fulfillmentType = 'delivery',
      scheduledTime 
    } = body;

    if (!userId || !cartId) {
      return NextResponse.json(
        { success: false, error: 'userId and cartId are required' },
        { status: 400 }
      );
    }

    // Get cart details with items
    const { data: cart, error: cartError } = await supabase
      .from('shopping_carts')
      .select(`
        *,
        cart_items (
          *,
          products (
            name,
            brand,
            image_url
          )
        )
      `)
      .eq('id', cartId)
      .eq('user_id', userId)
      .single();

    if (cartError || !cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    if (cart.cart_items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate final amounts
    const subtotal = cart.cart_items.reduce((sum: number, item: any) => sum + item.total_price, 0);
    const taxAmount = subtotal * 0.08; // 8% tax
    const deliveryFee = fulfillmentType === 'delivery' && subtotal < 35 ? 5.99 : 0;
    const serviceFeePer = 0.03; // 3% service fee
    const serviceFee = subtotal * serviceFeePer;
    const totalAmount = subtotal + taxAmount + deliveryFee + serviceFee;

    // Generate unique order number
    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe expects cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: false, // We'll confirm after order creation
      metadata: {
        userId,
        cartId,
        orderNumber,
        fulfillmentType
      },
      description: `NIBBBLE Grocery Order ${orderNumber}`,
      receipt_email: undefined // Would get from user profile
    });

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('grocery_orders')
      .insert({
        id: uuidv4(),
        user_id: userId,
        cart_id: cartId,
        store_id: cart.store_id,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        tip_amount: 0, // Will be added later
        total_amount: totalAmount,
        fulfillment_type: fulfillmentType,
        delivery_address: deliveryAddress,
        scheduled_time: scheduledTime,
        payment_method_id: paymentMethodId,
        payment_status: 'pending',
        stripe_payment_intent_id: paymentIntent.id
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      // Cancel the payment intent if order creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cart.cart_items.map((item: any) => ({
      id: uuidv4(),
      order_id: order.id,
      product_id: item.product_id,
      product_name: `${item.products.brand || ''} ${item.products.name}`.trim(),
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Rollback: delete order and cancel payment intent
      await supabase.from('grocery_orders').delete().eq('id', order.id);
      await stripe.paymentIntents.cancel(paymentIntent.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Mark cart as checked out
    await supabase
      .from('shopping_carts')
      .update({ status: 'checked_out' })
      .eq('id', cartId);

    return NextResponse.json({
      success: true,
      data: {
        order,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status
        },
        summary: {
          subtotal,
          taxAmount,
          deliveryFee,
          serviceFee,
          totalAmount,
          itemCount: cart.cart_items.length
        }
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Confirm payment and finalize order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, tipAmount = 0 } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Get order by payment intent
    const { data: order, error: orderError } = await supabase
      .from('grocery_orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update tip amount if provided
    const finalTotalAmount = order.total_amount + tipAmount;

    if (tipAmount > 0) {
      // Update payment intent amount to include tip
      await stripe.paymentIntents.update(paymentIntentId, {
        amount: Math.round(finalTotalAmount * 100)
      });
    }

    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    // Update order status based on payment result
    let newStatus = 'pending';
    let paymentStatus = 'processing';

    if (paymentIntent.status === 'succeeded') {
      newStatus = 'confirmed';
      paymentStatus = 'completed';
    } else if (paymentIntent.status === 'canceled') {
      newStatus = 'cancelled';
      paymentStatus = 'failed';
    }

    // Update order
    const { error: updateError } = await supabase
      .from('grocery_orders')
      .update({
        status: newStatus,
        payment_status: paymentStatus,
        tip_amount: tipAmount,
        total_amount: finalTotalAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // If payment succeeded, trigger order fulfillment process
    if (paymentIntent.status === 'succeeded') {
      await initiateOrderFulfillment(order.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status
        },
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: newStatus,
          paymentStatus,
          totalAmount: finalTotalAmount
        }
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to initiate order fulfillment
async function initiateOrderFulfillment(orderId: string): Promise<void> {
  try {
    // In a real implementation, this would:
    // 1. Send order to grocery store/fulfillment partner
    // 2. Schedule delivery/pickup
    // 3. Send confirmation notifications
    // 4. Update inventory
    
    console.log(`Initiating fulfillment for order ${orderId}`);
    
    // Simulate estimated delivery time (2-4 hours for delivery, 30 minutes for pickup)
    const estimatedMinutes = Math.random() * 120 + 120; // 2-4 hours
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(estimatedArrival.getMinutes() + estimatedMinutes);

    await supabase
      .from('grocery_orders')
      .update({
        status: 'preparing',
        estimated_arrival: estimatedArrival.toISOString()
      })
      .eq('id', orderId);

    // Here you would also:
    // - Send SMS/email notifications
    // - Create delivery tracking
    // - Update inventory levels
    // - Notify store systems
    
  } catch (error) {
    console.error('Order fulfillment initiation error:', error);
  }
}