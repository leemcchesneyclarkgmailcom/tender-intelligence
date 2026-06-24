import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

export async function GET() {
  const tenantId = await getTenantId()
  const teams = await db.team.findMany({
    where: { tenantId },
    include: {
      members: { include: { user: true } },
      pipeline: { include: { tender: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({
    teams: teams.map((t) => ({
      ...t,
      memberCount: t.members.length,
      activePursuits: t.pipeline.filter((p) => p.stage !== 'won' && p.stage !== 'lost').length,
      pipelineValue: t.pipeline.filter((p) => p.stage !== 'lost').reduce((s, p) => s + (p.pursuitValue ?? 0), 0),
    })),
  })
}
