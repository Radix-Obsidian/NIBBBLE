import { supabaseAdmin } from './supabase/client';
import { AccessControlService, type AccessControlDecision } from './access-control';
import type { Database } from './supabase/client';

export type WaitlistEntry = Database['public']['Tables']['waitlist_entries']['Row'];
export type WaitlistEntryInsert = Database['public']['Tables']['waitlist_entries']['Insert'];

export interface LocationData {
  country?: string;
  timezone?: string;
  ip?: string;
  userAgent?: string;
}

export interface SignupResult {
  success: boolean;
  entry?: WaitlistEntry;
  accessDecision: AccessControlDecision;
  nextSteps: string;
  estimatedWaitTime?: number;
}

export class IntelligentWaitlistService {
  /**
   * Main signup method that implements intelligent access control
   */
  static async signup(
    profileData: Omit<WaitlistEntryInsert, 'id' | 'submitted_at' | 'created_at' | 'updated_at'>,
    locationData: LocationData
  ): Promise<SignupResult> {
    try {
      // Check if user already exists
      const existingEntry = await this.getEntryByEmail(profileData.email);
      if (existingEntry) {
        return {
          success: false,
          entry: existingEntry,
          accessDecision: {
            allowed: false,
            reason: 'Email already registered',
            requiresWaitlist: existingEntry.status === 'pending'
          },
          nextSteps: existingEntry.status === 'approved' 
            ? 'You already have access! Check your email for login instructions.'
            : existingEntry.status === 'rejected'
            ? 'Your application was not approved. Please contact support if you believe this is an error.'
            : 'You\'re already on the waitlist. We\'ll notify you when access is available.',
          estimatedWaitTime: existingEntry.status === 'pending' ? 7 : undefined
        };
      }

      // Run access control checks
      const accessDecision = await AccessControlService.checkAccess(locationData, profileData);

      // Create waitlist entry regardless of decision (for tracking and future access)
      const entry = await this.createEntry({
        ...profileData,
        // Set status based on access decision
        status: accessDecision.allowed ? 'approved' : 'pending',
        // Set approval timestamp if instantly approved
        ...(accessDecision.allowed && { approved_at: new Date().toISOString() })
      });

      // Determine next steps
      let nextSteps: string;
      if (accessDecision.allowed) {
        nextSteps = '🎉 Welcome to NIBBBLE! You have instant access. Check your email for getting started guide.';
      } else if (accessDecision.requiresWaitlist) {
        nextSteps = accessDecision.alternativeAction || 'You\'ve been added to the waitlist. We\'ll notify you when access becomes available.';
      } else {
        nextSteps = 'Your application is being reviewed. We\'ll get back to you soon.';
      }

      return {
        success: true,
        entry,
        accessDecision,
        nextSteps,
        estimatedWaitTime: accessDecision.estimatedWaitTime
      };

    } catch (error) {
      console.error('Intelligent waitlist signup failed:', error);
      
      // Graceful fallback - create pending entry
      try {
        const entry = await this.createEntry({
          ...profileData,
          status: 'pending'
        });

        return {
          success: true,
          entry,
          accessDecision: {
            allowed: false,
            reason: 'System temporarily unavailable - added to waitlist',
            requiresWaitlist: true
          },
          nextSteps: 'You\'ve been added to our waitlist. We\'ll review your application and get back to you soon.',
          estimatedWaitTime: 7
        };
      } catch (fallbackError) {
        console.error('Fallback waitlist creation failed:', fallbackError);
        throw new Error('Unable to process signup at this time. Please try again later.');
      }
    }
  }

  /**
   * Get user's current status and next steps
   */
  static async getStatus(email: string): Promise<{
    status: 'not_found' | 'pending' | 'approved' | 'rejected';
    entry?: WaitlistEntry;
    nextSteps: string;
    estimatedWaitTime?: number;
  }> {
    const entry = await this.getEntryByEmail(email);
    
    if (!entry) {
      return {
        status: 'not_found',
        nextSteps: 'Sign up to join NIBBBLE and start cooking better!'
      };
    }

    let nextSteps: string;
    let estimatedWaitTime: number | undefined;

    switch (entry.status) {
      case 'approved':
        nextSteps = '🎉 You have access to NIBBBLE! Check your email for login instructions.';
        break;
      case 'rejected':
        nextSteps = 'Your application was not approved. Please contact support if you believe this is an error.';
        break;
      case 'pending':
      default:
        // Check if they can be auto-approved now
        const accessDecision = await AccessControlService.checkAccess(
          {}, // No location data for status check
          entry
        );
        
        if (accessDecision.allowed) {
          // Auto-approve them now!
          await this.approveEntry(entry.email);
          nextSteps = '🎉 Great news! You now have access to NIBBBLE. Check your email for getting started guide.';
          entry.status = 'approved';
        } else {
          nextSteps = 'You\'re on the waitlist. We\'ll notify you as soon as access becomes available.';
          estimatedWaitTime = accessDecision.estimatedWaitTime || 7;
        }
        break;
    }

    return {
      status: entry.status as any,
      entry,
      nextSteps,
      estimatedWaitTime
    };
  }

