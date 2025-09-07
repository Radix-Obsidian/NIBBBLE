import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch all waitlist entries
    const { data: entries, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching waitlist entries:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Calculate metrics
    const totalSignups = entries.length;
    const totalApproved = entries.filter(entry => entry.status === 'approved').length;
    const totalRejected = entries.filter(entry => entry.status === 'rejected').length;
    const pendingCount = entries.filter(entry => entry.status === 'pending').length;
    const creatorCount = entries.filter(entry => entry.type === 'creator').length;
    const cookerCount = entries.filter(entry => entry.type === 'cooker').length;

    const approvalRate = totalSignups > 0 ? Math.round((totalApproved / totalSignups) * 100) : 0;
    const rejectionRate = totalSignups > 0 ? Math.round((totalRejected / totalSignups) * 100) : 0;

    // Generate daily signups data (last 30 days)
    const dailySignups = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = entries.filter(entry => {
        const entryDate = new Date(entry.submitted_at).toISOString().split('T')[0];
        return entryDate === dateStr;
      }).length;

      dailySignups.push({ date: dateStr, count });
    }

    // Generate weekly trend data (last 8 weeks)
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekStr = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      
      const signups = entries.filter(entry => {
        const entryDate = new Date(entry.submitted_at);
        return entryDate >= weekStart && entryDate <= weekEnd;
      }).length;

      const approvals = entries.filter(entry => {
        const entryDate = new Date(entry.submitted_at);
        return entryDate >= weekStart && entryDate <= weekEnd && entry.status === 'approved';
      }).length;

      weeklyTrend.push({ week: weekStr, signups, approvals });
    }

    // Mock geographic data (you can enhance this with real IP geolocation)
    const topCountries = [
      { country: 'United States', count: Math.floor(totalSignups * 0.4) },
      { country: 'Canada', count: Math.floor(totalSignups * 0.15) },
      { country: 'United Kingdom', count: Math.floor(totalSignups * 0.12) },
      { country: 'Australia', count: Math.floor(totalSignups * 0.08) },
      { country: 'Germany', count: Math.floor(totalSignups * 0.06) },
      { country: 'France', count: Math.floor(totalSignups * 0.05) },
      { country: 'Other', count: Math.floor(totalSignups * 0.14) }
    ].filter(country => country.count > 0);

    // Conversion funnel (mock data - you can enhance with real analytics)
    const conversionFunnel = {
      visitors: Math.floor(totalSignups * 25), // Assume 4% conversion rate
      signups: totalSignups,
      approved: totalApproved,
      active: Math.floor(totalApproved * 0.7) // Assume 70% of approved users are active
    };

    const metrics = {
      totalSignups,
      totalApproved,
      totalRejected,
      pendingCount,
      creatorCount,
      cookerCount,
      approvalRate,
      rejectionRate,
      dailySignups,
      weeklyTrend,
      topCountries,
      conversionFunnel
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
