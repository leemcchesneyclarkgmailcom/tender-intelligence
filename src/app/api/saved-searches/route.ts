import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const searches = await db.savedSearch.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    searches: searches.map((s) => ({ ...s, filters: JSON.parse(s.filtersJson) })),
  })
}

export async function POST(req: NextRequest) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const { name, query, filters, notifyEmail } = body
  if (!name || !query) return NextResponse.json({ error: 'name and query required' }, { status: 400 })

  const search = await db.savedSearch.create({
    data: {
      tenantId,
      name,
      query,
      filtersJson: JSON.stringify(filters ?? {}),
      notifyEmail: notifyEmail ?? true,
      lastRunAt: new Date(),
      resultCount: 0,
    },
  })

  // audit log
  const user = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
  await db.auditLog.create({
    data: {
      tenantId,
      userId: user?.id ?? null,
      action: 'create_search',
      resource: 'saved_search',
      resourceId: search.id,
      details: `Created saved search "${name}"`,
      ipAddress: '203.0.113.55',
      userAgent: 'TenderIntelligence/1.0',
    },
  })

  return NextResponse.json({ search })
}
