import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'
import { semanticSearchPlan } from '@/lib/ai'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** Natural-language / semantic search over tenders. */
export async function POST(req: NextRequest) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const query: string = (body.query ?? '').toString().trim()
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  // 1. Ask the LLM to expand the natural-language query into structured criteria
  const plan = await semanticSearchPlan(query)
  const keywords = (plan.keywords ?? []).map((k) => k.toLowerCase()).filter((k) => k.length > 2)

  // 2. Load tenders (single tenant) and score by keyword + structured match
  const tenders = await db.tender.findMany({ where: { tenantId } })

  const scored = tenders.map((t) => {
    let score = 0
    const haystack = `${t.title} ${t.description} ${t.buyer} ${t.reference} ${t.category} ${t.country} ${t.industry}`.toLowerCase()
    for (const kw of keywords) {
      if (haystack.includes(kw)) score += 10
    }
    if (plan.industries?.length) {
      for (const ind of plan.industries) {
        if (t.industry.toLowerCase().includes(ind.toLowerCase())) score += 18
        const industries = parseJsonArray(t.industries)
        if (industries.some((i) => i.toLowerCase().includes(ind.toLowerCase()))) score += 8
      }
    }
    if (plan.countries?.length) {
      for (const c of plan.countries) {
        if (t.country.toLowerCase().includes(c.toLowerCase())) score += 12
      }
    }
    // recency + opportunity boost
    if (t.opportunityScore && t.opportunityScore > 60) score += 3
    return { tender: t, score }
  })

  const results = scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((r) => ({
      ...r.tender,
      industries: parseJsonArray(r.tender.industries),
      keyRequirements: parseJsonArray(r.tender.keyRequirements),
      searchScore: r.score,
    }))

  return NextResponse.json({
    query,
    intent: plan.intent,
    plan,
    results,
    count: results.length,
  })
}
