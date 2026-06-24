import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const reports = await db.report.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    reports: reports.map((r) => ({
      ...r,
      content: JSON.parse(r.contentJson),
    })),
  })
}
