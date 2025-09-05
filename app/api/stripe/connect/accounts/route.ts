import { NextRequest, NextResponse } from 'next/server';
import { createConnectedAccount, getAccountStatus } from '@/lib/stripe/connect';

/**
 * POST /api/stripe/connect/accounts
 * Creates a new connected account for a user
 */
export async function POST(request: NextRequest) {
  try {
    const { email, country = 'US' } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create the connected account
    const account = await createConnectedAccount(email, country);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        created: account.created,
        // Don't expose sensitive information
      }
    });

  } catch (error) {
    console.error('Error creating connected account:', error);
    return NextResponse.json(
      { error: 'Failed to create connected account' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/connect/accounts/[accountId]
 * Retrieves the status of a connected account
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Get the account status
    const account = await getAccountStatus(accountId);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
        created: account.created,
      }
    });

  } catch (error) {
    console.error('Error retrieving account status:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve account status' },
      { status: 500 }
    );
  }
}
