import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Types for Platform Intelligence
export interface CookingAnalytics {
  id: string;
  recipe_id: string;
  user_id: string;
  session_id: string;
  cooking_started_at: string;
  cooking_completed_at?: string;
  success_rate?: number;
  actual_prep_time?: number;
  actual_cook_time?: number;
  actual_total_time?: number;
  difficulty_rating?: number;
  equipment_used?: any;
  modifications_made?: string[];
  environmental_factors?: any;
  user_skill_level?: number;
  interruptions_count: number;
  steps_completed?: number;
  steps_total?: number;
  failure_points?: any;
  quality_score?: number;
  would_cook_again?: boolean;
  recommendation_score?: number;
  photos_taken: number;
  video_recorded: boolean;
  shared_results: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuccessPattern {
  id: string;
  recipe_id?: string;
  pattern_type: 'time_optimization' | 'equipment_preference' | 'skill_adaptation' | 
                'modification_trend' | 'seasonal_variance' | 'failure_prevention';
  pattern_data: any;
  confidence_score: number;
  sample_size: number;
  success_improvement?: number;
  last_calculated: string;
  is_active: boolean;
  created_at: string;
}

export interface AITrainingData {
  id: string;
  model_type: 'recipe_success_predictor' | 'difficulty_estimator' | 'time_predictor' |
              'substitution_suggester' | 'skill_assessor' | 'quality_validator';
  input_features: any;
  expected_output: any;
  actual_output?: any;
  feedback_score?: number;
  user_id?: string;
  recipe_id?: string;
  training_weight: number;
  is_validated: boolean;
  validation_score?: number;
  created_at: string;
  validated_at?: string;
}

export interface SystemMetric {
  id: string;
  metric_type: string;
  service_name: string;
  endpoint?: string;
  metric_value: number;
  unit: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  additional_context?: any;
}

export interface ErrorLog {
  id: string;
  error_type: 'api_error' | 'database_error' | 'validation_error' | 'auth_error' |
              'payment_error' | 'external_service_error' | 'ui_error' | 'logic_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  error_code?: string;
  error_message: string;
  stack_trace?: string;
  service_name: string;
  endpoint?: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  user_agent?: string;
  ip_address?: string;
  request_data?: any;
  response_data?: any;
  resolution_status: 'open' | 'investigating' | 'resolved' | 'ignored';
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface ContentValidation {
  id: string;
  content_type: 'recipe' | 'review' | 'thread_post' | 'profile' | 'comment' | 'image';
  content_id: string;
  validation_type: 'spam_detection' | 'quality_assessment' | 'authenticity_check' |
                   'safety_validation' | 'plagiarism_detection' | 'image_analysis';
  validation_status: 'pending' | 'approved' | 'flagged' | 'rejected' | 'needs_review';
  confidence_score: number;
  validation_details?: any;
  automated_flags?: any;
  human_review_required: boolean;
  reviewer_id?: string;
  reviewed_at?: string;
  review_notes?: string;
  appeal_status?: 'none' | 'submitted' | 'under_review' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
}

export interface UserTrustScore {
  id: string;
  user_id: string;
  overall_trust_score: number;
  content_quality_score: number;
  engagement_authenticity_score: number;
  community_reputation_score: number;
  verification_level: 'unverified' | 'email_verified' | 'phone_verified' | 'identity_verified' | 'expert_verified';
  flags_count: number;
  successful_contributions: number;
  community_endorsements: number;
  last_calculated: string;
  calculation_version: string;
  created_at: string;
  updated_at: string;
}

export class IntelligenceService {
  // =====================================================
  // Cooking Analytics Engine
  // =====================================================

