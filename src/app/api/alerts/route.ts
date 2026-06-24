import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const tenantId = await getTenantId()
  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unreadOnly') === 'true'

  const alerts = await db.alert.findMany({
    where: { tenantId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { tender: true },
    take: 100,
  })
  const unread = alerts.filter((a) => !a.read).length
  return NextResponse.json({ alerts, unread })
}
