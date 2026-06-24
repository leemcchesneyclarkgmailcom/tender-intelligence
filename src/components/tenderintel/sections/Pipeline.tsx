'use client'

import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, relativeTime, STAGE_LABELS } from '@/lib/format'
import type { PipelineEntry, Tender } from '../types'
import { IndustryBadge, PriorityBadge, UserAvatar, ScoreRing, SectionHeader, EmptyState } from '../shared'
import {
  KanbanSquare,
  Loader2,
  GripVertical,
  Plus,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react'

const STAGES = ['identified', 'qualifying', 'pursuing', 'bidding', 'won', 'lost'] as const
const STAGE_META: Record<string, { color: string; bg: string; dot: string }> = {
  identified: { color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-900/50', dot: 'bg-slate-400' },
  qualifying: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500' },
  pursuing: { color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/30', dot: 'bg-cyan-500' },
  bidding: { color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-50 dark:bg-violet-950/30', dot: 'bg-violet-500' },
  won: { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/30', dot: 'bg-emerald-500' },
  lost: { color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/30', dot: 'bg-rose-500' },
}

export function PipelineSection({ onTenderClick }: { onTenderClick: (t: Tender) => void }) {
  const [entries, setEntries] = React.useState<PipelineEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const load = React.useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/pipeline')
    const data = await res.json()
    setEntries(data.entries ?? [])
    setLoading(false)
  }, [])

  React.useEffect(() => { load() }, [load])

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)
  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStage = over.id as string
    const entry = entries.find((x) => x.id === active.id)
    if (!entry || entry.stage === newStage) return

    // optimistic update
    setEntries((prev) => prev.map((x) => (x.id === entry.id ? { ...x, stage: newStage } : x)))
    toast({ title: `Moved to ${STAGE_LABELS[newStage]}`, description: entry.tender.title.slice(0, 60) })

    try {
      await fetch(`/api/pipeline/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' })
      load()
    }
  }

  const grouped = STAGES.map((stage) => ({
    stage,
    items: entries.filter((e) => e.stage === stage),
    value: entries.filter((e) => e.stage === stage).reduce((s, e) => s + (e.pursuitValue ?? 0), 0),
  }))

  const totalValue = entries.filter((e) => e.stage !== 'lost').reduce((s, e) => s + (e.pursuitValue ?? 0), 0)
  const wonValue = entries.filter((e) => e.stage === 'won').reduce((s, e) => s + (e.pursuitValue ?? 0), 0)

  const activeEntry = entries.find((e) => e.id === activeId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        title="Opportunity Pipeline"
        description="Drag tenders across stages to manage your pursuit workflow"
        action={
          <div className="flex items-center gap-3">
            <div className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-xs sm:block">
              <span className="text-muted-foreground">Active value:</span>{' '}
              <span className="font-bold text-foreground">{formatCurrency(totalValue, 'USD')}</span>
            </div>
            <div className="hidden rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs dark:border-emerald-900 dark:bg-emerald-950/30 sm:block">
              <span className="text-muted-foreground">Won:</span>{' '}
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(wonValue, 'USD')}</span>
            </div>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add to Pipeline
            </Button>
          </div>
        }
      />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {grouped.map((col) => (
            <KanbanColumn key={col.stage} stage={col.stage} items={col.items} value={col.value} onTenderClick={onTenderClick} />
          ))}
        </div>
        <DragOverlay>
          {activeEntry ? (
            <div className="rotate-2 opacity-90">
              <PipelineCard entry={activeEntry} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {entries.length === 0 && (
        <EmptyState icon={KanbanSquare} title="Pipeline is empty" description="Add tenders to the pipeline from the Tender Feed to start tracking pursuits." />
      )}
    </div>
  )
}

function KanbanColumn({
  stage,
  items,
  value,
  onTenderClick,
}: {
  stage: string
  items: PipelineEntry[]
  value: number
  onTenderClick: (t: Tender) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = STAGE_META[stage]
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 transition-colors ${isOver ? 'border-teal-400 bg-teal-50/30 dark:bg-teal-950/10' : 'border-border bg-card'}`}
    >
      <div className={`flex items-center justify-between rounded-t-lg px-3 py-2.5 ${meta.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
          <h3 className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>{STAGE_LABELS[stage]}</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
      </div>
      {value > 0 && (
        <div className="border-b border-border px-3 py-1.5 text-[10px] text-muted-foreground">
          {formatCurrency(value, 'USD')}
        </div>
      )}
      <ScrollArea className="flex-1 ti-scroll" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <div className="space-y-2 p-2">
          {items.map((entry) => (
            <PipelineCard key={entry.id} entry={entry} onTenderClick={onTenderClick} />
          ))}
          {items.length === 0 && (
            <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/60 text-[11px] text-muted-foreground/50">
              Drop here
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function PipelineCard({
  entry,
  onTenderClick,
  dragging,
}: {
  entry: PipelineEntry
  onTenderClick?: (t: Tender) => void
  dragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: entry.id })
  const t = entry.tender
  return (
    <div
      ref={setNodeRef}
      className={`group rounded-lg border border-border bg-card p-2.5 shadow-sm transition-all hover:shadow-md ${isDragging ? 'opacity-30' : ''} ${dragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          aria-label="Drag"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button className="min-w-0 flex-1 text-left" onClick={() => onTenderClick?.(t)}>
          <div className="mb-1 flex flex-wrap items-center gap-1">
            <IndustryBadge industry={t.industry} />
            <PriorityBadge priority={entry.priority} />
          </div>
          <p className="line-clamp-2 text-xs font-semibold leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300">
            {t.title}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{t.buyer}</p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground">{formatCurrency(entry.pursuitValue ?? 0, 'USD')}</span>
            {t.opportunityScore != null && <ScoreRing score={t.opportunityScore} size={32} />}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-1.5">
            {entry.owner ? (
              <span className="flex items-center gap-1">
                <UserAvatar name={entry.owner.name} color={entry.owner.avatarColor} size={18} />
                <span className="text-[10px] text-muted-foreground">{entry.owner.name.split(' ')[0]}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                <Users className="h-3 w-3" /> Unassigned
              </span>
            )}
            {entry.dueDate && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" /> {relativeTime(entry.dueDate)}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
