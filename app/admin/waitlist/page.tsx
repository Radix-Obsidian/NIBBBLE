'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, User, Mail, Calendar, Filter, 
  TrendingUp, Users, UserCheck, UserX, BarChart3, Activity,
  Globe, Target, Zap, Eye, MousePointer, Heart
} from 'lucide-react';
import { SentryFeedbackButton } from '@/app/components/common/sentry-feedback-button';
import type { WaitlistEntry } from '@/lib/waitlist';

interface MetricsData {
  totalSignups: number;
  totalApproved: number;
  totalRejected: number;
  pendingCount: number;
  creatorCount: number;
  cookerCount: number;
  approvalRate: number;
  rejectionRate: number;
  dailySignups: Array<{ date: string; count: number }>;
  weeklyTrend: Array<{ week: string; signups: number; approvals: number }>;
  topCountries: Array<{ country: string; count: number }>;
  conversionFunnel: {
    visitors: number;
    signups: number;
    approved: number;
    active: number;
  };
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'entries' | 'analytics'>('overview');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'creator' | 'cooker'>('all');

  useEffect(() => {
    fetchWaitlistEntries();
    fetchMetrics();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchWaitlistEntries();
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchWaitlistEntries = async () => {
    try {
      const response = await fetch('/api/waitlist');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'creator' || filter === 'cooker') return entry.type === filter;
    return entry.status === filter;
  });

  const updateStatus = async (email: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, status }),
      });

      if (response.ok) {
        fetchWaitlistEntries();
        fetchMetrics(); // Refresh metrics after status change
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f97316]"></div>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: { value: number; isPositive: boolean };
    color?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend.value}% from last week
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage waitlist and track live metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Activity className="h-4 w-4" />
                <span>Live updates every 30s</span>
              </div>
              <SentryFeedbackButton variant="outline" size="sm" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'entries', label: 'Waitlist Entries', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#f97316] text-[#f97316]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Signups"
                value={metrics.totalSignups}
                icon={Users}
                color="blue"
                trend={{ value: 12, isPositive: true }}
              />
              <MetricCard
                title="Approved Users"
                value={metrics.totalApproved}
                icon={UserCheck}
                color="green"
                trend={{ value: 8, isPositive: true }}
              />
              <MetricCard
                title="Pending Review"
                value={metrics.pendingCount}
                icon={Clock}
                color="yellow"
              />
              <MetricCard
                title="Approval Rate"
                value={`${metrics.approvalRate}%`}
                icon={Target}
                color="purple"
                trend={{ value: 5, isPositive: true }}
              />
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Conversion Funnel</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Visitors', value: metrics.conversionFunnel.visitors, icon: Eye, color: 'gray' },
                  { label: 'Signups', value: metrics.conversionFunnel.signups, icon: MousePointer, color: 'blue' },
                  { label: 'Approved', value: metrics.conversionFunnel.approved, icon: UserCheck, color: 'green' },
                  { label: 'Active', value: metrics.conversionFunnel.active, icon: Heart, color: 'red' }
                ].map((step, index) => (
                  <div key={step.label} className="text-center">
                    <div className={`inline-flex p-3 rounded-full bg-${step.color}-100 mb-2`}>
                      <step.icon className={`h-6 w-6 text-${step.color}-600`} />
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{step.value}</p>
                    <p className="text-sm text-gray-600">{step.label}</p>
                    {index < 3 && (
                      <div className="mt-2 text-xs text-gray-400">
                        {Math.round((metrics.conversionFunnel[Object.keys(metrics.conversionFunnel)[index + 1] as keyof typeof metrics.conversionFunnel] / step.value) * 100)}% conversion
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* User Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Type Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Creators</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{metrics.creatorCount}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((metrics.creatorCount / metrics.totalSignups) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Cookers</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{metrics.cookerCount}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((metrics.cookerCount / metrics.totalSignups) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{metrics.totalApproved}</div>
                      <div className="text-xs text-gray-500">{metrics.approvalRate}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{metrics.pendingCount}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((metrics.pendingCount / metrics.totalSignups) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">Rejected</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{metrics.totalRejected}</div>
                      <div className="text-xs text-gray-500">{metrics.rejectionRate}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && metrics && (
          <div className="space-y-8">
            {/* Daily Signups Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Daily Signups Trend</h3>
              <div className="h-64 flex items-end space-x-2">
                {metrics.dailySignups.slice(-14).map((day, index) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-[#f97316] rounded-t w-full mb-2 transition-all duration-300 hover:bg-[#d97706]"
                      style={{ height: `${(day.count / Math.max(...metrics.dailySignups.map(d => d.count))) * 200}px` }}
                    ></div>
                    <div className="text-xs text-gray-500 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-medium text-gray-900 mt-1">{day.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Top Countries</h3>
              <div className="space-y-3">
                {metrics.topCountries.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{country.country}</span>
                    </div>
                    <div className="text-sm text-gray-600">{country.count} users</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Waitlist Entries Tab */}
        {activeTab === 'entries' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Waitlist Entries ({filteredEntries.length} of {entries.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                  >
                    <option value="all">All Entries</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="creator">Creators</option>
                    <option value="cooker">Cookers</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-[#f97316]/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-[#f97316]" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'creator' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.type === 'creator' ? 'Creator' : 'Cooker'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.status === 'approved' ? 'Approved' : 
                           entry.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(entry.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {entry.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateStatus(entry.email, 'approved')}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(entry.email, 'rejected')}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                        {entry.status === 'approved' && (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approved
                          </span>
                        )}
                        {entry.status === 'rejected' && (
                          <span className="text-red-600 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No waitlist entries</h3>
                <p className="mt-1 text-sm text-gray-500">No one has joined the waitlist yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
