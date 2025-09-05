import { NextRequest, NextResponse } from 'next/server';
import { createAccountLink } from '@/lib/stripe/connect';

/**
 * POST /api/stripe/connect/onboarding
 * Creates an account link for onboarding a connected account
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId } = await request.json();

    // Validate required fields
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create account link for onboarding
    const accountLink = await createAccountLink(
      accountId,
      `${baseUrl}/stripe/connect/onboarding/refresh`, // Refresh URL
      `${baseUrl}/stripe/connect/onboarding/success`  // Return URL
    );

    return NextResponse.json({
      success: true,
      accountLink: {
        url: accountLink.url,
        expires_at: accountLink.expires_at,
      }
    });

  } catch (error) {
    console.error('Error creating account link:', error);
    return NextResponse.json(
      { error: 'Failed to create account link' },
      { status: 500 }
    );
  }
}
