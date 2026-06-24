'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency, relativeTime, INDUSTRY_LABELS } from '@/lib/format'
import type { Competitor } from '../types'
import { SectionHeader, EmptyState } from '../shared'
import {
  Crosshair,
  Loader2,
  TrendingUp,
  Trophy,
  Target,
  AlertTriangle,
  Activity,
  Globe,
  Plus,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from 'lucide-react'

const THREAT_COLORS: Record<string, string> = {
  low: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950',
  medium: 'text-amber-600 bg-amber-100 dark:bg-amber-950',
  high: 'text-rose-600 bg-rose-100 dark:bg-rose-950',
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bid_won: Trophy,
  bid_lost: Target,
  new_contract: TrendingUp,
  partnership: Users,
  expansion: Globe,
  leadership_change: Activity,
}

export function CompetitorsSection() {
  const [competitors, setCompetitors] = React.useState<Competitor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<Competitor | null>(null)

  React.useEffect(() => {
    fetch('/api/competitors')
      .then((r) => r.json())
      .then((d) => {
        setCompetitors(d.competitors ?? [])
        if (d.competitors?.length) setSelected(d.competitors[0])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    )
  }

  const chartData = competitors.map((c) => ({ name: c.name.split(' ')[0], winRate: c.winRate, activeBids: c.activeBids }))

  return (
    <div>
      <SectionHeader
        title="Competitor Intelligence"
        description="Track competitor bid activity, win rates, and strategic moves"
        action={
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Competitor
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-violet-600" /> Win Rate Comparison
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Bid win rate by competitor (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={['#14b8a6', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e', '#10b981'][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-rose-600" /> Threat Posture
          </h3>
          <div className="space-y-3">
            {(['high', 'medium', 'low'] as const).map((level) => {
              const count = competitors.filter((c) => c.threatLevel === level).length
              return (
                <div key={level}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1.5 font-medium capitalize ${THREAT_COLORS[level].split(' ')[0]}`}>
                      <span className={`h-2 w-2 rounded-full ${level === 'high' ? 'bg-rose-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {level} threat
                    </span>
                    <span className="text-muted-foreground">{count} competitor{count !== 1 ? 's' : ''}</span>
                  </div>
                  <Progress value={(count / competitors.length) * 100} color={level === 'high' ? '#f43f5e' : level === 'medium' ? '#f59e0b' : '#10b981'} />
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs">
            <p className="font-medium">Aggregate win rate</p>
            <p className="mt-0.5 text-2xl font-bold text-foreground">
              {(competitors.reduce((s, c) => s + c.winRate, 0) / (competitors.length || 1)).toFixed(1)}%
            </p>
            <p className="mt-0.5 text-muted-foreground">{competitors.reduce((s, c) => s + c.activeBids, 0)} active bids across market</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Competitor list */}
        <Card className="p-3">
          <h3 className="mb-2 px-2 text-sm font-semibold">Tracked Competitors</h3>
          <ScrollArea className="h-[560px] ti-scroll pr-2">
            <div className="space-y-2">
              {competitors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                    selected?.id === c.id ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 text-xs font-bold text-white">
                    {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <Badge className={`shrink-0 text-[10px] ${THREAT_COLORS[c.threatLevel] ?? ''}`}>{c.threatLevel}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{INDUSTRY_LABELS[c.industry] ?? c.industry} · {c.hqCountry ?? 'Global'}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-muted/40 py-1">
                        <p className="text-[10px] text-muted-foreground">Win rate</p>
                        <p className="text-xs font-bold">{c.winRate}%</p>
                      </div>
                      <div className="rounded bg-muted/40 py-1">
                        <p className="text-[10px] text-muted-foreground">Active</p>
                        <p className="text-xs font-bold">{c.activeBids}</p>
                      </div>
                      <div className="rounded bg-muted/40 py-1">
                        <p className="text-[10px] text-muted-foreground">Total wins</p>
                        <p className="text-xs font-bold">{c.totalWins}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Detail panel */}
        <Card className="p-5">
          {selected ? (
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{selected.name}</h3>
                    <Badge className={`text-xs ${THREAT_COLORS[selected.threatLevel] ?? ''}`}>{selected.threatLevel} threat</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{INDUSTRY_LABELS[selected.industry] ?? selected.industry} · {selected.size} · {selected.hqCountry ?? 'Global'}</p>
                  {selected.website && (
                    <a href={`https://${selected.website}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline">
                      <ExternalLink className="h-3 w-3" /> {selected.website}
                    </a>
                  )}
                </div>
              </div>

              {selected.notes && (
                <div className="mb-4 rounded-lg border border-border bg-muted/20 p-3 text-xs leading-relaxed text-foreground/80">
                  {selected.notes}
                </div>
              )}

              <div className="mb-4 grid grid-cols-3 gap-2">
                <Stat icon={Trophy} label="Win rate" value={`${selected.winRate}%`} />
                <Stat icon={Target} label="Active bids" value={String(selected.activeBids)} />
                <Stat icon={TrendingUp} label="Total wins" value={String(selected.totalWins)} />
              </div>

              <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Activity className="h-4 w-4 text-teal-600" /> Recent Activity
              </h4>
              <ScrollArea className="h-[280px] ti-scroll pr-2">
                <div className="space-y-2">
                  {selected.activities.map((a) => {
                    const Icon = ACTIVITY_ICONS[a.type] ?? Activity
                    const positive = a.type === 'bid_won' || a.type === 'new_contract' || a.type === 'expansion'
                    return (
                      <div key={a.id} className="flex items-start gap-2.5 rounded-lg border border-border p-2.5">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${positive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : a.type === 'bid_lost' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40' : 'bg-muted text-muted-foreground'}`}>
                          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : a.type === 'bid_lost' ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">{a.description}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="capitalize">{a.type.replace(/_/g, ' ')}</span>
                            <span>·</span>
                            <span>{relativeTime(a.date)}</span>
                            {a.value != null && (
                              <>
                                <span>·</span>
                                <span className="font-semibold text-foreground">{formatCurrency(a.value, 'USD')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {selected.activities.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted-foreground">No recent activity tracked</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <EmptyState icon={Crosshair} title="Select a competitor" description="Choose a competitor from the list to view detailed intelligence." />
          )}
        </Card>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}