  static async recordCookingSession(sessionData: {
    recipe_id: string;
    user_id: string;
    cooking_started_at: string;
    cooking_completed_at?: string;
    success_rate?: number;
    actual_prep_time?: number;
    actual_cook_time?: number;
    difficulty_rating?: number;
    equipment_used?: any;
    modifications_made?: string[];
    environmental_factors?: any;
    user_skill_level?: number;
    interruptions_count?: number;
    steps_completed?: number;
    steps_total?: number;
    failure_points?: any;
    quality_score?: number;
    would_cook_again?: boolean;
    photos_taken?: number;
    video_recorded?: boolean;
    shared_results?: boolean;
  }): Promise<CookingAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('cooking_analytics')
        .insert({
          id: uuidv4(),
          session_id: uuidv4(),
          actual_total_time: sessionData.actual_prep_time && sessionData.actual_cook_time 
            ? sessionData.actual_prep_time + sessionData.actual_cook_time 
            : undefined,
          interruptions_count: sessionData.interruptions_count || 0,
          photos_taken: sessionData.photos_taken || 0,
          video_recorded: sessionData.video_recorded || false,
          shared_results: sessionData.shared_results || false,
          ...sessionData
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger success pattern analysis
      await this.analyzeSuccessPatterns(sessionData.recipe_id);

      return data;
    } catch (error) {
      console.error('Record cooking session error:', error);
      return null;
    }
  }

