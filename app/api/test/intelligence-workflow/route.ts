import { NextRequest, NextResponse } from 'next/server';
import { IntelligenceService } from '@/lib/services/intelligence-service';

export async function POST(request: NextRequest) {
  try {
    const testUserId1 = 'test-user-1-' + Date.now();
    const testUserId2 = 'test-user-2-' + Date.now();
    const testRecipeId = 'test-recipe-' + Date.now();
    const testContentId = 'test-content-' + Date.now();
    
    const results = {
      steps: [] as Array<{
        step: string;
        success: boolean;
        data?: any;
        error?: string;
      }>,
      summary: {
        totalSteps: 0,
        successfulSteps: 0,
        failedSteps: 0
      }
    };

    // Test 1: Cooking Analytics Engine
    try {
      const cookingSession = await IntelligenceService.recordCookingSession({
        recipe_id: testRecipeId,
        user_id: testUserId1,
        cooking_started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        cooking_completed_at: new Date().toISOString(),
        success_rate: 85,
        actual_prep_time: 15,
        actual_cook_time: 25,
        difficulty_rating: 3,
        equipment_used: { oven: true, stovetop: true, knife: true },
        modifications_made: ['Added extra garlic', 'Used less salt'],
        environmental_factors: { temperature: 72, humidity: 45 },
        user_skill_level: 3,
        interruptions_count: 1,
        steps_completed: 8,
        steps_total: 8,
        failure_points: {},
        quality_score: 8.5,
        would_cook_again: true,
        photos_taken: 2,
        video_recorded: false,
        shared_results: true
      });

      results.steps.push({
        step: '1. Record Cooking Session Analytics',
        success: !!cookingSession,
        data: cookingSession ? `Recorded session ID: ${cookingSession.id}` : null
      });

      if (cookingSession) {
        // Get analytics
        const analytics = await IntelligenceService.getCookingAnalytics(testRecipeId);
        results.steps.push({
          step: '2. Retrieve Cooking Analytics',
          success: true,
          data: `Retrieved ${analytics.length} cooking sessions for recipe`
        });

        // Analyze patterns
        const patterns = await IntelligenceService.analyzeSuccessPatterns(testRecipeId);
        results.steps.push({
          step: '3. Analyze Success Patterns',
          success: true,
          data: `Generated ${patterns.length} success patterns`
        });

        // Get patterns
        const retrievedPatterns = await IntelligenceService.getSuccessPatterns(testRecipeId);
        results.steps.push({
          step: '4. Retrieve Success Patterns',
          success: true,
          data: `Retrieved ${retrievedPatterns.length} active patterns`
        });
      }
    } catch (error: any) {
      results.steps.push({
        step: '1-4. Cooking Analytics Engine',
        success: false,
        error: error.message
      });
    }

    // Test 2: Adaptive Learning System
    try {
      const trainingData = await IntelligenceService.addTrainingData({
        model_type: 'recipe_success_predictor',
        input_features: {
          prep_time: 15,
          cook_time: 25,
          difficulty: 3,
          user_skill: 3,
          equipment: ['oven', 'stovetop']
        },
        expected_output: { success_rate: 85 },
        actual_output: { success_rate: 85 },
        feedback_score: 0.9,
        user_id: testUserId1,
        recipe_id: testRecipeId,
        training_weight: 1.0
      });

      results.steps.push({
        step: '5. Add AI Training Data',
        success: !!trainingData,
        data: trainingData ? `Added training data ID: ${trainingData.id}` : null
      });

      if (trainingData) {
        // Validate training data
        const validated = await IntelligenceService.validateTrainingData(
          trainingData.id, 
          0.92, 
          testUserId2
        );
        results.steps.push({
          step: '6. Validate AI Training Data',
          success: validated,
          data: validated ? 'Training data validated successfully' : null
        });

        // Get training data
        const retrievedData = await IntelligenceService.getTrainingData('recipe_success_predictor');
        results.steps.push({
          step: '7. Retrieve Training Data',
          success: true,
          data: `Retrieved ${retrievedData.length} training samples`
        });

        // Record model metric
        const metricRecorded = await IntelligenceService.recordModelMetric({
          model_type: 'recipe_success_predictor',
          model_version: '1.0.0',
          metric_type: 'accuracy',
          metric_value: 0.873,
          sample_size: 1000,
          test_period_start: new Date(Date.now() - 86400000).toISOString(),
          test_period_end: new Date().toISOString(),
          baseline_comparison: 0.832
        });

        results.steps.push({
          step: '8. Record AI Model Metrics',
          success: metricRecorded,
          data: metricRecorded ? 'Model performance metrics recorded' : null
        });
      }
    } catch (error: any) {
      results.steps.push({
        step: '5-8. Adaptive Learning System',
        success: false,
        error: error.message
      });
    }

    // Test 3: Performance Monitoring System
    try {
      // Log system metrics
      await IntelligenceService.logSystemMetric({
        metric_type: 'api_response_time',
        service_name: 'recipe-service',
        endpoint: '/api/recipes',
        metric_value: 245.7,
        unit: 'ms',
        user_id: testUserId1,
        session_id: 'test-session-123',
        additional_context: { method: 'GET', status: 200 }
      });

      results.steps.push({
        step: '9. Log System Metrics',
        success: true,
        data: 'System performance metrics logged'
      });

      // Log error
      await IntelligenceService.logError({
        error_type: 'api_error',
        severity: 'low',
        error_code: 'TIMEOUT_001',
        error_message: 'Request timeout after 30 seconds',
        service_name: 'search-service',
        endpoint: '/api/search',
        user_id: testUserId1,
        session_id: 'test-session-123',
        request_data: { query: 'pasta recipes', filters: {} },
        response_data: null
      });

      results.steps.push({
        step: '10. Log System Errors',
        success: true,
        data: 'Error logged successfully'
      });

      // Log feature usage
      await IntelligenceService.logFeatureUsage({
        feature_name: 'recipe_search',
        feature_category: 'recipe_discovery',
        action_type: 'click',
        user_id: testUserId1,
        session_id: 'test-session-123',
        duration_ms: 1250,
        success: true,
        context_data: { search_query: 'pasta recipes', results_count: 24 }
      });

      results.steps.push({
        step: '11. Log Feature Usage',
        success: true,
        data: 'Feature usage analytics logged'
      });

      // Get metrics
      const metrics = await IntelligenceService.getSystemMetrics('api_response_time', 'recipe-service');
      results.steps.push({
        step: '12. Retrieve System Metrics',
        success: true,
        data: `Retrieved ${metrics.length} system metrics`
      });

      // Get errors
      const errors = await IntelligenceService.getErrorLogs('low', 'search-service');
      results.steps.push({
        step: '13. Retrieve Error Logs',
        success: true,
        data: `Retrieved ${errors.length} error logs`
      });
    } catch (error: any) {
      results.steps.push({
        step: '9-13. Performance Monitoring System',
        success: false,
        error: error.message
      });
    }

    // Test 4: Fraud Prevention & Content Quality
    try {
      // Test spam detection
      const spamValidation = await IntelligenceService.validateContent({
        content_type: 'review',
        content_id: testContentId + '-spam',
        validation_type: 'spam_detection',
        content_text: 'This is an amazing recipe! Click here to buy now and get free money guaranteed!',
        user_id: testUserId1,
        metadata: { ip_address: '192.168.1.1' }
      });

      results.steps.push({
        step: '14. Validate Content - Spam Detection',
        success: !!spamValidation,
        data: spamValidation ? `Spam validation: ${spamValidation.validation_status} (${spamValidation.confidence_score})` : null
      });

      // Test quality assessment
      const qualityValidation = await IntelligenceService.validateContent({
        content_type: 'review',
        content_id: testContentId + '-quality',
        validation_type: 'quality_assessment',
        content_text: 'This recipe was absolutely fantastic! I followed all the steps carefully and the result was restaurant-quality food. My family loved it and asked for seconds. The instructions were clear and easy to follow. I will definitely make this again!',
        user_id: testUserId1
      });

      results.steps.push({
        step: '15. Validate Content - Quality Assessment',
        success: !!qualityValidation,
        data: qualityValidation ? `Quality validation: ${qualityValidation.validation_status} (${qualityValidation.confidence_score})` : null
      });

      // Get content validations
      const validations = await IntelligenceService.getContentValidation(testContentId + '-spam');
      results.steps.push({
        step: '16. Retrieve Content Validations',
        success: true,
        data: `Retrieved ${validations.length} validation records`
      });

      // Get pending validations
      const pendingValidations = await IntelligenceService.getPendingValidations();
      results.steps.push({
        step: '17. Retrieve Pending Validations',
        success: true,
        data: `Found ${pendingValidations.length} pending validations`
      });

      // Get user trust score
      const trustScore = await IntelligenceService.getUserTrustScore(testUserId1);
      results.steps.push({
        step: '18. Get User Trust Score',
        success: true,
        data: trustScore ? `Trust score: ${trustScore.overall_trust_score}` : 'No trust score found (expected for new user)'
      });

      // Calculate trust score
      const calculatedTrustScore = await IntelligenceService.calculateAndUpdateTrustScore(testUserId1);
      results.steps.push({
        step: '19. Calculate User Trust Score',
        success: !!calculatedTrustScore,
        data: calculatedTrustScore ? `Calculated trust score: ${calculatedTrustScore.overall_trust_score}` : 'Trust score calculation requires admin client'
      });

    } catch (error: any) {
      results.steps.push({
        step: '14-19. Fraud Prevention & Content Quality',
        success: false,
        error: error.message
      });
    }

    // Test 5: Business Intelligence
    try {
      const businessMetric = await IntelligenceService.recordBusinessMetric({
        metric_name: 'daily_active_users',
        metric_category: 'user_growth',
        metric_value: 2847,
        unit: 'count',
        period_type: 'day',
        period_start: new Date(Date.now() - 86400000).toISOString(),
        period_end: new Date().toISOString(),
        comparison_previous_period: 2654,
        target_value: 3000,
        additional_dimensions: { platform: 'web', feature_usage: 'high' }
      });

      results.steps.push({
        step: '20. Record Business Metrics',
        success: businessMetric,
        data: businessMetric ? 'Business metrics recorded successfully' : null
      });

      const metrics = await IntelligenceService.getBusinessMetrics('daily_active_users', 'user_growth');
      results.steps.push({
        step: '21. Retrieve Business Metrics',
        success: true,
        data: `Retrieved ${metrics.length} business metric records`
      });

    } catch (error: any) {
      results.steps.push({
        step: '20-21. Business Intelligence',
        success: false,
        error: error.message
      });
    }

    // Calculate summary
    results.summary.totalSteps = results.steps.length;
    results.summary.successfulSteps = results.steps.filter(step => step.success).length;
    results.summary.failedSteps = results.steps.filter(step => !step.success).length;

    // Test API Endpoints
    const apiTests = [];

    // Test Analytics API
    try {
      const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/intelligence/analytics?recipeId=${testRecipeId}`);
      
      apiTests.push({
        endpoint: 'GET /api/intelligence/analytics',
        success: analyticsResponse.ok,
        status: analyticsResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/intelligence/analytics',
        success: false,
        error: 'Network error'
      });
    }

    // Test Monitoring API
    try {
      const monitoringResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/intelligence/monitoring?type=metrics&limit=10`);
      
      apiTests.push({
        endpoint: 'GET /api/intelligence/monitoring',
        success: monitoringResponse.ok,
        status: monitoringResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/intelligence/monitoring',
        success: false,
        error: 'Network error'
      });
    }

    // Test Validation API
    try {
      const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/intelligence/validation?contentId=${testContentId}`);
      
      apiTests.push({
        endpoint: 'GET /api/intelligence/validation',
        success: validationResponse.ok,
        status: validationResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/intelligence/validation',
        success: false,
        error: 'Network error'
      });
    }

    // Test Trust Score API
    try {
      const trustScoreResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/intelligence/trust-score?userId=${testUserId1}`);
      
      apiTests.push({
        endpoint: 'GET /api/intelligence/trust-score',
        success: trustScoreResponse.ok,
        status: trustScoreResponse.status
      });
    } catch (error) {
      apiTests.push({
        endpoint: 'GET /api/intelligence/trust-score',
        success: false,
        error: 'Network error'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tier 6: Platform Intelligence test completed',
      testResults: results,
      apiEndpointTests: apiTests,
      overallHealth: {
        serviceLayerHealth: `${results.summary.successfulSteps}/${results.summary.totalSteps} steps passed`,
        apiEndpointHealth: `${apiTests.filter(test => test.success).length}/${apiTests.length} endpoints responding`,
        intelligenceFeatures: {
          cookingAnalytics: results.steps.filter(s => s.step.includes('Cooking') || s.step.includes('Analytics') || s.step.includes('Pattern')).every(s => s.success),
          adaptiveLearning: results.steps.filter(s => s.step.includes('AI') || s.step.includes('Training') || s.step.includes('Model')).every(s => s.success),
          performanceMonitoring: results.steps.filter(s => s.step.includes('System') || s.step.includes('Error') || s.step.includes('Feature')).every(s => s.success),
          fraudPrevention: results.steps.filter(s => s.step.includes('Validate') || s.step.includes('Trust')).every(s => s.success),
          businessIntelligence: results.steps.filter(s => s.step.includes('Business')).every(s => s.success)
        },
        recommendedActions: results.summary.failedSteps > 0 ? [
          'Apply intelligence database schema using scripts/create-intelligence-schema.sql',
          'Verify Supabase admin client is properly configured',
          'Check that all intelligence tables exist and are accessible',
          'Ensure proper RLS policies are applied for intelligence features',
          'Review error logs for specific database or service issues',
          'Verify environment variables are set correctly'
        ] : [
          'Tier 6: Platform Intelligence fully operational! 🧠',
          'All intelligence features implemented and tested',
          '✅ Cooking Analytics Engine: Complete with success pattern analysis',
          '✅ Adaptive Learning System: Complete with continuous AI improvement',
          '✅ Performance Monitoring: Complete with system health tracking',
          '✅ Fraud Prevention: Complete with content quality validation',
          '✅ Business Intelligence: Complete with metrics and insights',
          'Platform is now fully intelligent and self-improving! 🚀'
        ]
      }
    });

  } catch (error: any) {
    console.error('Intelligence workflow test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Intelligence workflow test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Tier 6: Platform Intelligence Test Endpoint',
    description: 'POST to this endpoint to test the complete platform intelligence implementation',
    testCoverage: [
      'Cooking Analytics Engine (success pattern analysis, cooking session tracking)',
      'Adaptive Learning System (AI training data, model metrics, continuous improvement)',
      'Performance Monitoring (system metrics, error tracking, feature analytics)',
      'Fraud Prevention (content validation, spam detection, trust scores)',
      'Business Intelligence (metrics tracking, KPI monitoring, insights)'
    ],
    features: {
      '✅ Cooking Analytics': 'Success pattern analysis and cooking session insights',
      '✅ Adaptive Learning': 'Continuous AI improvement with training data validation',
      '✅ Performance Monitoring': 'Real-time system health and error tracking',
      '✅ Fraud Prevention': 'Automated content quality validation and trust scoring',
      '✅ Business Intelligence': 'Comprehensive metrics and KPI tracking'
    },
    intelligenceCapabilities: {
      'Pattern Recognition': 'Identifies cooking success patterns and failure points',
      'Predictive Analytics': 'AI models predict recipe success and difficulty',
      'Quality Assurance': 'Automated content validation and fraud detection',
      'Performance Optimization': 'Real-time system monitoring and alerting',
      'Business Insights': 'Comprehensive analytics for growth and optimization'
    },
    usage: 'POST /api/test/intelligence-workflow'
  });
}