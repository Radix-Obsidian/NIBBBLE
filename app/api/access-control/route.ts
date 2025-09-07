import { NextRequest, NextResponse } from 'next/server';
import { AccessControlService } from '@/lib/access-control';
import { IntelligentWaitlistService } from '@/lib/intelligent-waitlist';
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config';

// GET - System status and monitoring dashboard
export const GET = withAppRouterHighlight(async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        // Get comprehensive system status
        const systemStatus = await AccessControlService.getSystemStatus();
        return NextResponse.json({
          success: true,
          systemStatus
        });

      case 'dashboard':
        // Get full dashboard data
        const [systemStatus2, analytics, waitlistStats] = await Promise.all([
          AccessControlService.getSystemStatus(),
          IntelligentWaitlistService.getAnalytics(),
          IntelligentWaitlistService.processWaitlist() // Also process any pending approvals
        ]);

        return NextResponse.json({
          success: true,
          dashboard: {
            system: systemStatus2,
            analytics,
            waitlistProcessing: waitlistStats,
            lastUpdated: new Date().toISOString()
          }
        });

      default:
        // Default to basic status
        const basicStatus = await AccessControlService.getSystemStatus();
        return NextResponse.json({
          success: true,
          status: 'operational',
          capacityUsed: basicStatus.metrics.capacityUsed,
          totalUsers: basicStatus.metrics.totalUsers,
          alerts: basicStatus.alerts
        });
    }

  } catch (error) {
    console.error('Access control GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get system status' },
      { status: 500 }
    );
  }
});

// POST - System configuration and emergency controls
export const POST = withAppRouterHighlight(async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // TODO: Add authentication for admin actions
    // For now, allow all actions for testing

    switch (action) {
      case 'updateConfig':
        await AccessControlService.updateConfig(params.config);
        return NextResponse.json({
          success: true,
          message: 'Configuration updated successfully'
        });

      case 'emergencyWaitlist':
        if (params.enable) {
          await AccessControlService.enableEmergencyWaitlist(params.reason);
          return NextResponse.json({
            success: true,
            message: `Emergency waitlist enabled: ${params.reason}`
          });
        } else {
          await AccessControlService.disableEmergencyWaitlist();
          return NextResponse.json({
            success: true,
            message: 'Emergency waitlist disabled'
          });
        }

      case 'processWaitlist':
        const result = await IntelligentWaitlistService.processWaitlist();
        return NextResponse.json({
          success: true,
          message: `Processed waitlist: ${result.approved} approved, ${result.stillPending} still pending`,
          result
        });

      case 'testAccess':
        // Test access control for given parameters
        const decision = await AccessControlService.checkAccess(
          params.location || {},
          params.profile || {}
        );
        return NextResponse.json({
          success: true,
          testResult: decision
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Access control POST error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
});

// PUT - Real-time capacity alerts and auto-scaling triggers
export const PUT = withAppRouterHighlight(async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics, alerts } = body;

    // This endpoint would be called by infrastructure monitoring
    // to update real-time capacity metrics and trigger auto-scaling

    console.info('📊 Real-time metrics update:', {
      timestamp: new Date().toISOString(),
      metrics,
      alerts
    });

    // Check if we need to trigger emergency controls
    if (metrics.capacityUsed > 0.9) { // 90% capacity
      await AccessControlService.enableEmergencyWaitlist('Capacity threshold exceeded');
    }

    // Check if we can lift emergency controls
    if (metrics.capacityUsed < 0.7) { // Below 70% capacity
      await AccessControlService.disableEmergencyWaitlist();
    }

    return NextResponse.json({
      success: true,
      message: 'Metrics updated successfully',
      actionsTriggered: metrics.capacityUsed > 0.9 ? ['emergency_waitlist'] : []
    });

  } catch (error) {
    console.error('Access control PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update metrics' },
      { status: 500 }
    );
  }
});