  static async getCookingAnalytics(
    recipeId?: string, 
    userId?: string, 
    limit: number = 50
  ): Promise<CookingAnalytics[]> {
    try {
      let query = supabase
        .from('cooking_analytics')
        .select('*')
        .order('cooking_started_at', { ascending: false })
        .limit(limit);

      if (recipeId) query = query.eq('recipe_id', recipeId);
      if (userId) query = query.eq('user_id', userId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get cooking analytics error:', error);
      return [];
    }
  }

  static async analyzeSuccessPatterns(recipeId: string): Promise<SuccessPattern[]> {
    try {
      // Get recent cooking analytics for this recipe
      const analytics = await this.getCookingAnalytics(recipeId, undefined, 100);
      
      if (analytics.length < 5) return []; // Need minimum data for patterns

      const patterns: SuccessPattern[] = [];

      // Time Optimization Pattern
      const timeData = analytics.filter(a => a.actual_total_time && a.success_rate !== null);
      if (timeData.length >= 5) {
        const avgTime = timeData.reduce((sum, a) => sum + (a.actual_total_time || 0), 0) / timeData.length;
        const avgSuccess = timeData.reduce((sum, a) => sum + (a.success_rate || 0), 0) / timeData.length;
        
        patterns.push({
          id: uuidv4(),
          recipe_id: recipeId,
          pattern_type: 'time_optimization',
          pattern_data: {
            average_time: avgTime,
            success_correlation: avgSuccess,
            sample_sessions: timeData.length,
            time_recommendations: {
              prep_time: Math.round(avgTime * 0.3),
              cook_time: Math.round(avgTime * 0.7)
            }
          },
          confidence_score: Math.min(0.95, timeData.length / 20),
          sample_size: timeData.length,
          success_improvement: Math.max(0, avgSuccess - 75),
          last_calculated: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        });
      }

      // Equipment Preference Pattern
      const equipmentData = analytics.filter(a => a.equipment_used && a.success_rate !== null);
      if (equipmentData.length >= 3) {
        const equipmentSuccess: { [key: string]: number[] } = {};
        equipmentData.forEach(a => {
          Object.keys(a.equipment_used || {}).forEach(equipment => {
            if (!equipmentSuccess[equipment]) equipmentSuccess[equipment] = [];
            equipmentSuccess[equipment].push(a.success_rate || 0);
          });
        });

        const bestEquipment = Object.entries(equipmentSuccess)
          .map(([equipment, rates]) => ({
            equipment,
            avg_success: rates.reduce((a, b) => a + b, 0) / rates.length,
            usage_count: rates.length
          }))
          .sort((a, b) => b.avg_success - a.avg_success)
          .slice(0, 3);

        patterns.push({
          id: uuidv4(),
          recipe_id: recipeId,
          pattern_type: 'equipment_preference',
          pattern_data: {
            recommended_equipment: bestEquipment,
            equipment_impact: bestEquipment[0]?.avg_success - (bestEquipment[bestEquipment.length - 1]?.avg_success || 0)
          },
          confidence_score: Math.min(0.9, equipmentData.length / 15),
          sample_size: equipmentData.length,
          last_calculated: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        });
      }

      // Save patterns to database
      if (patterns.length > 0) {
        const { error } = await supabase
          .from('success_patterns')
          .upsert(patterns, { onConflict: 'recipe_id,pattern_type' });

        if (error) throw error;
      }

      return patterns;
    } catch (error) {
      console.error('Analyze success patterns error:', error);
      return [];
    }
  }

  static async getSuccessPatterns(recipeId?: string): Promise<SuccessPattern[]> {
    try {
      let query = supabase
        .from('success_patterns')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (recipeId) query = query.eq('recipe_id', recipeId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get success patterns error:', error);
      return [];
    }
  }

  // =====================================================
  // Adaptive Learning System
  // =====================================================

  static async addTrainingData(trainingData: {
    model_type: string;
    input_features: any;
    expected_output: any;
    actual_output?: any;
    feedback_score?: number;
    user_id?: string;
    recipe_id?: string;
    training_weight?: number;
  }): Promise<AITrainingData | null> {
    try {
      const { data, error } = await supabase
        .from('ai_training_data')
        .insert({
          id: uuidv4(),
          training_weight: trainingData.training_weight || 1.0,
          is_validated: false,
          ...trainingData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add training data error:', error);
      return null;
    }
  }

  static async validateTrainingData(
    trainingId: string, 
    validationScore: number, 
    validatorId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_training_data')
        .update({
          is_validated: true,
          validation_score: validationScore,
          validated_at: new Date().toISOString()
        })
        .eq('id', trainingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Validate training data error:', error);
      return false;
    }
  }

  static async getTrainingData(
    modelType: string, 
    validated?: boolean,
    limit: number = 100
  ): Promise<AITrainingData[]> {
    try {
      let query = supabase
        .from('ai_training_data')
        .select('*')
        .eq('model_type', modelType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (validated !== undefined) {
        query = query.eq('is_validated', validated);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get training data error:', error);
      return [];
    }
  }

  static async recordModelMetric(metricData: {
    model_type: string;
    model_version: string;
    metric_type: 'accuracy' | 'precision' | 'recall' | 'f1_score' | 'mae' | 'rmse' | 'user_satisfaction';
    metric_value: number;
    sample_size: number;
    test_period_start: string;
    test_period_end: string;
    baseline_comparison?: number;
  }): Promise<boolean> {
    try {
      const improvement = metricData.baseline_comparison 
        ? ((metricData.metric_value - metricData.baseline_comparison) / metricData.baseline_comparison) * 100
        : null;

      const { error } = await supabase
        .from('ai_model_metrics')
        .insert({
          id: uuidv4(),
          improvement_percentage: improvement,
          ...metricData
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Record model metric error:', error);
      return false;
    }
  }

  // =====================================================
  // Performance Monitoring
  // =====================================================

  static async logSystemMetric(metricData: {
    metric_type: string;
    service_name: string;
    endpoint?: string;
    metric_value: number;
    unit: string;
    user_id?: string;
    session_id?: string;
    user_agent?: string;
    ip_address?: string;
    additional_context?: any;
  }): Promise<void> {
    try {
      await supabase
        .from('system_metrics')
        .insert({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          ...metricData
        });
    } catch (error) {
      console.error('Log system metric error:', error);
    }
  }

  static async logError(errorData: {
    error_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    error_code?: string;
    error_message: string;
    stack_trace?: string;
    service_name: string;
    endpoint?: string;
    user_id?: string;
    session_id?: string;
    request_id?: string;
    user_agent?: string;
    ip_address?: string;
    request_data?: any;
    response_data?: any;
  }): Promise<void> {
    try {
      await supabase
        .from('error_logs')
        .insert({
          id: uuidv4(),
          resolution_status: 'open',
          ...errorData
        });
    } catch (error) {
      console.error('Log error error:', error);
    }
  }

  static async getSystemMetrics(
    metricType?: string,
    serviceName?: string,
    timeRange?: { start: string; end: string },
    limit: number = 100
  ): Promise<SystemMetric[]> {
    try {
      let query = supabase
        .from('system_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (metricType) query = query.eq('metric_type', metricType);
      if (serviceName) query = query.eq('service_name', serviceName);
      if (timeRange) {
        query = query
          .gte('timestamp', timeRange.start)
          .lte('timestamp', timeRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get system metrics error:', error);
      return [];
    }
  }

  static async getErrorLogs(
    severity?: string,
    serviceName?: string,
    status?: string,
    limit: number = 100
  ): Promise<ErrorLog[]> {
    try {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (severity) query = query.eq('severity', severity);
      if (serviceName) query = query.eq('service_name', serviceName);
      if (status) query = query.eq('resolution_status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get error logs error:', error);
      return [];
    }
  }

  static async logFeatureUsage(usageData: {
    feature_name: string;
    feature_category: 'recipe_discovery' | 'cooking_assistance' | 'social_interaction' | 
                     'commerce' | 'profile_management' | 'content_creation';
    action_type: 'view' | 'click' | 'submit' | 'share' | 'like' | 'comment' | 'purchase' | 'cancel';
    user_id?: string;
    session_id?: string;
    duration_ms?: number;
    success?: boolean;
    context_data?: any;
    a_b_test_variant?: string;
  }): Promise<void> {
    try {
      await supabase
        .from('feature_analytics')
        .insert({
          id: uuidv4(),
          success: usageData.success !== undefined ? usageData.success : true,
          timestamp: new Date().toISOString(),
          ...usageData
        });
    } catch (error) {
      console.error('Log feature usage error:', error);
    }
  }

  // =====================================================
  // Fraud Prevention & Content Quality
  // =====================================================

  static async validateContent(validationData: {
    content_type: 'recipe' | 'review' | 'thread_post' | 'profile' | 'comment' | 'image';
    content_id: string;
    validation_type: 'spam_detection' | 'quality_assessment' | 'authenticity_check' |
                     'safety_validation' | 'plagiarism_detection' | 'image_analysis';
    content_text?: string;
    user_id?: string;
    metadata?: any;
  }): Promise<ContentValidation | null> {
    try {
      // Perform basic validation checks
      let validationStatus: 'pending' | 'approved' | 'flagged' | 'rejected' | 'needs_review' = 'pending';
      let confidenceScore = 0.5;
      let automatedFlags: any = {};
      let humanReviewRequired = false;

      // Spam detection logic
      if (validationData.validation_type === 'spam_detection' && validationData.content_text) {
        const spamKeywords = ['buy now', 'click here', 'free money', 'guaranteed', 'limited time'];
        const spamCount = spamKeywords.filter(keyword => 
          validationData.content_text!.toLowerCase().includes(keyword)
        ).length;

        if (spamCount >= 2) {
          validationStatus = 'flagged';
          automatedFlags.spam_keywords = spamCount;
          humanReviewRequired = true;
        } else if (spamCount === 1) {
          validationStatus = 'needs_review';
          automatedFlags.spam_keywords = spamCount;
        } else {
          validationStatus = 'approved';
        }

        confidenceScore = Math.max(0.1, 1 - (spamCount / spamKeywords.length));
      }

      // Quality assessment logic
      else if (validationData.validation_type === 'quality_assessment' && validationData.content_text) {
        const wordCount = validationData.content_text.split(' ').length;
        const hasProperStructure = validationData.content_text.includes('.') || validationData.content_text.includes('!');
        
        if (wordCount < 10) {
          validationStatus = 'flagged';
          automatedFlags.insufficient_content = true;
        } else if (wordCount < 20 || !hasProperStructure) {
          validationStatus = 'needs_review';
          automatedFlags.low_quality_indicators = { wordCount, hasProperStructure };
        } else {
          validationStatus = 'approved';
        }

        confidenceScore = Math.min(0.95, Math.max(0.1, wordCount / 100));
      }

      // Default approval for other types (would be more sophisticated in production)
      else {
        validationStatus = 'approved';
        confidenceScore = 0.8;
      }

      const { data, error } = await supabase
        .from('content_validation')
        .insert({
          id: uuidv4(),
          content_type: validationData.content_type,
          content_id: validationData.content_id,
          validation_type: validationData.validation_type,
          validation_status: validationStatus,
          confidence_score: confidenceScore,
          validation_details: {
            content_length: validationData.content_text?.length,
            user_id: validationData.user_id,
            metadata: validationData.metadata
          },
          automated_flags: automatedFlags,
          human_review_required: humanReviewRequired,
          appeal_status: 'none'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Validate content error:', error);
      return null;
    }
  }

  static async getContentValidation(contentId: string): Promise<ContentValidation[]> {
    try {
      const { data, error } = await supabase
        .from('content_validation')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get content validation error:', error);
      return [];
    }
  }

  static async getUserTrustScore(userId: string): Promise<UserTrustScore | null> {
    try {
      const { data, error } = await supabase
        .from('user_trust_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Get user trust score error:', error);
      return null;
    }
  }

  static async calculateAndUpdateTrustScore(userId: string): Promise<UserTrustScore | null> {
    try {
      // This would trigger the database function
      if (!supabaseAdmin) return null;

      await supabaseAdmin.rpc('calculate_user_trust_score', { target_user_id: userId });

      // Return the updated score
      return await this.getUserTrustScore(userId);
    } catch (error) {
      console.error('Calculate trust score error:', error);
      return null;
    }
  }

  static async getPendingValidations(
    contentType?: string,
    validationType?: string,
    limit: number = 50
  ): Promise<ContentValidation[]> {
    try {
      let query = supabase
        .from('content_validation')
        .select('*')
        .in('validation_status', ['pending', 'needs_review'])
        .order('created_at', { ascending: true })
        .limit(limit);

      if (contentType) query = query.eq('content_type', contentType);
      if (validationType) query = query.eq('validation_type', validationType);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get pending validations error:', error);
      return [];
    }
  }

  // =====================================================
  // Business Intelligence
  // =====================================================

  static async recordBusinessMetric(metricData: {
    metric_name: string;
    metric_category: 'user_growth' | 'engagement' | 'content_creation' | 'revenue' | 
                    'retention' | 'acquisition' | 'satisfaction' | 'performance';
    metric_value: number;
    unit: string;
    period_type: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    period_start: string;
    period_end: string;
    comparison_previous_period?: number;
    target_value?: number;
    additional_dimensions?: any;
  }): Promise<boolean> {
    try {
      const growthRate = metricData.comparison_previous_period 
        ? ((metricData.metric_value - metricData.comparison_previous_period) / metricData.comparison_previous_period) * 100
        : null;

      const targetAchievement = metricData.target_value 
        ? (metricData.metric_value / metricData.target_value) * 100
        : null;

      const { error } = await supabase
        .from('business_metrics')
        .insert({
          id: uuidv4(),
          growth_rate: growthRate,
          target_achievement_rate: targetAchievement,
          ...metricData
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Record business metric error:', error);
      return false;
    }
  }

  static async getBusinessMetrics(
    metricName?: string,
    category?: string,
    periodType?: string,
    timeRange?: { start: string; end: string },
    limit: number = 100
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('business_metrics')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(limit);

      if (metricName) query = query.eq('metric_name', metricName);
      if (category) query = query.eq('metric_category', category);
      if (periodType) query = query.eq('period_type', periodType);
      if (timeRange) {
        query = query
          .gte('period_start', timeRange.start)
          .lte('period_end', timeRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get business metrics error:', error);
      return [];
    }
  }
}