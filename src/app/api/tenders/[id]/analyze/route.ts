import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId, getTenant } from '@/lib/tenant'
import { processTenderWithAI } from '@/lib/ai'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** Run the full AI processing pipeline (summary, risk, scoring, classification). */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()

  const tender = await db.tender.findFirst({ where: { id, tenantId } })
  if (!tender) return NextResponse.json({ error: 'Tender not found' }, { status: 404 })

  const result = await processTenderWithAI({
    title: tender.title,
    description: tender.description,
    buyer: tender.buyer,
    buyerType: tender.buyerType,
    country: tender.country,
    industry: tender.industry,
    budgetMin: tender.budgetMin,
    budgetMax: tender.budgetMax,
    deadlineAt: tender.deadlineAt.toISOString(),
  })

  const updated = await db.tender.update({
    where: { id },
    data: {
      summary: result.summary,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      riskNotes: result.riskNotes,
      opportunityScore: result.opportunityScore,
      winProbability: result.winProbability,
      opportunityNotes: result.opportunityNotes,
      industries: JSON.stringify(result.industries),
      keyRequirements: JSON.stringify(result.keyRequirements),
      aiProcessedAt: new Date(),
    },
  })

  // Audit log
  const tenant = await getTenant()
  const analystUser = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
  await db.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: analystUser?.id ?? null,
      action: 'ai_summarize',
      resource: 'tender',
      resourceId: tender.id,
      details: `AI analysis re-run for ${tender.reference}: risk=${result.riskLevel} (${result.riskScore}), opportunity=${result.opportunityScore}`,
      ipAddress: '203.0.113.42',
      userAgent: 'TenderIntelligence/1.0',
    },
  })

  return NextResponse.json({
    tender: {
      ...updated,
      industries: parseJsonArray(updated.industries),
      keyRequirements: parseJsonArray(updated.keyRequirements),
    },
    analysis: result,
  })
}
