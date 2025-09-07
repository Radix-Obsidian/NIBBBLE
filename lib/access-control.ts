import { supabaseAdmin } from './supabase/client';

export interface AccessControlConfig {
  // Capacity-based throttling
  maxCapacity: number;
  warningThreshold: number; // percentage (e.g., 0.6 for 60%)
  throttleThreshold: number; // percentage (e.g., 0.8 for 80%)
  
  // Geographic controls
  allowedCountries: string[];
  allowedTimezones: string[];
  
  // Rate limiting
  maxSignupsPerMinute: number;
  maxSignupsPerHour: number;
  
  // Quality controls
  minProfileCompleteness: number; // percentage
}

export interface AccessControlMetrics {
  totalUsers: number;
  activeUsers: number;
  capacityUsed: number;
  recentSignups: number;
  avgTimeToFirstRecipe: number;
  avgTimeToFirstCook: number;
  feedbackQualityScore: number;
}

export interface AccessControlDecision {
  allowed: boolean;
  reason: string;
  requiresWaitlist: boolean;
  estimatedWaitTime?: number;
  alternativeAction?: string;
}

export class AccessControlService {
  private static config: AccessControlConfig = {
    maxCapacity: 10000, // Total system capacity
    warningThreshold: 0.6, // 60% - start monitoring closely
    throttleThreshold: 0.8, // 80% - switch to waitlist
    allowedCountries: ['US', 'CA', 'GB', 'AU', 'NZ', 'IE'], // English-speaking markets
    allowedTimezones: [
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
      'America/Toronto', 'Europe/London', 'Europe/Dublin', 
      'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland'
    ],
    maxSignupsPerMinute: 10,
    maxSignupsPerHour: 100,
    minProfileCompleteness: 0.7 // 70% of profile fields completed
  };

  static async checkAccess(
    userLocation: { country?: string; timezone?: string; ip?: string },
    profileData: any
  ): Promise<AccessControlDecision> {
    try {
      // 1. Check geographic restrictions first
      const geoCheck = await this.checkGeographicAccess(userLocation);
      if (!geoCheck.allowed) {
        return geoCheck;
      }

      // 2. Check capacity limits
      const capacityCheck = await this.checkCapacityLimits();
      if (!capacityCheck.allowed) {
        return capacityCheck;
      }

      // 3. Check rate limits
      const rateCheck = await this.checkRateLimits(userLocation.ip);
      if (!rateCheck.allowed) {
        return rateCheck;
      }

      // 4. Check profile quality (soft requirement)
      const qualityCheck = this.checkProfileQuality(profileData);
      
      // Grant instant access
      return {
        allowed: true,
        reason: 'Instant access granted - all checks passed',
        requiresWaitlist: false
      };

    } catch (error) {
      console.error('Access control check failed:', error);
      
      // Fail gracefully - grant access if system is down
      return {
        allowed: true,
        reason: 'Access granted - system check unavailable',
        requiresWaitlist: false
      };
    }
  }

  private static async checkGeographicAccess(
    location: { country?: string; timezone?: string }
  ): Promise<AccessControlDecision> {
    // If we can't determine location, allow access
    if (!location.country && !location.timezone) {
      return {
        allowed: true,
        reason: 'Location undetermined - access granted',
        requiresWaitlist: false
      };
    }

    // Check country allowlist
    if (location.country && !this.config.allowedCountries.includes(location.country)) {
      return {
        allowed: false,
        reason: `Service not yet available in ${location.country}`,
        requiresWaitlist: true,
        estimatedWaitTime: 30, // days
        alternativeAction: 'Join the waitlist for early access when we expand to your region'
      };
    }

    // Check timezone compatibility (for support hours)
    if (location.timezone && !this.config.allowedTimezones.includes(location.timezone)) {
      // Allow access but note support limitations
      return {
        allowed: true,
        reason: 'Access granted with limited support hours',
        requiresWaitlist: false
      };
    }

    return {
      allowed: true,
      reason: 'Geographic access approved',
      requiresWaitlist: false
    };
  }

  private static async checkCapacityLimits(): Promise<AccessControlDecision> {
    const metrics = await this.getCurrentMetrics();
    
    const capacityPercentage = metrics.totalUsers / this.config.maxCapacity;
    
    if (capacityPercentage >= this.config.throttleThreshold) {
      return {
        allowed: false,
        reason: `System at ${Math.round(capacityPercentage * 100)}% capacity`,
        requiresWaitlist: true,
        estimatedWaitTime: this.calculateWaitTime(metrics),
        alternativeAction: 'Join the waitlist - we\'ll notify you when capacity opens'
      };
    }

    if (capacityPercentage >= this.config.warningThreshold) {
      // Log warning but still allow access
      console.warn(`System at ${Math.round(capacityPercentage * 100)}% capacity - monitoring closely`);
    }

    return {
      allowed: true,
      reason: `Capacity available (${Math.round(capacityPercentage * 100)}% used)`,
      requiresWaitlist: false
    };
  }

