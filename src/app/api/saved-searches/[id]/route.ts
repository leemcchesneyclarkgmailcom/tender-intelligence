import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()
  const existing = await db.savedSearch.findFirst({ where: { id, tenantId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.savedSearch.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
