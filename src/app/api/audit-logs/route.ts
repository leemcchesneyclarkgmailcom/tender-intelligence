import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const tenantId = await getTenantId()
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  const logs = await db.auditLog.findMany({
    where: { tenantId, ...(action ? { action } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: true },
  })
  return NextResponse.json({ logs })
}
