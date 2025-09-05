import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/connect';
import * as Sentry from '@sentry/nextjs';

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is required. Please add it to your environment variables.');
}

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log the event for debugging
    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'product.created':
        await handleProductCreated(event.data.object);
        break;

      case 'product.updated':
        await handleProductUpdated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    
    // Capture the error in Sentry
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Event handlers
async function handleAccountUpdated(account: any) {
  console.log('Account updated:', account.id);
  
  // In a real application, you would:
  // 1. Update the account status in your database
  // 2. Send notifications to the account owner
  // 3. Update any cached account information
  
  // Log the account status for debugging
  console.log('Account status:', {
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
  });
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('Checkout session completed:', session.id);
  
  // In a real application, you would:
  // 1. Update order status in your database
  // 2. Send confirmation emails
  // 3. Update inventory
  // 4. Process fulfillment
  
  console.log('Session details:', {
    id: session.id,
    customer_email: session.customer_email,
    amount_total: session.amount_total,
    currency: session.currency,
  });
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  
  // In a real application, you would:
  // 1. Update payment status in your database
  // 2. Send payment confirmation
  // 3. Trigger fulfillment processes
  
  console.log('Payment details:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  });
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Payment intent failed:', paymentIntent.id);
  
  // In a real application, you would:
  // 1. Update payment status in your database
  // 2. Send failure notification
  // 3. Handle retry logic
  
  console.log('Failed payment details:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    last_payment_error: paymentIntent.last_payment_error,
  });
}

async function handleProductCreated(product: any) {
  console.log('Product created:', product.id);
  
  // In a real application, you would:
  // 1. Sync product data to your database
  // 2. Update search indexes
  // 3. Send notifications to relevant users
  
  console.log('Product details:', {
    id: product.id,
    name: product.name,
    active: product.active,
  });
}

async function handleProductUpdated(product: any) {
  console.log('Product updated:', product.id);
  
  // In a real application, you would:
  // 1. Update product data in your database
  // 2. Update search indexes
  // 3. Handle inventory changes
  
  console.log('Updated product details:', {
    id: product.id,
    name: product.name,
    active: product.active,
  });
}
