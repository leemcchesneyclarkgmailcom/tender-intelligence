import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const sources = await db.collectionSource.findMany({
    where: { tenantId },
    orderBy: { itemsFound: 'desc' },
  })
  const totalItems = sources.reduce((s, x) => s + x.itemsFound, 0)
  const activeSources = sources.filter((s) => s.status === 'active').length
  return NextResponse.json({ sources, totalItems, activeSources })
}
