import { NextRequest, NextResponse } from 'next/server'

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || ''
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || ''
const POSTHOG_HOST = 'https://us.i.posthog.com'

const VALID_QUERY_TYPES = [
  'websitePageViews',
  'websiteTrafficSources',
  'websiteTopPages',
  'websiteDevices',
] as const

type QueryType = typeof VALID_QUERY_TYPES[number]

export async function POST(request: NextRequest) {
  if (!POSTHOG_API_KEY) {
    return NextResponse.json(
      { error: 'POSTHOG_API_KEY not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const queryType = body.queryType as QueryType
    const days = Math.min(Math.max(parseInt(body.days) || 30, 1), 365)

    if (!VALID_QUERY_TYPES.includes(queryType)) {
      return NextResponse.json({ error: 'Invalid query type' }, { status: 400 })
    }

    let query: Record<string, unknown>

    switch (queryType) {
      case 'websitePageViews':
        query = {
          kind: 'TrendsQuery',
          series: [
            { event: '$pageview', kind: 'EventsNode', name: 'Page Views' },
            { event: '$pageview', kind: 'EventsNode', math: 'unique_session', name: 'Visitors' },
          ],
          interval: 'day',
          dateRange: { date_from: `-${days}d` },
          filterTestAccounts: true,
        }
        break

      case 'websiteTrafficSources':
        query = {
          kind: 'TrendsQuery',
          series: [{ event: '$pageview', kind: 'EventsNode', math: 'unique_session' }],
          dateRange: { date_from: `-${days}d` },
          breakdownFilter: { breakdown: '$referring_domain', breakdown_type: 'event', breakdown_limit: 10 },
          filterTestAccounts: true,
        }
        break

      case 'websiteTopPages':
        query = {
          kind: 'TrendsQuery',
          series: [{ event: '$pageview', kind: 'EventsNode' }],
          dateRange: { date_from: `-${days}d` },
          breakdownFilter: { breakdown: '$pathname', breakdown_type: 'event', breakdown_limit: 15 },
          filterTestAccounts: true,
        }
        break

      case 'websiteDevices':
        query = {
          kind: 'TrendsQuery',
          series: [{ event: '$pageview', kind: 'EventsNode', math: 'unique_session' }],
          dateRange: { date_from: `-${days}d` },
          breakdownFilter: { breakdown: '$device_type', breakdown_type: 'event' },
          filterTestAccounts: true,
        }
        break
    }

    const res = await fetch(
      `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${POSTHOG_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`PostHog API error: ${res.status} - ${text}`)
    }

    const data = await res.json()

    let result: unknown
    switch (queryType) {
      case 'websitePageViews':
        result = transformPageViews(data)
        break
      case 'websiteTrafficSources':
        result = transformTrafficSources(data)
        break
      case 'websiteTopPages':
        result = transformTopPages(data)
        break
      case 'websiteDevices':
        result = transformDevices(data)
        break
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('PostHog API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function transformPageViews(data: Record<string, unknown>) {
  const results = (data?.results as Array<Record<string, unknown>>) || []
  const trend: Array<Record<string, unknown>> = []

  const pageViewsSeries = results[0] || { data: [], days: [] }
  const visitorsSeries = results[1] || { data: [], days: [] }

  const dates = (pageViewsSeries.days || pageViewsSeries.labels || []) as string[]
  const pageViewsData = (pageViewsSeries.data || []) as number[]
  const visitorsData = (visitorsSeries.data || []) as number[]

  for (let i = 0; i < dates.length; i++) {
    trend.push({
      date: dates[i]?.split('T')[0] || `Day ${i + 1}`,
      pageViews: pageViewsData[i] || 0,
      visitors: visitorsData[i] || 0,
    })
  }

  const totalPageViews = pageViewsData.reduce((a, b) => a + b, 0)
  const uniqueVisitors = visitorsData.reduce((a, b) => a + b, 0)

  const midpoint = Math.floor(dates.length / 2)
  const recentViews = pageViewsData.slice(midpoint).reduce((a, b) => a + b, 0)
  const priorViews = pageViewsData.slice(0, midpoint).reduce((a, b) => a + b, 0)
  const pageViewsChange = priorViews > 0 ? Math.round(((recentViews - priorViews) / priorViews) * 100) : 0

  const recentVisitors = visitorsData.slice(midpoint).reduce((a, b) => a + b, 0)
  const priorVisitors = visitorsData.slice(0, midpoint).reduce((a, b) => a + b, 0)
  const visitorsChange = priorVisitors > 0 ? Math.round(((recentVisitors - priorVisitors) / priorVisitors) * 100) : 0

  return {
    trend,
    summary: {
      totalPageViews,
      uniqueVisitors,
      pageViewsChange,
      visitorsChange,
    },
  }
}

function transformTrafficSources(data: Record<string, unknown>) {
  const results = (data?.results as Array<Record<string, unknown>>) || []
  const sources: Array<{ source: string; visitors: number; percentage: number }> = []

  let totalVisitors = 0
  for (const series of results) {
    const visitors = ((series.data || []) as number[]).reduce((a, b) => a + b, 0)
    totalVisitors += visitors

    let source = (series.breakdown_value as string) || ''
    if (!source || source === '$direct' || source === '') {
      source = 'Direct'
    } else if (source.includes('google')) {
      source = 'Google'
    } else if (source.includes('facebook') || source.includes('instagram')) {
      source = 'Meta'
    } else if (source.includes('twitter') || source.includes('x.com')) {
      source = 'X / Twitter'
    } else if (source.includes('linkedin')) {
      source = 'LinkedIn'
    }

    // Merge duplicates
    const existing = sources.find((s) => s.source === source)
    if (existing) {
      existing.visitors += visitors
    } else {
      sources.push({ source, visitors, percentage: 0 })
    }
  }

  for (const source of sources) {
    source.percentage = totalVisitors > 0 ? Math.round((source.visitors / totalVisitors) * 100) : 0
  }
  sources.sort((a, b) => b.visitors - a.visitors)

  return { sources: sources.slice(0, 8) }
}

function transformTopPages(data: Record<string, unknown>) {
  const results = (data?.results as Array<Record<string, unknown>>) || []
  const pages: Array<{ path: string; views: number }> = []

  for (const series of results) {
    const views = ((series.data || []) as number[]).reduce((a, b) => a + b, 0)
    pages.push({
      path: (series.breakdown_value as string) || '/',
      views,
    })
  }

  pages.sort((a, b) => b.views - a.views)
  return { pages: pages.slice(0, 15) }
}

function transformDevices(data: Record<string, unknown>) {
  const results = (data?.results as Array<Record<string, unknown>>) || []
  const devices: Array<{ device: string; visitors: number; percentage: number }> = []

  let totalVisitors = 0
  for (const series of results) {
    const visitors = ((series.data || []) as number[]).reduce((a, b) => a + b, 0)
    totalVisitors += visitors

    let deviceName = (series.breakdown_value as string) || 'Unknown'
    if (deviceName.toLowerCase().includes('mobile') || deviceName.toLowerCase().includes('phone')) {
      deviceName = 'Mobile'
    } else if (deviceName.toLowerCase().includes('tablet') || deviceName.toLowerCase().includes('ipad')) {
      deviceName = 'Tablet'
    } else if (deviceName.toLowerCase().includes('desktop') || deviceName.toLowerCase().includes('pc')) {
      deviceName = 'Desktop'
    }

    const existing = devices.find((d) => d.device === deviceName)
    if (existing) {
      existing.visitors += visitors
    } else {
      devices.push({ device: deviceName, visitors, percentage: 0 })
    }
  }

  for (const device of devices) {
    device.percentage = totalVisitors > 0 ? Math.round((device.visitors / totalVisitors) * 100) : 0
  }
  devices.sort((a, b) => b.visitors - a.visitors)

  return { devices }
}
