import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** Aggregate dashboard statistics for the overview screen. */
export async function GET() {
  const tenantId = await getTenantId()

  const [tenders, pipeline, alerts, competitors, savedSearches, sources, reports] = await Promise.all([
    db.tender.findMany({
      where: { tenantId },
      orderBy: { publishedAt: 'desc' },
    }),
    db.pipelineEntry.findMany({
      where: { tenantId },
      include: { tender: true, team: true, owner: true },
    }),
    db.alert.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    db.competitor.findMany({ where: { tenantId }, include: { activities: { orderBy: { date: 'desc' }, take: 3 } } }),
    db.savedSearch.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } }),
    db.collectionSource.findMany({ where: { tenantId }, orderBy: { itemsFound: 'desc' } }),
    db.report.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const openTenders = tenders.filter((t) => t.status === 'open' || t.status === 'closing')
  const closingSoon = tenders.filter((t) => {
    const days = Math.ceil((t.deadlineAt.getTime() - Date.now()) / 86400000)
    return days >= 0 && days <= 14
  })
  const totalAddressableBudget = tenders.reduce((s, t) => s + (t.budgetMax ?? 0), 0)

  // KPI cards
  const kpis = {
    activeTenders: openTenders.length,
    pipelineValue: pipeline
      .filter((p) => p.stage !== 'lost')
      .reduce((s, p) => s + (p.pursuitValue ?? 0), 0),
    closingThisWeek: closingSoon.length,
    avgWinProbability:
      tenders.length > 0
        ? Math.round(tenders.reduce((s, t) => s + (t.winProbability ?? 0), 0) / tenders.length)
        : 0,
    unreadAlerts: alerts.filter((a) => !a.read).length,
    highRiskTenders: tenders.filter((t) => t.riskLevel === 'high' || t.riskLevel === 'critical').length,
    totalCompetitors: competitors.length,
  }

  // Tender volume over time (last 12 weeks)
  const weekBuckets: { label: string; count: number; value: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getTime() - i * 7 * 86400000)
    const end = new Date(start.getTime() + 7 * 86400000)
    const inWeek = tenders.filter((t) => t.publishedAt >= start && t.publishedAt < end)
    weekBuckets.push({
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      count: inWeek.length,
      value: inWeek.reduce((s, t) => s + (t.budgetMax ?? 0), 0),
    })
  }

  // Industry breakdown
  const industryMap = new Map<string, { count: number; value: number }>()
  for (const t of tenders) {
    const cur = industryMap.get(t.industry) ?? { count: 0, value: 0 }
    cur.count += 1
    cur.value += t.budgetMax ?? 0
    industryMap.set(t.industry, cur)
  }
  const byIndustry = Array.from(industryMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)

  // Country breakdown
  const countryMap = new Map<string, number>()
  for (const t of tenders) countryMap.set(t.country, (countryMap.get(t.country) ?? 0) + 1)
  const byCountry = Array.from(countryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Risk distribution
  const riskDistribution = {
    low: tenders.filter((t) => t.riskLevel === 'low').length,
    medium: tenders.filter((t) => t.riskLevel === 'medium').length,
    high: tenders.filter((t) => t.riskLevel === 'high').length,
    critical: tenders.filter((t) => t.riskLevel === 'critical').length,
  }

  // Win probability distribution
  const winBuckets = [
    { range: '0-20%', count: 0 },
    { range: '21-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 0 },
    { range: '81-100%', count: 0 },
  ]
  for (const t of tenders) {
    const p = t.winProbability ?? 0
    if (p <= 20) winBuckets[0].count++
    else if (p <= 40) winBuckets[1].count++
    else if (p <= 60) winBuckets[2].count++
    else if (p <= 80) winBuckets[3].count++
    else winBuckets[4].count++
  }

  // Pipeline summary
  const stages = ['identified', 'qualifying', 'pursuing', 'bidding', 'won', 'lost']
  const pipelineSummary = stages.map((stage) => ({
    stage,
    count: pipeline.filter((p) => p.stage === stage).length,
    value: pipeline.filter((p) => p.stage === stage).reduce((s, p) => s + (p.pursuitValue ?? 0), 0),
  }))

  // Top buyers
  const buyerMap = new Map<string, { count: number; value: number }>()
  for (const t of tenders) {
    const cur = buyerMap.get(t.buyer) ?? { count: 0, value: 0 }
    cur.count += 1
    cur.value += t.budgetMax ?? 0
    buyerMap.set(t.buyer, cur)
  }
  const topBuyers = Array.from(buyerMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  return NextResponse.json({
    kpis,
    totalAddressableBudget,
    trends: weekBuckets,
    byIndustry,
    byCountry,
    riskDistribution,
    winBuckets,
    pipelineSummary,
    topBuyers,
    recentAlerts: alerts,
    recentTenders: tenders.slice(0, 6).map((t) => ({
      ...t,
      industries: parseJsonArray(t.industries),
      keyRequirements: parseJsonArray(t.keyRequirements),
    })),
    competitors: competitors.map((c) => ({
      ...c,
      activities: c.activities,
    })),
    savedSearches,
    sources,
    recentReports: reports,
    totals: {
      tenders: tenders.length,
      pipeline: pipeline.length,
      savedSearches: savedSearches.length,
      sources: sources.length,
      reports: reports.length,
    },
  })
}
