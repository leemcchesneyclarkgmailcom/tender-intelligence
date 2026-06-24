import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const users = await db.user.findMany({
    where: { tenantId },
    include: { teams: { include: { team: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      teams: u.teams.map((tm) => ({ id: tm.team.id, name: tm.team.name, role: tm.role, color: tm.team.color })),
    })),
  })
}
