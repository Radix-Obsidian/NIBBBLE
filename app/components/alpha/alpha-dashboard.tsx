'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Star, 
  MessageSquare,
  Brain,
  Target,
  Zap,
  Settings
} from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '@/hooks/useAuth'
import { alphaMetrics, AlphaMetrics } from '@/lib/monitoring/alpha-metrics'
import { alphaFeedback } from '@/lib/feedback/alpha-feedback'
import { logger } from '@/lib/logger'

interface AlertData {
  type: 'performance' | 'success_rate' | 'error_rate' | 'user_feedback'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: Date
}

export function AlphaDashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<AlphaMetrics | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Real-time data fetching
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [metricsData, alertsData, feedbackData] = await Promise.all([
        alphaMetrics.getAlphaMetrics(timeRange),
        alphaMetrics.getCriticalAlerts(),
        alphaFeedback.getFeedbackAnalytics(timeRange === '1h' ? '24h' : timeRange)
      ])

      setMetrics(metricsData)
      setAlerts(alertsData.alerts)
      setFeedbackAnalytics(feedbackData)
    } catch (err) {
      logger.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  // Auto-refresh effect
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchDashboardData()
    }, timeRange === '1h' ? 30000 : 60000) // 30s for 1h, 1min for others

    return () => clearInterval(interval)
  }, [autoRefresh, fetchDashboardData, timeRange])

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    )
  }

  if (!metrics) return null

  // Chart colors
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  
  // Prepare chart data
  const successRateData = [
    { name: 'Success Rate', value: metrics.cookingSuccessRate * 100, target: 75 },
    { name: 'Completion Rate', value: (metrics.cookingSessions.completed / metrics.cookingSessions.total) * 100, target: 80 }
  ]

  const userEngagementData = [
    { name: 'Daily Active', value: metrics.dailyActiveUsers },
    { name: 'Weekly Active', value: metrics.weeklyActiveUsers },
    { name: 'Total Alpha', value: metrics.totalAlphaUsers }
  ]

  const aiFeatureUsageData = [
    { name: 'Recipe Adaptation', value: metrics.aiFeatureUsage.recipeAdaptations },
    { name: 'Cooking Assistant', value: metrics.aiFeatureUsage.cookingAssistantSessions },
    { name: 'Success Prediction', value: metrics.aiFeatureUsage.successPredictions }
  ]

  const retentionData = [
    { period: 'Day 1', rate: metrics.userRetention.day1 * 100 },
    { period: 'Day 7', rate: metrics.userRetention.day7 * 100 },
    { period: 'Day 14', rate: metrics.userRetention.day14 * 100 }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getMetricStatus = (value: number, target: number, higherIsBetter: boolean = true) => {
    const percentage = higherIsBetter ? (value / target) : (target / value)
    if (percentage >= 1) return { status: 'good', color: 'text-green-600' }
    if (percentage >= 0.8) return { status: 'warning', color: 'text-yellow-600' }
    return { status: 'critical', color: 'text-red-600' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alpha Launch Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of alpha launch metrics and user success rates
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button size="sm" onClick={fetchDashboardData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800">Critical Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs mt-1">
                      Current: {alert.value} | Threshold: {alert.threshold}
                    </p>
                  </div>
                  <span className="text-xs bg-white px-2 py-1 rounded">
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Success Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className={`text-xs font-medium ${getMetricStatus(metrics.cookingSuccessRate * 100, 75).color}`}>
              {getMetricStatus(metrics.cookingSuccessRate * 100, 75).status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {(metrics.cookingSuccessRate * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Cooking Success Rate</p>
            <p className="text-xs text-gray-500">Target: 75%</p>
          </div>
        </Card>

        {/* Active Users */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{metrics.dailyActiveUsers}</p>
            <p className="text-sm text-gray-600">Daily Active Users</p>
            <p className="text-xs text-gray-500">
              {metrics.totalAlphaUsers} total alpha users
            </p>
          </div>
        </Card>

        {/* AI Usage */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="h-5 w-5 text-green-600" />
            <span className={`text-xs font-medium ${getMetricStatus(metrics.aiFeatureUsage.adaptationAcceptanceRate * 100, 80).color}`}>
              {(metrics.aiFeatureUsage.adaptationAcceptanceRate * 100).toFixed(0)}%
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {metrics.aiFeatureUsage.recipeAdaptations}
            </p>
            <p className="text-sm text-gray-600">AI Adaptations Used</p>
            <p className="text-xs text-gray-500">
              {(metrics.aiFeatureUsage.adaptationAcceptanceRate * 100).toFixed(0)}% acceptance rate
            </p>
          </div>
        </Card>

        {/* Average Rating */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className={`text-xs font-medium ${getMetricStatus(metrics.averageUserRating, 4.0).color}`}>
              {getMetricStatus(metrics.averageUserRating, 4.0).status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {metrics.averageUserRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Average User Rating</p>
            <p className="text-xs text-gray-500">Target: 4.0+</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate vs Target</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Rate']} />
                <Bar dataKey="value" fill="#8b5cf6" />
                <Bar dataKey="target" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Retention */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Retention</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Retention']} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Features Usage */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Features Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiFeatureUsageData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {aiFeatureUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.aiFeatureUsage.recipeAdaptations}
                </p>
                <p className="text-sm text-gray-600">Recipe Adaptations</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.aiFeatureUsage.cookingAssistantSessions}
                </p>
                <p className="text-sm text-gray-600">Assistant Sessions</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Key Insights:</p>
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                <li>• Recipe adaptation is the most popular AI feature</li>
                <li>• {(metrics.aiFeatureUsage.adaptationAcceptanceRate * 100).toFixed(0)}% of users accept AI adaptations</li>
                <li>• Cooking assistant shows high engagement</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className={`text-xs font-medium ${getMetricStatus(500, metrics.performance.averageAiResponseTime, false).color}`}>
              {getMetricStatus(500, metrics.performance.averageAiResponseTime, false).status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {metrics.performance.averageAiResponseTime}ms
            </p>
            <p className="text-sm text-gray-600">AI Response Time</p>
            <p className="text-xs text-gray-500">Target: &lt; 500ms</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-green-600" />
            <span className={`text-xs font-medium ${getMetricStatus(2500, metrics.performance.averagePageLoad, false).color}`}>
              {getMetricStatus(2500, metrics.performance.averagePageLoad, false).status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {(metrics.performance.averagePageLoad / 1000).toFixed(1)}s
            </p>
            <p className="text-sm text-gray-600">Page Load Time</p>
            <p className="text-xs text-gray-500">Target: &lt; 2.5s</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className={`text-xs font-medium ${getMetricStatus(metrics.performance.uptime * 100, 99.9).color}`}>
              {getMetricStatus(metrics.performance.uptime * 100, 99.9).status.toUpperCase()}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {(metrics.performance.uptime * 100).toFixed(2)}%
            </p>
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-xs text-gray-500">Target: 99.9%</p>
          </div>
        </Card>
      </div>

      {/* Feedback Summary */}
      {feedbackAnalytics && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Feedback Insights</h3>
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {feedbackAnalytics.overallSatisfaction.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">Overall Satisfaction</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {feedbackAnalytics.aiHelpfulnessScore.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600">AI Helpfulness</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {feedbackAnalytics.commonIssues.length}
              </p>
              <p className="text-sm text-gray-600">Common Issues</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {feedbackAnalytics.criticalFeedback.length}
              </p>
              <p className="text-sm text-gray-600">Critical Feedback</p>
            </div>
          </div>
          
          {/* Top Issues */}
          {feedbackAnalytics.commonIssues.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Most Common Issues</h4>
              <div className="space-y-2">
                {feedbackAnalytics.commonIssues.slice(0, 5).map((issue: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{issue.issue}</span>
                    <span className="text-xs font-medium text-gray-500">{issue.frequency} reports</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-500">
        Dashboard updates every {timeRange === '1h' ? '30 seconds' : '1 minute'} • 
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}