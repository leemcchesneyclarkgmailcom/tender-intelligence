import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId, getTenant } from '@/lib/tenant'
import { webSearchTenders } from '@/lib/ai'

export const dynamic = 'force-dynamic'

/**
 * Trigger a collection scan. Uses live web search to surface fresh
 * procurement news for the requested sector, then records an audit entry.
 */
export async function POST(req: NextRequest) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const sector: string = body.sector ?? 'government procurement tender'
  const region: string = body.region ?? 'global'

  const query = `${sector} ${region} government tender procurement 2025`
  const results = await webSearchTenders(query, 10)

  // Mark sources as freshly scanned
  const sources = await db.collectionSource.findMany({ where: { tenantId } })
  for (const s of sources) {
    await db.collectionSource.update({
      where: { id: s.id },
      data: { lastScanAt: new Date() },
    })
  }

  // audit log
  const tenant = await getTenant()
  const user = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
  await db.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user?.id ?? null,
      action: 'scan_triggered',
      resource: 'source',
      details: `Collection scan triggered for "${sector}" (${region}) — ${Array.isArray(results) ? results.length : 0} live results`,
      ipAddress: '203.0.113.70',
      userAgent: 'TenderIntelligence/1.0',
    },
  })

  return NextResponse.json({
    scanned: sources.length,
    sector,
    region,
    results,
    scannedAt: new Date().toISOString(),
  })
}
