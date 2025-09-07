import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { FEATURES } from '@/lib/config/features';
import { alphaUserManager } from '@/lib/auth/alpha-user-management';

interface InviteRequest {
  count?: number;
  criteria?: {
    prioritizeHighEngagement?: boolean;
    prioritizeEarlySignups?: boolean;
    prioritizeSpecificSources?: string[];
    skillLevels?: string[];
    userTypes?: ('creator' | 'cooker')[];
  };
  customEmails?: string[]; // For manual invitations
}

interface InviteResponse {
  success: boolean;
  invitesCreated: number;
  invites?: Array<{
    id: string;
    email: string;
    inviteCode: string;
    status: string;
    expiresAt: string;
  }>;
  capacity?: {
    current: number;
    limit: number;
    available: number;
  };
  waitlistStatus?: {
    totalWaiting: number;
    readyForInvite: number;
  };
  error?: string;
}

interface InviteValidationResponse {
  valid: boolean;
  invite?: {
    id: string;
    email: string;
    inviteCode: string;
    status: string;
    expiresAt: string;
    expired: boolean;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!FEATURES.alphaMode) {
      return NextResponse.json({
        error: 'Alpha mode is not enabled'
      }, { status: 404 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    const body: InviteRequest = await request.json();
    const { count = 1, criteria = {}, customEmails = [] } = body;

    // Check current capacity
    const capacityCheck = await alphaUserManager.canAcceptNewAlphaUsers();
    
    if (!capacityCheck.canAccept) {
      return NextResponse.json({
        success: false,
        error: capacityCheck.reason,
        capacity: {
          current: FEATURES.alphaUserLimit - (capacityCheck.waitlistPosition || 0),
          limit: FEATURES.alphaUserLimit,
          available: 0
        }
      }, { status: 409 });
    }

    let invites = [];
    
    if (customEmails.length > 0) {
      // Manual invitation process
      invites = await createManualInvites(customEmails);
    } else {
      // Automated invitation from waitlist
      invites = await alphaUserManager.inviteFromWaitlist(count, criteria);
    }

    // Get updated capacity info
    const { data: currentAlphaUsers, error: capacityError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_alpha_user', true)
      .in('alpha_status', ['active', 'pending']);

    const currentCount = currentAlphaUsers || 0;

    // Get waitlist status
    const { count: waitlistCount } = await supabaseAdmin
      .from('waitlist_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const response: InviteResponse = {
      success: true,
      invitesCreated: invites.length,
      invites: invites.map(invite => ({
        id: invite.id,
        email: invite.email,
        inviteCode: invite.inviteCode,
        status: invite.status,
        expiresAt: invite.expiresAt.toISOString()
      })),
      capacity: {
        current: currentCount,
        limit: FEATURES.alphaUserLimit,
        available: FEATURES.alphaUserLimit - currentCount
      },
      waitlistStatus: {
        totalWaiting: waitlistCount || 0,
        readyForInvite: Math.min(waitlistCount || 0, FEATURES.alphaUserLimit - currentCount)
      }
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'X-Invites-Created': invites.length.toString(),
        'X-Alpha-Capacity': `${currentCount}/${FEATURES.alphaUserLimit}`
      }
    });

  } catch (error) {
    console.error('Alpha invite creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create alpha invites',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to validate invite codes or check invite status
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const inviteCode = searchParams.get('code');
    const email = searchParams.get('email');
    const action = searchParams.get('action') || 'validate';

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    if (action === 'validate' && inviteCode) {
      // Validate specific invite code
      const { data: invite, error } = await supabaseAdmin
        .from('alpha_invites')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (error || !invite) {
        const response: InviteValidationResponse = {
          valid: false,
          error: 'Invalid invite code'
        };
        return NextResponse.json(response, { status: 404 });
      }

      const expired = new Date() > new Date(invite.expires_at);

      const response: InviteValidationResponse = {
        valid: !expired && invite.status === 'sent',
        invite: {
          id: invite.id,
          email: invite.email,
          inviteCode: invite.invite_code,
          status: invite.status,
          expiresAt: invite.expires_at,
          expired
        }
      };

      return NextResponse.json(response);
    }

    if (action === 'status' && email) {
      // Check invite status for specific email
      const { data: invite, error } = await supabaseAdmin
        .from('alpha_invites')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !invite) {
        return NextResponse.json({
          hasInvite: false,
          email,
          message: 'No invite found for this email'
        });
      }

      return NextResponse.json({
        hasInvite: true,
        email,
        invite: {
          status: invite.status,
          sentAt: invite.sent_at,
          expiresAt: invite.expires_at,
          expired: new Date() > new Date(invite.expires_at)
        }
      });
    }

    if (action === 'list') {
      // List all invites (admin function)
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');
      const status = searchParams.get('status');

      let query = supabaseAdmin
        .from('alpha_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: invites, error } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        invites: invites || [],
        pagination: { limit, offset, total: invites?.length || 0 }
      });
    }

    return NextResponse.json({
      error: 'Invalid action or missing parameters',
      validActions: ['validate', 'status', 'list'],
      requiredParams: {
        validate: ['code'],
        status: ['email'],
        list: []
      }
    }, { status: 400 });

  } catch (error) {
    console.error('Alpha invite GET error:', error);
    
    return NextResponse.json({
      error: 'Failed to process invite request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH endpoint to update invite status or resend invites
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { inviteCode, action, email } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Database connection not available'
      }, { status: 503 });
    }

