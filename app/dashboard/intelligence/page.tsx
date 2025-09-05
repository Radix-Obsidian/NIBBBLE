'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Shield, Brain, Activity, Users, 
  AlertTriangle, CheckCircle, Clock, Target, Zap, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';

interface AnalyticsData {
  totalSessions: number;
  avgSuccessRate: number;
  avgCookingTime: number;
  topFailurePoints: string[];
  recentPatterns: any[];
}

interface MonitoringData {
  systemHealth: number;
  errorRate: number;
  avgResponseTime: number;
  recentErrors: any[];
  recentMetrics: any[];
}

interface ValidationData {
  totalValidations: number;
  pendingReviews: number;
  automatedApprovals: number;
  flaggedContent: number;
}

export default function IntelligenceDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // This would load real data in production
      // For now, we'll simulate the data
      
      setAnalyticsData({
        totalSessions: 2847,
        avgSuccessRate: 84.2,
        avgCookingTime: 42.5,
        topFailurePoints: ['Step 3: Timing', 'Step 7: Temperature', 'Step 2: Prep'],
        recentPatterns: [
          { type: 'time_optimization', improvement: 12.3, recipes: 45 },
          { type: 'equipment_preference', improvement: 8.7, recipes: 23 },
          { type: 'modification_trend', improvement: 15.1, recipes: 67 }
        ]
      });

      setMonitoringData({
        systemHealth: 98.5,
        errorRate: 0.12,
        avgResponseTime: 245,
        recentErrors: [
          { type: 'api_error', severity: 'low', count: 3, service: 'recipe-search' },
          { type: 'database_error', severity: 'medium', count: 1, service: 'user-auth' }
        ],
        recentMetrics: [
          { name: 'API Response Time', value: 245, unit: 'ms', status: 'good' },
          { name: 'Database Query Time', value: 89, unit: 'ms', status: 'excellent' },
          { name: 'Search Latency', value: 156, unit: 'ms', status: 'good' },
          { name: 'User Session Duration', value: 18.3, unit: 'min', status: 'excellent' }
        ]
      });

      setValidationData({
        totalValidations: 1567,
        pendingReviews: 23,
        automatedApprovals: 1489,
        flaggedContent: 55
      });

    } catch (error) {
      console.error('Load dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the intelligence dashboard.</p>
          <Button onClick={() => window.location.href = '/signin'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Cooking Analytics', icon: TrendingUp },
    { id: 'monitoring', label: 'System Health', icon: Activity },
    { id: 'validation', label: 'Content Quality', icon: Shield },
    { id: 'learning', label: 'AI Learning', icon: Brain },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intelligence Dashboard</h1>
          <p className="text-gray-600">
            Platform analytics, monitoring, and AI intelligence insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            System Healthy
          </Badge>
          <Badge className="bg-[#f97316]/10 text-[#f97316]">
            AI Learning Active
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#f97316] text-white'
                  : 'text-gray-600 hover:text-[#f97316] hover:bg-[#f97316]/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-[#f97316]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {analyticsData?.avgSuccessRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">Avg Success Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {monitoringData?.systemHealth.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">System Health</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {validationData?.totalValidations}
                        </p>
                        <p className="text-sm text-gray-600">Content Validations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {analyticsData?.recentPatterns.length}
                        </p>
                        <p className="text-sm text-gray-600">AI Patterns Found</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Success Patterns</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analyticsData?.recentPatterns.map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {pattern.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {pattern.recipes} recipes analyzed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{pattern.improvement}%
                          </p>
                          <p className="text-xs text-gray-500">improvement</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>System Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {monitoringData?.recentMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            metric.status === 'excellent' ? 'bg-green-500' :
                            metric.status === 'good' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-gray-700">{metric.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{metric.value} {metric.unit}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Cooking Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-[#f97316]">
                      {analyticsData?.totalSessions.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Across all recipes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Cooking Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {analyticsData?.avgCookingTime} min
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Including prep time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {analyticsData?.avgSuccessRate}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Platform average</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Common Failure Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.topFailurePoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <span className="font-medium text-gray-900">{point}</span>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>System Health</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {monitoringData?.systemHealth}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span>Error Rate</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">
                      {monitoringData?.errorRate}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span>Avg Response</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-600">
                      {monitoringData?.avgResponseTime}ms
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monitoringData?.recentErrors.map((error, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={error.severity === 'high' ? 'destructive' : 'secondary'}>
                            {error.severity}
                          </Badge>
                          <span className="font-medium">{error.type}</span>
                          <span className="text-gray-600">in {error.service}</span>
                        </div>
                        <span className="text-gray-600">{error.count} occurrences</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === 'validation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{validationData?.totalValidations}</p>
                    <p className="text-sm text-gray-600">Total Validations</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{validationData?.pendingReviews}</p>
                    <p className="text-sm text-gray-600">Pending Reviews</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{validationData?.automatedApprovals}</p>
                    <p className="text-sm text-gray-600">Auto Approved</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{validationData?.flaggedContent}</p>
                    <p className="text-sm text-gray-600">Flagged Content</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Content Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">High Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '78%' }} />
                        </div>
                        <span className="text-sm text-gray-600">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Medium Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '18%' }} />
                        </div>
                        <span className="text-sm text-gray-600">18%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Low Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '4%' }} />
                        </div>
                        <span className="text-sm text-gray-600">4%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Learning Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5" />
                      <span>Model Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Recipe Success Predictor</span>
                      <Badge className="bg-green-100 text-green-800">87.3% accuracy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Difficulty Estimator</span>
                      <Badge className="bg-green-100 text-green-800">82.1% accuracy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Time Predictor</span>
                      <Badge className="bg-yellow-100 text-yellow-800">74.8% accuracy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Quality Validator</span>
                      <Badge className="bg-green-100 text-green-800">91.2% accuracy</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Training Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Training Data Collected</span>
                        <span className="text-sm font-medium">12,847 samples</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#f97316] h-2 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Data Validation</span>
                        <span className="text-sm font-medium">89.2% validated</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Model Updates</span>
                        <span className="text-sm font-medium">3 this week</span>
                      </div>
                      <Badge className="bg-[#f97316]/10 text-[#f97316]">Active Learning</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}