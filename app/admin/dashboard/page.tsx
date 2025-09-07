'use client';

import { useState, useEffect } from 'react';

interface SystemStatus {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    capacityUsed: number;
    recentSignups: number;
    avgTimeToFirstRecipe: number;
    avgTimeToFirstCook: number;
    feedbackQualityScore: number;
  };
  alerts: string[];
}

interface Analytics {
  totals: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  trends: {
    signupsToday: number;
    approvalsToday: number;
    avgWaitTime: number;
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
}

export default function AdminDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statusResponse, analyticsResponse] = await Promise.all([
        fetch('/api/access-control?action=status'),
        fetch('/api/waitlist?analytics=true')
      ]);

      if (!statusResponse.ok || !analyticsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statusData = await statusResponse.json();
      const analyticsData = await analyticsResponse.json();

      setSystemStatus(statusData.systemStatus);
      setAnalytics(analyticsData.analytics);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const processWaitlist = async () => {
    try {
      const response = await fetch('/api/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'processWaitlist' })
      });

      if (!response.ok) {
        throw new Error('Failed to process waitlist');
      }

      const data = await response.json();
      alert(`Waitlist processed: ${data.message}`);
      
      // Refresh data
      await fetchDashboardData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`);
    }
  };

  const toggleEmergencyWaitlist = async (enable: boolean) => {
    try {
      const response = await fetch('/api/access-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'emergencyWaitlist',
          enable,
          reason: enable ? 'Manual activation from dashboard' : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle emergency waitlist');
      }

      const data = await response.json();
      alert(data.message);
      
      // Refresh data
      await fetchDashboardData();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !systemStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-[#f97316] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const capacityPercentage = Math.round((systemStatus?.metrics.capacityUsed || 0) * 100);
  const isHighCapacity = capacityPercentage >= 80;
  const isWarningCapacity = capacityPercentage >= 60;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NIBBBLE Admin Dashboard</h1>
            <p className="text-gray-600">Intelligent Access Control & Monitoring</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated?.toLocaleTimeString()}
            </p>
            <button
              onClick={fetchDashboardData}
              className="text-[#f97316] hover:text-[#d97706] text-sm"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {systemStatus?.alerts && systemStatus.alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">System Alerts</h3>
            <ul className="text-red-700 space-y-1">
              {systemStatus.alerts.map((alert, index) => (
                <li key={index}>• {alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Capacity</h3>
            <div className="mt-2 flex items-baseline">
              <p className={`text-3xl font-semibold ${
                isHighCapacity ? 'text-red-600' : 
                isWarningCapacity ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {capacityPercentage}%
              </p>
              <p className="ml-2 text-sm text-gray-600">
                {systemStatus?.metrics.totalUsers || 0} users
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Auto-Approval Rate</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-blue-600">
                {Math.round((analytics?.systemHealth.autoApprovalRate || 0) * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Wait Time</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-purple-600">
                {analytics?.trends.avgWaitTime ? 
                  `${Math.round(analytics.trends.avgWaitTime)}h` : 
                  '0h'
                }
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Today's Signups</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-[#f97316]">
                {analytics?.trends.signupsToday || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Waitlist Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Waitlist Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Entries:</span>
                <span className="font-semibold">{analytics?.totals.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Approved:</span>
                <span className="font-semibold text-green-600">{analytics?.totals.approved || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Pending:</span>
                <span className="font-semibold text-yellow-600">{analytics?.totals.pending || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">Rejected:</span>
                <span className="font-semibold text-red-600">{analytics?.totals.rejected || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Creators:</span>
                <span className="font-semibold">{analytics?.demographics.creators || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cookers:</span>
                <span className="font-semibold">{analytics?.demographics.cookers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Controls</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={processWaitlist}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Process Waitlist
            </button>
            
            <button
              onClick={() => toggleEmergencyWaitlist(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Enable Emergency Waitlist
            </button>
            
            <button
              onClick={() => toggleEmergencyWaitlist(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Disable Emergency Waitlist
            </button>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics (Implementation Ready)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#f97316]">
                {Math.round(systemStatus?.metrics.avgTimeToFirstRecipe || 180 / 60)}min
              </p>
              <p className="text-gray-600">Avg Time to First Recipe</p>
              <p className="text-sm text-green-600">Target: &lt; 3min</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((systemStatus?.metrics.avgTimeToFirstCook || 1440) / 60)}h
              </p>
              <p className="text-gray-600">Avg Time to First Cook</p>
              <p className="text-sm text-green-600">Target: &lt; 24h</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((systemStatus?.metrics.feedbackQualityScore || 0.8) * 100)}%
              </p>
              <p className="text-gray-600">Feedback Quality Score</p>
              <p className="text-sm text-green-600">Target: &gt; 70%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}