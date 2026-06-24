import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const tenant = await db.tenant.findFirst({
    where: { id: tenantId },
    include: {
      users: { select: { id: true, name: true, email: true, role: true, status: true, lastActive: true } },
      _count: { select: { tenders: true, teams: true, competitors: true, savedSearches: true, reports: true } },
    },
  })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ tenant })
}
