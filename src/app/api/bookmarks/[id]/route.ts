import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()
  const user = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
    ?? await db.user.findFirst({ where: { tenantId } })
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 400 })

  // Ensure the bookmark belongs to this user
  const bookmark = await db.bookmark.findFirst({ where: { id, userId: user.id } })
  if (!bookmark) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.bookmark.delete({ where: { id } })
  return NextResponse.json({ ok: true, bookmarked: false })
}

/** Check bookmark status for a tender */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()
  const user = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
    ?? await db.user.findFirst({ where: { tenantId } })
  if (!user) return NextResponse.json({ bookmarked: false })

  // id can be either a bookmark id or a tender id
  const byBookmark = await db.bookmark.findFirst({ where: { id, userId: user.id } })
  if (byBookmark) return NextResponse.json({ bookmarked: true, bookmarkId: byBookmark.id })

  const byTender = await db.bookmark.findUnique({
    where: { userId_tenderId: { userId: user.id, tenderId: id } },
  })
  return NextResponse.json({ bookmarked: !!byTender, bookmarkId: byTender?.id ?? null })
}
