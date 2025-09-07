import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, hasSupabaseAdmin, getSupabaseAdmin } from '@/lib/supabase/client';
import { FEATURES } from '@/lib/config/features';

interface HealthCheckResponse {
  ok: boolean;
  timestamp: string;
  environment: string;
  version: string;
  alpha: {
    enabled: boolean;
    userCount?: number;
    userLimit?: number;
    capacity?: string;
  };
  services: {
    database: {
      status: 'healthy' | 'degraded' | 'down';
      latency?: number;
      error?: string;
    };
    features: {
      totalEnabled: number;
      criticalFeatures: Record<string, boolean>;
    };
  };
  metrics: {
    totalSessions?: number;
    activeSessions?: number;
    avgSuccessRate?: number;
    aiFeatureUsage?: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthCheckResponse>> {
  const startTime = Date.now();
  
  try {
    // Initialize response object
    const healthResponse: HealthCheckResponse = {
      ok: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      alpha: {
        enabled: FEATURES.alphaMode,
        userLimit: FEATURES.alphaUserLimit,
      },
      services: {
        database: {
          status: 'healthy'
        },
        features: {
          totalEnabled: 0,
          criticalFeatures: {}
        }
      },
      metrics: {}
    };

    // Test database connectivity
    if (hasSupabaseAdmin()) {
      try {
        const dbStartTime = Date.now();
        const adminClient = getSupabaseAdmin();
        
        // Test basic connectivity with timeout
        const dbTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database timeout')), 5000) // 5s timeout
        })

        const dbQuery = adminClient
          .from('profiles')
          .select('id')
          .limit(1)
          .single()

        const { data: healthCheck, error: healthError } = await Promise.race([dbQuery, dbTimeout]) as any;

        const dbLatency = Date.now() - dbStartTime;
        healthResponse.services.database.latency = dbLatency;

        if (healthError && healthError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is acceptable for health check
          throw healthError;
        }

        // Get alpha user metrics if in alpha mode
        if (FEATURES.alphaMode) {
          const { count: alphaUserCount, error: countError } = await adminClient
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_alpha_user', true)
            .in('alpha_status', ['active', 'pending']);

          if (!countError) {
            healthResponse.alpha.userCount = alphaUserCount || 0;
            healthResponse.alpha.capacity = `${alphaUserCount || 0}/${FEATURES.alphaUserLimit}`;
          }

          // Get session metrics for alpha users
          const { data: sessionMetrics, error: metricsError } = await adminClient
            .from('cooking_sessions')
            .select('success_rating, status, ai_guidance_used')
            .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

          if (!metricsError && sessionMetrics) {
            const totalSessions = sessionMetrics.length;
            const activeSessions = sessionMetrics.filter(s => s.status === 'cooking').length;
            const successfulSessions = sessionMetrics.filter(s => s.success_rating >= 4).length;
            const aiSessions = sessionMetrics.filter(s => s.ai_guidance_used).length;

            healthResponse.metrics = {
              totalSessions,
              activeSessions,
              avgSuccessRate: totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0,
              aiFeatureUsage: totalSessions > 0 ? (aiSessions / totalSessions) * 100 : 0
            };
          }
        }

        // Database is healthy if latency is reasonable
        if (dbLatency > 1000) {
          healthResponse.services.database.status = 'degraded';
        }

      } catch (error) {
        console.error('Database health check failed:', error);
        healthResponse.services.database.status = 'down';
        healthResponse.services.database.error = error instanceof Error ? error.message : 'Unknown database error';
        healthResponse.ok = false;
      }
    } else {
      healthResponse.services.database.status = 'down';
      healthResponse.services.database.error = 'Supabase admin client not available';
      healthResponse.ok = false;
    }

    // Check critical feature flags
    const criticalFeatures = {
      aiRecipeAdaptation: FEATURES.enableAIRecipeAdaptation,
      cookingIntelligence: FEATURES.enableCookingIntelligence,
      feedbackSystem: FEATURES.enableFeedbackSystem,
      cookingAssistant: FEATURES.enableCookingAssistant,
      analytics: FEATURES.enableAnalytics,
      errorTracking: FEATURES.enableErrorTracking
    };

    healthResponse.services.features = {
      totalEnabled: Object.values(FEATURES).filter(Boolean).length,
      criticalFeatures
    };

    // Set appropriate HTTP status
    const httpStatus = healthResponse.ok ? 200 : 503;
    
    // Add response time
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(healthResponse, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Response-Time': `${responseTime}ms`
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse: HealthCheckResponse = {
      ok: false,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      alpha: {
        enabled: FEATURES.alphaMode,
        userLimit: FEATURES.alphaUserLimit,
      },
      services: {
        database: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Health check failed'
        },
        features: {
          totalEnabled: 0,
          criticalFeatures: {}
        }
      },
      metrics: {}
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// HEAD method for simple ping checks
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database ping
    if (hasSupabaseAdmin()) {
      const adminClient = getSupabaseAdmin();
      
      // Quick ping with timeout
      const pingTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Ping timeout')), 3000) // 3s timeout for HEAD
      })

      const pingQuery = adminClient
        .from('profiles')
        .select('id')
        .limit(1)
        .single()

      await Promise.race([pingQuery, pingTimeout]);
    }
    
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'X-Health': 'ok',
        'X-Timestamp': new Date().toISOString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Health': 'error',
        'X-Timestamp': new Date().toISOString()
      }
    });
  }
}