  private static async checkRateLimits(ip?: string): Promise<AccessControlDecision> {
    if (!ip) {
      return {
        allowed: true,
        reason: 'Rate limit check skipped - IP unavailable',
        requiresWaitlist: false
      };
    }

    // Check recent signups from this IP
    const recentSignups = await this.getRecentSignups(ip);
    
    if (recentSignups.perMinute > this.config.maxSignupsPerMinute) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded - too many signups per minute',
        requiresWaitlist: true,
        estimatedWaitTime: 0, // Can retry in a few minutes
        alternativeAction: 'Please wait a few minutes before trying again'
      };
    }

    if (recentSignups.perHour > this.config.maxSignupsPerHour) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded - too many signups per hour',
        requiresWaitlist: true,
        estimatedWaitTime: 0,
        alternativeAction: 'Please try again in an hour'
      };
    }

    return {
      allowed: true,
      reason: 'Rate limits passed',
      requiresWaitlist: false
    };
  }

  private static checkProfileQuality(profileData: any): AccessControlDecision {
    const requiredFields = ['email', 'name', 'type'];
    const optionalFields = ['social_handle', 'cooking_experience', 'specialty', 'goals'];
    
    const completedRequired = requiredFields.filter(field => 
      profileData[field] && profileData[field].trim().length > 0
    ).length;
    
    const completedOptional = optionalFields.filter(field => 
      profileData[field] && profileData[field].trim().length > 0
    ).length;
    
    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = completedRequired + completedOptional;
    const completeness = completedFields / totalFields;
    
    // Always allow access, but track quality for metrics
    return {
      allowed: true,
      reason: `Profile completeness: ${Math.round(completeness * 100)}%`,
      requiresWaitlist: false
    };
  }

  private static async getCurrentMetrics(): Promise<AccessControlMetrics> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // Get total users from waitlist_entries (approved users)
    const { data: totalUsersData, error: totalUsersError } = await supabaseAdmin
      .from('waitlist_entries')
      .select('id', { count: 'exact' });

    if (totalUsersError) {
      console.error('Error getting total users:', totalUsersError);
    }

    const totalUsers = totalUsersData?.length || 0;

    // For now, use simple metrics - can be enhanced with real user activity tracking
    return {
      totalUsers,
      activeUsers: Math.round(totalUsers * 0.3), // Estimate 30% active
      capacityUsed: totalUsers / this.config.maxCapacity,
      recentSignups: 0, // TODO: Calculate from recent entries
      avgTimeToFirstRecipe: 180, // 3 minutes (target)
      avgTimeToFirstCook: 1440, // 24 hours (target)
      feedbackQualityScore: 0.8 // 80% (target)
    };
  }

  private static async getRecentSignups(ip: string): Promise<{ perMinute: number; perHour: number }> {
    // TODO: Implement IP-based signup tracking
    // For now, return conservative estimates
    return {
      perMinute: 0,
      perHour: 0
    };
  }

  private static calculateWaitTime(metrics: AccessControlMetrics): number {
    // Simple calculation based on current usage
    const overCapacity = metrics.totalUsers - (this.config.maxCapacity * this.config.throttleThreshold);
    const estimatedDays = Math.ceil(overCapacity / 100); // Assume 100 users churn per day
    return Math.max(1, estimatedDays);
  }

  // Admin methods for monitoring and configuration
  static async getSystemStatus(): Promise<{
    metrics: AccessControlMetrics;
    config: AccessControlConfig;
    alerts: string[];
  }> {
    const metrics = await this.getCurrentMetrics();
    const alerts: string[] = [];

    if (metrics.capacityUsed >= this.config.warningThreshold) {
      alerts.push(`System at ${Math.round(metrics.capacityUsed * 100)}% capacity`);
    }

    if (metrics.avgTimeToFirstRecipe > 300) { // > 5 minutes
      alerts.push('Time to first recipe exceeding target');
    }

    if (metrics.feedbackQualityScore < 0.7) { // < 70%
      alerts.push('Feedback quality below target');
    }

    return {
      metrics,
      config: this.config,
      alerts
    };
  }

  static async updateConfig(newConfig: Partial<AccessControlConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    console.log('Access control configuration updated:', newConfig);
  }

  // Emergency controls
  static async enableEmergencyWaitlist(reason: string): Promise<void> {
    await this.updateConfig({ throttleThreshold: 0 }); // Force waitlist for everyone
    console.warn(`Emergency waitlist activated: ${reason}`);
  }

  static async disableEmergencyWaitlist(): Promise<void> {
    await this.updateConfig({ throttleThreshold: 0.8 }); // Restore normal threshold
    console.info('Emergency waitlist deactivated');
  }
}