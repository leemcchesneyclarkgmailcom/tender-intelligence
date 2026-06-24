import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId, getTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'

/** Update a pipeline entry (move stage, assign owner, set priority). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()
  const body = await req.json().catch(() => ({}))

  const existing = await db.pipelineEntry.findFirst({ where: { id, tenantId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { stage, priority, ownerId, teamId, pursuitValue, notes, dueDate } = body
  const entry = await db.pipelineEntry.update({
    where: { id },
    data: {
      ...(stage && { stage }),
      ...(priority && { priority }),
      ...(ownerId !== undefined && { ownerId: ownerId ?? null }),
      ...(teamId !== undefined && { teamId: teamId ?? null }),
      ...(pursuitValue !== undefined && { pursuitValue: pursuitValue ?? null }),
      ...(notes !== undefined && { notes }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: { tender: true, team: true, owner: true },
  })

  // Audit log
  const tenant = await getTenant()
  const user = await db.user.findFirst({ where: { tenantId, role: 'manager' } })
  await db.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user?.id ?? null,
      action: 'update_pipeline',
      resource: 'pipeline',
      resourceId: entry.id,
      details: stage ? `Moved "${entry.tender?.title}" to ${stage}` : `Updated pipeline entry`,
      ipAddress: '203.0.113.51',
      userAgent: 'TenderIntelligence/1.0',
    },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tenantId = await getTenantId()
  const existing = await db.pipelineEntry.findFirst({ where: { id, tenantId } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await db.pipelineEntry.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
