import { NextRequest, NextResponse } from 'next/server';
import { getAccountStatus } from '@/lib/stripe/connect';

/**
 * GET /api/stripe/connect/accounts/[accountId]
 * Retrieves the status of a specific connected account
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;

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
        // Include onboarding status
        onboarding_status: {
          can_receive_payments: account.charges_enabled,
          can_make_payouts: account.payouts_enabled,
          details_submitted: account.details_submitted,
          requirements: account.requirements,
        }
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
