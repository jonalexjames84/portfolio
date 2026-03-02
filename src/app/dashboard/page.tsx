'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DateRangeSelect } from '@/components/dashboard/DateRangeSelect'

interface PageViewSummary {
  totalPageViews: number
  uniqueVisitors: number
  pageViewsChange: number
  visitorsChange: number
}

interface TrafficSource {
  source: string
  visitors: number
  percentage: number
}

interface TopPage {
  path: string
  views: number
}

interface DeviceData {
  device: string
  visitors: number
  percentage: number
}

interface TrendPoint {
  date: string
  pageViews: number
  visitors: number
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<PageViewSummary>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    pageViewsChange: 0,
    visitorsChange: 0,
  })
  const [pageViews, setPageViews] = useState<TrendPoint[]>([])
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([])
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [devices, setDevices] = useState<DeviceData[]>([])

  const fetchDashboard = useCallback(async () => {
    const headers = { 'Content-Type': 'application/json' }
    const days = parseInt(dateRange)

    setLoading(true)
    try {
      const [pvRes, srcRes, pagesRes, devRes] = await Promise.all([
        fetch('/api/dashboard/posthog', {
          method: 'POST',
          headers,
          body: JSON.stringify({ queryType: 'websitePageViews', days }),
        }),
        fetch('/api/dashboard/posthog', {
          method: 'POST',
          headers,
          body: JSON.stringify({ queryType: 'websiteTrafficSources', days }),
        }),
        fetch('/api/dashboard/posthog', {
          method: 'POST',
          headers,
          body: JSON.stringify({ queryType: 'websiteTopPages', days }),
        }),
        fetch('/api/dashboard/posthog', {
          method: 'POST',
          headers,
          body: JSON.stringify({ queryType: 'websiteDevices', days }),
        }),
      ])

      if (pvRes.ok) {
        const data = await pvRes.json()
        setPageViews(data.trend || [])
        setSummary(data.summary || {})
      }
      if (srcRes.ok) {
        const data = await srcRes.json()
        setTrafficSources(data.sources || [])
      }
      if (pagesRes.ok) {
        const data = await pagesRes.json()
        setTopPages(data.pages || [])
      }
      if (devRes.ok) {
        const data = await devRes.json()
        setDevices(data.devices || [])
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  const { totalPageViews, uniqueVisitors, pageViewsChange, visitorsChange } = summary
  const pagesPerVisitor =
    uniqueVisitors > 0 ? (totalPageViews / uniqueVisitors).toFixed(1) : '0'
  const activeDays = pageViews.filter(
    (d) => d.pageViews > 0 || d.visitors > 0
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Portfolio Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Website traffic and engagement
          </p>
        </div>
        <div className="w-full sm:w-40">
          <DateRangeSelect value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-white/80 text-sm font-medium">Unique Visitors</p>
          <p className="text-3xl font-bold mt-1">
            {uniqueVisitors.toLocaleString()}
          </p>
          {visitorsChange !== 0 && (
            <p
              className={`text-sm mt-1 ${visitorsChange >= 0 ? 'text-white/90' : 'text-red-200'}`}
            >
              {visitorsChange >= 0 ? '+' : ''}
              {visitorsChange}% vs prior
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Page Views
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {totalPageViews.toLocaleString()}
          </p>
          {pageViewsChange !== 0 && (
            <p
              className={`text-sm mt-1 ${pageViewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {pageViewsChange >= 0 ? '+' : ''}
              {pageViewsChange}% vs prior
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pages / Visitor
          </p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">
            {pagesPerVisitor}
          </p>
          <p className="text-sm text-gray-400 mt-1">avg depth</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Top Device
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {devices[0]?.device || '—'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {devices[0]?.percentage || 0}% of traffic
          </p>
        </div>
      </div>

      {/* Website Traffic Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Website Traffic
        </h2>
        {activeDays.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activeDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
                name="Visitors"
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.1}
                strokeWidth={2}
                name="Page Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">
            No traffic data for this period
          </div>
        )}
      </div>

      {/* Two-column: Traffic Sources + Top Pages */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        {trafficSources.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Traffic Sources
            </h2>
            <ResponsiveContainer
              width="100%"
              height={Math.max(trafficSources.length * 40, 120)}
            >
              <BarChart data={trafficSources.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="source"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={100}
                />
                <Tooltip />
                <Bar
                  dataKey="visitors"
                  fill="#6366f1"
                  name="Visitors"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Pages */}
        {topPages.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top Pages
            </h2>
            <div className="space-y-3">
              {topPages.slice(0, 10).map((page, i) => {
                const maxViews = topPages[0]?.views || 1
                const width = Math.max((page.views / maxViews) * 100, 4)
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate mr-2">
                        {page.path}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 shrink-0">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Devices Breakdown */}
      {devices.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Devices
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {devices.map((device, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {device.percentage}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {device.device}
                </p>
                <p className="text-xs text-gray-400">
                  {device.visitors.toLocaleString()} visitors
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center">
        Data from PostHog
      </p>
    </div>
  )
}
