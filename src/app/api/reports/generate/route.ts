import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId, getTenant } from '@/lib/tenant'
import { generateMarketIntelligence } from '@/lib/ai'

export const dynamic = 'force-dynamic'

/** Generate a new market-intelligence / weekly report using the AI pipeline. */
export async function POST(req: NextRequest) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const type: string = body.type ?? 'weekly'
  const industry: string = body.industry ?? 'all'

  const tenders = await db.tender.findMany({
    where: { tenantId, ...(industry !== 'all' ? { industry } : {}) },
  })

  const totalBudget = tenders.reduce((s, t) => s + (t.budgetMax ?? 0), 0)
  const buyerMap = new Map<string, number>()
  for (const t of tenders) buyerMap.set(t.buyer, (buyerMap.get(t.buyer) ?? 0) + 1)
  const topBuyers = Array.from(buyerMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n)

  const periodLabel = type === 'weekly' ? 'last 7 days' : type === 'market_intelligence' ? 'last 90 days' : 'last 30 days'
  const periodDays = type === 'weekly' ? 7 : type === 'market_intelligence' ? 90 : 30

  const ai = await generateMarketIntelligence({
    period: periodLabel,
    industry: industry === 'all' ? 'all sectors' : industry,
    tenderCount: tenders.length,
    totalBudget,
    topBuyers,
    sampleTitles: tenders.slice(0, 6).map((t) => t.title),
  })

  const periodEnd = new Date()
  const periodStart = new Date(periodEnd.getTime() - periodDays * 86400000)
  const title =
    type === 'weekly'
      ? `Weekly Tender Digest — Week ${Math.ceil((periodEnd.getDate()) / 7)}`
      : type === 'market_intelligence'
      ? `Market Intelligence — ${industry === 'all' ? 'All Sectors' : industry} (${periodEnd.toLocaleString('en-US', { month: 'short' })} ${periodEnd.getFullYear()})`
      : type === 'competitor_brief'
      ? `Competitor Briefing — ${industry}`
      : `Pipeline Review — ${periodEnd.toLocaleString('en-US', { month: 'short', year: 'numeric' })}`

  const contentJson = JSON.stringify({
    highlights: ai.highlights,
    recommendations: ai.recommendations,
    sections: [
      { heading: 'Executive Summary', body: ai.summary },
      { heading: 'Pipeline Snapshot', body: `${tenders.length} tenders tracked, $${totalBudget.toLocaleString()} total addressable budget.` },
      { heading: 'Top Buyers', body: topBuyers.map((b, i) => `${i + 1}. ${b}`).join('\n') },
    ],
    stats: { tenderCount: tenders.length, totalBudget, periodDays },
  })

  const report = await db.report.create({
    data: {
      tenantId,
      title,
      type,
      periodStart,
      periodEnd,
      summary: ai.summary,
      contentJson,
      status: 'generated',
    },
  })

  // audit log
  const tenant = await getTenant()
  const user = await db.user.findFirst({ where: { tenantId, role: 'manager' } })
  await db.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user?.id ?? null,
      action: 'generate_report',
      resource: 'report',
      resourceId: report.id,
      details: `Generated ${type} report: ${title}`,
      ipAddress: '203.0.113.60',
      userAgent: 'TenderIntelligence/1.0',
    },
  })

  return NextResponse.json({
    report: { ...report, content: JSON.parse(contentJson) },
    analysis: ai,
  })
}