  /**
   * Process waitlist for auto-approvals based on current capacity
   */
  static async processWaitlist(): Promise<{
    processed: number;
    approved: number;
    stillPending: number;
  }> {
    try {
      const pendingEntries = await this.getEntriesByStatus('pending');
      let approved = 0;

      for (const entry of pendingEntries.slice(0, 100)) { // Process in batches
        const accessDecision = await AccessControlService.checkAccess({}, entry);
        
        if (accessDecision.allowed) {
          await this.approveEntry(entry.email);
          approved++;
          
          // TODO: Send approval email notification
          console.log(`Auto-approved waitlist entry: ${entry.email}`);
        } else {
          // Stop processing if we've hit capacity limits
          if (accessDecision.reason.includes('capacity')) {
            break;
          }
        }
      }

      const stillPending = await this.getEntriesByStatus('pending');

      return {
        processed: pendingEntries.length,
        approved,
        stillPending: stillPending.length
      };
    } catch (error) {
      console.error('Waitlist processing failed:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive waitlist analytics
   */
  static async getAnalytics(): Promise<{
    totals: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
    trends: {
      signupsToday: number;
      approvalsToday: number;
      avgWaitTime: number; // hours
    };
    demographics: {
      creators: number;
      cookers: number;
      topCountries: Array<{ country: string; count: number }>;
    };
    systemHealth: {
      capacityUsed: number;
      autoApprovalRate: number;
      avgTimeToFirstCook: number;
    };
  }> {
    try {
      // Get status totals
      const [pending, approved, rejected, total] = await Promise.all([
        this.getEntriesByStatus('pending'),
        this.getEntriesByStatus('approved'),
        this.getEntriesByStatus('rejected'),
        this.getAllEntries()
      ]);

      // Calculate today's metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysEntries = total.filter(entry => 
        new Date(entry.submitted_at) >= today
      );
      
      const todaysApprovals = approved.filter(entry => 
        entry.approved_at && new Date(entry.approved_at) >= today
      );

      // Calculate average wait time for approved entries
      const waitTimes = approved
        .filter(entry => entry.approved_at)
        .map(entry => {
          const submitted = new Date(entry.submitted_at);
          const approved = new Date(entry.approved_at!);
          return (approved.getTime() - submitted.getTime()) / (1000 * 60 * 60); // hours
        });
      
      const avgWaitTime = waitTimes.length > 0 
        ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length 
        : 0;

      // Get demographics
      const creators = total.filter(entry => entry.type === 'creator').length;
      const cookers = total.filter(entry => entry.type === 'cooker').length;

      // Get system health metrics
      const systemStatus = await AccessControlService.getSystemStatus();

      return {
        totals: {
          pending: pending.length,
          approved: approved.length,
          rejected: rejected.length,
          total: total.length
        },
        trends: {
          signupsToday: todaysEntries.length,
          approvalsToday: todaysApprovals.length,
          avgWaitTime
        },
        demographics: {
          creators,
          cookers,
          topCountries: [] // TODO: Implement country tracking
        },
        systemHealth: {
          capacityUsed: systemStatus.metrics.capacityUsed,
          autoApprovalRate: approved.length / total.length,
          avgTimeToFirstCook: systemStatus.metrics.avgTimeToFirstCook
        }
      };
    } catch (error) {
      console.error('Failed to get waitlist analytics:', error);
      throw error;
    }
  }

  // Core database operations (simplified from original WaitlistService)
  private static async createEntry(entry: Omit<WaitlistEntryInsert, 'id' | 'submitted_at' | 'created_at' | 'updated_at'>): Promise<WaitlistEntry> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Error creating waitlist entry:', error);
      throw new Error(`Failed to create waitlist entry: ${error.message}`);
    }

    return data;
  }

  private static async getEntryByEmail(email: string): Promise<WaitlistEntry | null> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting waitlist entry:', error);
      throw new Error(`Failed to get waitlist entry: ${error.message}`);
    }

    return data;
  }

  static async getAllEntries(): Promise<WaitlistEntry[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error getting all waitlist entries:', error);
      throw new Error(`Failed to get waitlist entries: ${error.message}`);
    }

    return data || [];
  }

  static async getEntriesByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<WaitlistEntry[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .select('*')
      .eq('status', status)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error getting waitlist entries by status:', error);
      throw new Error(`Failed to get waitlist entries: ${error.message}`);
    }

    return data || [];
  }

  static async approveEntry(email: string): Promise<boolean> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error('Error approving waitlist entry:', error);
      return false;
    }

    return !!data;
  }

  static async rejectEntry(email: string): Promise<boolean> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error('Error rejecting waitlist entry:', error);
      return false;
    }

    return !!data;
  }

  // Legacy methods for backward compatibility
  static async addEntry(entry: Omit<WaitlistEntryInsert, 'id' | 'submitted_at' | 'created_at' | 'updated_at'>): Promise<WaitlistEntry> {
    return this.createEntry(entry);
  }

  static async isOnWaitlist(email: string): Promise<boolean> {
    const entry = await this.getEntryByEmail(email);
    return entry !== null;
  }

  static async getWaitlistStatus(email: string): Promise<'not_found' | 'pending' | 'approved' | 'rejected'> {
    const entry = await this.getEntryByEmail(email);
    return entry ? entry.status : 'not_found';
  }
}