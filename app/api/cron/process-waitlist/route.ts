import { NextRequest, NextResponse } from 'next/server';
import { IntelligentWaitlistService } from '@/lib/intelligent-waitlist';
import { AccessControlService } from '@/lib/access-control';
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config';

// This endpoint will be called by a cron job (Vercel Cron or external service)
// to automatically process the waitlist and approve eligible users
export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.info('🤖 [CRON] Starting automated waitlist processing...');

    // Get system status first
    const systemStatus = await AccessControlService.getSystemStatus();
    
    console.info('📊 [CRON] System status:', {
      capacityUsed: Math.round(systemStatus.metrics.capacityUsed * 100),
      totalUsers: systemStatus.metrics.totalUsers,
      alerts: systemStatus.alerts.length
    });

    // Process waitlist for auto-approvals
    const result = await IntelligentWaitlistService.processWaitlist();
    
    console.info('✅ [CRON] Waitlist processing completed:', result);

    // Get analytics for reporting
    const analytics = await IntelligentWaitlistService.getAnalytics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processing: result,
      system: {
        capacityUsed: systemStatus.metrics.capacityUsed,
        totalUsers: systemStatus.metrics.totalUsers,
        alerts: systemStatus.alerts
      },
      waitlist: {
        pending: analytics.totals.pending,
        approved: analytics.totals.approved,
        total: analytics.totals.total,
        autoApprovalRate: analytics.systemHealth.autoApprovalRate
      },
      message: `Processed ${result.processed} entries, approved ${result.approved}, ${result.stillPending} still pending`
    });

  } catch (error) {
    console.error('❌ [CRON] Waitlist processing failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
});

// POST endpoint for manual trigger (with auth)
export const POST = withAppRouterHighlight(async function POST(request: NextRequest) {
  try {
    console.info('🔧 [MANUAL] Manual waitlist processing triggered...');

    // Same logic as GET but for manual triggers
    const result = await IntelligentWaitlistService.processWaitlist();
    const systemStatus = await AccessControlService.getSystemStatus();
    const analytics = await IntelligentWaitlistService.getAnalytics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      trigger: 'manual',
      processing: result,
      system: {
        capacityUsed: systemStatus.metrics.capacityUsed,
        totalUsers: systemStatus.metrics.totalUsers,
        alerts: systemStatus.alerts
      },
      waitlist: {
        pending: analytics.totals.pending,
        approved: analytics.totals.approved,
        total: analytics.totals.total
      }
    });

  } catch (error) {
    console.error('❌ [MANUAL] Manual processing failed:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
});