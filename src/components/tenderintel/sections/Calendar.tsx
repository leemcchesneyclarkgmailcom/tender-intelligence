'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { formatBudget, formatDate, daysUntil, INDUSTRY_LABELS, formatCurrency } from '@/lib/format'
import type { Tender } from '../types'
import { SectionHeader, IndustryBadge, RiskBadge, StatusBadge, EmptyState } from '../shared'
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Building2,
  Target,
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MonthDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  tenders: Tender[]
}

export function CalendarSection({ onTenderClick }: { onTenderClick: (t: Tender) => void }) {
  const [tenders, setTenders] = React.useState<Tender[]>([])
  const [loading, setLoading] = React.useState(true)
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null)

  React.useEffect(() => {
    fetch('/api/tenders?limit=200')
      .then((r) => r.json())
      .then((d) => setTenders(d.tenders ?? []))
      .finally(() => setLoading(false))
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthName = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // Build calendar grid (6 weeks = 42 cells)
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay() // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days: MonthDay[] = []
  // Lead-in days from previous month
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({ date: d, isCurrentMonth: false, isToday: false, tenders: tendersForDay(tenders, d) })
  }
  // Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum)
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: d.getTime() === today.getTime(),
      tenders: tendersForDay(tenders, d),
    })
  }
  // Trailing days to fill 42
  while (days.length < 42) {
    const last = days[days.length - 1].date
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    days.push({ date: d, isCurrentMonth: false, isToday: false, tenders: tendersForDay(tenders, d) })
  }

  // Upcoming deadlines (next 30 days)
  const upcoming = tenders
    .filter((t) => {
      const days = daysUntil(t.deadlineAt)
      return days >= 0 && days <= 60
    })
    .sort((a, b) => daysUntil(a.deadlineAt) - daysUntil(b.deadlineAt))

  // Stats
  const thisMonthCount = tenders.filter((t) => {
    const d = new Date(t.deadlineAt)
    return d.getMonth() === month && d.getFullYear() === year
  }).length
  const closingThisWeek = tenders.filter((t) => {
    const d = daysUntil(t.deadlineAt)
    return d >= 0 && d <= 7
  }).length
  const overdueCount = tenders.filter((t) => daysUntil(t.deadlineAt) < 0).length

  const selectedDayTenders = selectedDay ? tendersForDay(tenders, selectedDay) : []

  return (
    <div>
      <SectionHeader
        title="Deadline Calendar"
        description="Monthly view of tender submission deadlines — never miss a closing date"
        action={
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-xs sm:block">
              <span className="text-muted-foreground">This month:</span>{' '}
              <span className="font-bold text-foreground">{thisMonthCount}</span>
              <span className="mx-2 text-muted-foreground/40">|</span>
              <span className="text-muted-foreground">≤7d:</span>{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400">{closingThisWeek}</span>
              {overdueCount > 0 && (
                <>
                  <span className="mx-2 text-muted-foreground/40">|</span>
                  <span className="text-muted-foreground">Closed:</span>{' '}
                  <span className="font-bold text-rose-600 dark:text-rose-400">{overdueCount}</span>
                </>
              )}
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          {/* Calendar grid */}
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <CalendarClock className="h-5 w-5 text-teal-600" /> {monthName}
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCursor(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const d = new Date()
                    setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
                  }}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day, i) => {
                const isSel = selectedDay && day.date.getTime() === selectedDay.getTime()
                const hasTenders = day.tenders.length > 0
                const isPast = day.date.getTime() < today.getTime() && !day.isToday
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(day.date)}
                    className={cn(
                      'relative flex min-h-[80px] flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-all sm:min-h-[96px]',
                      day.isCurrentMonth ? 'bg-card' : 'bg-muted/20',
                      isSel ? 'border-teal-500 ring-1 ring-teal-400' : 'border-border hover:border-teal-300',
                      day.isToday && 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                        day.isToday
                          ? 'bg-teal-600 text-white'
                          : day.isCurrentMonth
                          ? isPast
                            ? 'text-muted-foreground/50'
                            : 'text-foreground'
                          : 'text-muted-foreground/40'
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {hasTenders && (
                      <div className="w-full space-y-0.5">
                        {day.tenders.slice(0, 2).map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              'truncate rounded px-1 py-0.5 text-[9px] font-medium leading-tight',
                              industryColor(t.industry)
                            )}
                            title={t.title}
                          >
                            {t.title.slice(0, 18)}…
                          </div>
                        ))}
                        {day.tenders.length > 2 && (
                          <div className="px-1 text-[9px] font-semibold text-muted-foreground">+{day.tenders.length - 2} more</div>
                        )}
                      </div>
                    )}
                    {hasTenders && (
                      <span className="absolute right-1 top-1 flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-[10px]">
              <span className="font-semibold text-muted-foreground">Industries:</span>
              {Object.entries(INDUSTRY_LABELS).slice(0, 6).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1">
                  <span className={cn('h-2 w-2 rounded-sm', industryDotColor(k))} />
                  {v}
                </span>
              ))}
            </div>
          </Card>

          {/* Side panel: selected day + upcoming */}
          <div className="space-y-4">
            {selectedDay && (
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <Badge variant="secondary" className="text-xs">{selectedDayTenders.length} deadline{selectedDayTenders.length !== 1 ? 's' : ''}</Badge>
                </div>
                {selectedDayTenders.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">No deadlines on this day</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayTenders.map((t) => (
                      <DeadlineRow key={t.id} tender={t} onClick={() => onTenderClick(t)} />
                    ))}
                  </div>
                )}
              </Card>
            )}

            <Card className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-amber-600" /> Upcoming deadlines (60d)
              </h3>
              <ScrollArea className="h-[400px] ti-scroll pr-2">
                {upcoming.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="No upcoming deadlines" />
                ) : (
                  <div className="space-y-1.5">
                    {upcoming.map((t) => {
                      const d = daysUntil(t.deadlineAt)
                      const urgent = d <= 7
                      return (
                        <button
                          key={t.id}
                          onClick={() => onTenderClick(t)}
                          className="flex w-full items-center gap-2.5 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-muted/30"
                        >
                          <div
                            className={cn(
                              'flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md text-xs font-bold',
                              urgent
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : d <= 21
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <span className="text-base leading-none">{d}</span>
                            <span className="text-[8px] uppercase">days</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-xs font-semibold">{t.title}</p>
                            <p className="truncate text-[10px] text-muted-foreground">{t.buyer} · {t.country}</p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <IndustryBadge industry={t.industry} />
                              {urgent && <AlertTriangle className="h-3 w-3 text-rose-500" />}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">{formatBudget(t.budgetMin, t.budgetMax, t.budgetCurrency)}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function DeadlineRow({ tender, onClick }: { tender: Tender; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-muted/30"
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-semibold">{tender.title}</p>
        <p className="truncate text-[10px] text-muted-foreground">{tender.buyer}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <IndustryBadge industry={tender.industry} />
          <RiskBadge level={tender.riskLevel} />
        </div>
      </div>
      <div className="text-right text-[10px]">
        <p className="font-bold">{formatBudget(tender.budgetMin, tender.budgetMax, tender.budgetCurrency)}</p>
      </div>
    </button>
  )
}

function tendersForDay(tenders: Tender[], day: Date): Tender[] {
  return tenders.filter((t) => {
    const d = new Date(t.deadlineAt)
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate()
    )
  })
}

function industryColor(industry: string): string {
  const map: Record<string, string> = {
    construction: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    consulting: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
    defence: 'bg-slate-200 text-slate-800 dark:bg-slate-800/60 dark:text-slate-300',
    technology: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
    mining: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    infrastructure: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
    healthcare: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
  }
  return map[industry] ?? map.technology
}

function industryDotColor(industry: string): string {
  const map: Record<string, string> = {
    construction: 'bg-amber-400',
    consulting: 'bg-violet-400',
    defence: 'bg-slate-400',
    technology: 'bg-cyan-400',
    mining: 'bg-orange-400',
    infrastructure: 'bg-teal-400',
    healthcare: 'bg-rose-400',
  }
  return map[industry] ?? 'bg-slate-400'
}
