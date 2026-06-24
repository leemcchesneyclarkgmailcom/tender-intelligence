import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** List pipeline entries, optionally grouped by stage. */
export async function GET(req: NextRequest) {
  const tenantId = await getTenantId()
  const { searchParams } = new URL(req.url)
  const groupBy = searchParams.get('groupBy') ?? 'stage'

  const entries = await db.pipelineEntry.findMany({
    where: { tenantId },
    include: { tender: true, team: true, owner: true },
    orderBy: { updatedAt: 'desc' },
  })

  const mapped = entries.map((e) => ({
    ...e,
    tender: {
      ...e.tender,
      industries: parseJsonArray(e.tender.industries),
      keyRequirements: parseJsonArray(e.tender.keyRequirements),
    },
  }))

  if (groupBy === 'stage') {
    const stages = ['identified', 'qualifying', 'pursuing', 'bidding', 'won', 'lost']
    const grouped = stages.map((stage) => ({
      stage,
      entries: mapped.filter((e) => e.stage === stage),
      totalValue: mapped.filter((e) => e.stage === stage).reduce((s, e) => s + (e.pursuitValue ?? 0), 0),
    }))
    return NextResponse.json({ grouped, entries: mapped })
  }

  return NextResponse.json({ entries: mapped })
}

/** Create a new pipeline entry (add a tender to the pipeline). */
export async function POST(req: NextRequest) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const { tenderId, stage = 'identified', priority = 'medium', teamId, ownerId, pursuitValue, notes } = body
  if (!tenderId) return NextResponse.json({ error: 'tenderId is required' }, { status: 400 })

  const entry = await db.pipelineEntry.create({
    data: {
      tenantId,
      tenderId,
      stage,
      priority,
      teamId: teamId ?? null,
      ownerId: ownerId ?? null,
      pursuitValue: pursuitValue ?? null,
      notes: notes ?? null,
    },
    include: { tender: true, team: true, owner: true },
  })
  return NextResponse.json({ entry })
}
