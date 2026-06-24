import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const competitors = await db.competitor.findMany({
    where: { tenantId },
    include: { activities: { orderBy: { date: 'desc' } } },
    orderBy: { winRate: 'desc' },
  })
  return NextResponse.json({ competitors })
}

export async function POST(req: Request) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const { name, website, industry, hqCountry, size, threatLevel, notes } = body
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const competitor = await db.competitor.create({
    data: {
      tenantId,
      name,
      website: website ?? null,
      industry: industry ?? 'construction',
      hqCountry: hqCountry ?? null,
      size: size ?? 'mid',
      threatLevel: threatLevel ?? 'medium',
      notes: notes ?? null,
    },
  })
  return NextResponse.json({ competitor })
}
