import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()

  const tender = await db.tender.findFirst({
    where: { id, tenantId },
    include: {
      source: true,
      pipelineEntries: { include: { team: true, owner: true } },
      alerts: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })
  if (!tender) return NextResponse.json({ error: 'Tender not found' }, { status: 404 })

  return NextResponse.json({
    ...tender,
    industries: parseJsonArray(tender.industries),
    keyRequirements: parseJsonArray(tender.keyRequirements),
  })
}