    if (action === 'resend' && inviteCode) {
      // Resend invite email
      const { data: invite, error } = await supabaseAdmin
        .from('alpha_invites')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (error || !invite) {
        return NextResponse.json({
          error: 'Invite not found'
        }, { status: 404 });
      }

      if (invite.status === 'activated') {
        return NextResponse.json({
          error: 'Invite already activated'
        }, { status: 400 });
      }

      // Check if expired, extend if necessary
      const now = new Date();
      const expiresAt = new Date(invite.expires_at);
      let updateData: any = {
        reminders_sent: invite.reminders_sent + 1,
        updated_at: now.toISOString()
      };

      if (now > expiresAt) {
        // Extend expiration by 7 days
        updateData.expires_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        updateData.status = 'sent'; // Reset status if it was expired
      }

      const { error: updateError } = await supabaseAdmin
        .from('alpha_invites')
        .update(updateData)
        .eq('invite_code', inviteCode);

      if (updateError) {
        throw updateError;
      }

      // TODO: Implement actual email sending logic here
      console.log('Invite resent:', { email: invite.email, inviteCode });

      return NextResponse.json({
        success: true,
        message: 'Invite resent successfully',
        inviteCode,
        email: invite.email,
        newExpiresAt: updateData.expires_at || invite.expires_at
      });
    }

    if (action === 'expire' && inviteCode) {
      // Manually expire an invite
      const { error } = await supabaseAdmin
        .from('alpha_invites')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('invite_code', inviteCode);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Invite expired successfully',
        inviteCode
      });
    }

    return NextResponse.json({
      error: 'Invalid action',
      validActions: ['resend', 'expire']
    }, { status: 400 });

  } catch (error) {
    console.error('Alpha invite PATCH error:', error);
    
    return NextResponse.json({
      error: 'Failed to update invite',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function for manual invites
async function createManualInvites(emails: string[]) {
  const invites = [];
  
  for (const email of emails) {
    // Check if email already has an invite
    const { data: existingInvite, error: checkError } = await supabaseAdmin
      .from('alpha_invites')
      .select('*')
      .eq('email', email)
      .eq('status', 'sent')
      .single();

    if (existingInvite) {
      continue; // Skip if already has pending invite
    }

    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const inviteData = {
      email,
      invite_code: inviteCode,
      invited_by: 'admin',
      status: 'sent',
      expires_at: expiresAt.toISOString(),
      sent_at: new Date().toISOString(),
      reminders_sent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('alpha_invites')
      .insert(inviteData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create manual invite for', email, error);
      continue;
    }

    invites.push({
      id: data.id,
      email: data.email,
      inviteCode: data.invite_code,
      status: data.status,
      expiresAt: new Date(data.expires_at)
    });

    // TODO: Send invitation email
    console.log('Manual invite created:', { email, inviteCode });
  }

  return invites;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}