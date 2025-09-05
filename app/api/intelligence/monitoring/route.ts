import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceService } from '@/lib/services/intelligence-service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, metricData, errorData, featureData } = data;

    if (type === 'metric') {
      await IntelligenceService.logSystemMetric(metricData);
      return NextResponse.json({ success: true, message: 'Metric logged' });
    } 
    
    else if (type === 'error') {
      await IntelligenceService.logError(errorData);
      return NextResponse.json({ success: true, message: 'Error logged' });
    }
    
    else if (type === 'feature') {
      await IntelligenceService.logFeatureUsage(featureData);
      return NextResponse.json({ success: true, message: 'Feature usage logged' });
    }
    
    else {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: metric, error, feature' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const metricType = searchParams.get('metricType');
    const serviceName = searchParams.get('serviceName');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Parse time range if provided
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const timeRange = (startTime && endTime) ? { start: startTime, end: endTime } : undefined;

    if (type === 'metrics') {
      const metrics = await IntelligenceService.getSystemMetrics(
        metricType || undefined,
        serviceName || undefined,
        timeRange,
        limit
      );

      return NextResponse.json({
        success: true,
        metrics,
        total: metrics.length
      });
    } 
    
    else if (type === 'errors') {
      const errors = await IntelligenceService.getErrorLogs(
        severity || undefined,
        serviceName || undefined,
        status || undefined,
        limit
      );

      return NextResponse.json({
        success: true,
        errors,
        total: errors.length
      });
    }
    
    else {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: metrics, errors' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Get monitoring data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}