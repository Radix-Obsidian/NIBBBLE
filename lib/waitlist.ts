import { supabaseAdmin } from './supabase/client';
import type { Database } from './supabase/client';

export type WaitlistEntry = Database['public']['Tables']['waitlist_entries']['Row'];
export type WaitlistEntryInsert = Database['public']['Tables']['waitlist_entries']['Insert'];
export type WaitlistEntryUpdate = Database['public']['Tables']['waitlist_entries']['Update'];

export class WaitlistService {
  static async addEntry(entry: Omit<WaitlistEntryInsert, 'id' | 'submitted_at' | 'created_at' | 'updated_at'>): Promise<WaitlistEntry> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Error adding waitlist entry:', error);
      throw new Error(`Failed to add waitlist entry: ${error.message}`);
    }

    return data;
  }

  static async getEntryByEmail(email: string): Promise<WaitlistEntry | null> {
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
        // No rows returned
        return null;
      }
      console.error('Error getting waitlist entry:', error);
      throw new Error(`Failed to get waitlist entry: ${error.message}`);
    }

    return data;
  }

  static async isOnWaitlist(email: string): Promise<boolean> {
    const entry = await this.getEntryByEmail(email);
    return entry !== null;
  }

  static async getWaitlistStatus(email: string): Promise<'not_found' | 'pending' | 'approved' | 'rejected'> {
    const entry = await this.getEntryByEmail(email);
    return entry ? entry.status : 'not_found';
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

  static async getEntriesByType(type: 'creator' | 'cooker'): Promise<WaitlistEntry[]> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    const { data, error } = await supabaseAdmin
      .from('waitlist_entries')
      .select('*')
      .eq('type', type)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error getting waitlist entries by type:', error);
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
}
