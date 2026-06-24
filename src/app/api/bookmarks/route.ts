import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** List bookmarked tenders for the current (demo) user. */
export async function GET() {
  const tenantId = await getTenantId()
  // Use the first analyst user as the "current" user in this single-tenant demo
  const user = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
    ?? await db.user.findFirst({ where: { tenantId } })
  if (!user) return NextResponse.json({ bookmarks: [] })

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { tender: true },
  })

  return NextResponse.json({
    bookmarks: bookmarks.map((b) => ({
      id: b.id,
      tenderId: b.tenderId,
      notes: b.notes,
      createdAt: b.createdAt,
      tender: {
        ...b.tender,
        industries: parseJsonArray(b.tender.industries),
        keyRequirements: parseJsonArray(b.tender.keyRequirements),
      },
    })),
    count: bookmarks.length,
  })
}

/** Create a bookmark. */
export async function POST(req: NextRequest) {
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))
  const { tenderId, notes } = body
  if (!tenderId) return NextResponse.json({ error: 'tenderId required' }, { status: 400 })

  const user = await db.user.findFirst({ where: { tenantId, role: 'analyst' } })
    ?? await db.user.findFirst({ where: { tenantId } })
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 400 })

  // Verify tender belongs to this tenant
  const tender = await db.tender.findFirst({ where: { id: tenderId, tenantId } })
  if (!tender) return NextResponse.json({ error: 'Tender not found' }, { status: 404 })

  try {
    const bookmark = await db.bookmark.create({
      data: { userId: user.id, tenderId, notes: notes ?? null },
    })
    return NextResponse.json({ bookmark, bookmarked: true })
  } catch {
    // Already bookmarked — return existing
    const existing = await db.bookmark.findUnique({
      where: { userId_tenderId: { userId: user.id, tenderId } },
    })
    return NextResponse.json({ bookmark: existing, bookmarked: true, alreadyExists: true })
  }
}
