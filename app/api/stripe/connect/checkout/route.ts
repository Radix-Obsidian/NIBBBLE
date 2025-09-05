import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/connect';

/**
 * POST /api/stripe/connect/checkout
 * Creates a checkout session for a connected account with application fee
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      accountId, 
      lineItems, 
      applicationFeeAmount,
      successUrl,
      cancelUrl 
    } = await request.json();

    // Validate required fields
    if (!accountId || !lineItems || !applicationFeeAmount) {
      return NextResponse.json(
        { error: 'Account ID, line items, and application fee amount are required' },
        { status: 400 }
      );
    }

    // Get the base URL for redirects if not provided
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const finalSuccessUrl = successUrl || `${baseUrl}/stripe/connect/checkout/success`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/stripe/connect/checkout/cancel`;

    // Create checkout session with application fee
    const session = await createCheckoutSession(
      accountId,
      lineItems,
      applicationFeeAmount,
      finalSuccessUrl,
      finalCancelUrl
    );

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        url: session.url,
      }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
