'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency, INDUSTRY_LABELS, relativeTime, STAGE_LABELS } from '@/lib/format'
import type { DashboardData, Tender, Alert } from '../types'
import {
  StatCard,
  TenderCard,
  IndustryBadge,
  RiskBadge,
  EmptyState,
} from '../shared'
import {
  Rss,
  DollarSign,
  Clock,
  Target,
  Bell,
  ShieldAlert,
  Crosshair,
  TrendingUp,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const CHART_COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#6366f1']

export function DashboardSection({
  data,
  onTenderClick,
  onViewAll,
}: {
  data: DashboardData
  onTenderClick: (t: Tender) => void
  onViewAll: (section: string) => void
}) {
  const { kpis, trends, byIndustry, riskDistribution, winBuckets, pipelineSummary, topBuyers, recentTenders, recentAlerts, byCountry } = data

  const riskData = [
    { name: 'Low', value: riskDistribution.low, color: '#10b981' },
    { name: 'Medium', value: riskDistribution.medium, color: '#f59e0b' },
    { name: 'High', value: riskDistribution.high, color: '#f97316' },
    { name: 'Critical', value: riskDistribution.critical, color: '#f43f5e' },
  ].filter((d) => d.value > 0)

  const maxPipelineValue = Math.max(...pipelineSummary.map((p) => p.value), 1)

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Active Tenders" value={kpis.activeTenders} icon={Rss} accent="teal" trend="+12 this week" trendUp sub="Live monitoring" />
        <StatCard label="Pipeline Value" value={formatCurrency(kpis.pipelineValue, 'USD')} icon={DollarSign} accent="emerald" trend="+8.2%" trendUp sub="Weighted pursuit value" />
        <StatCard label="Closing ≤14d" value={kpis.closingThisWeek} icon={Clock} accent="amber" sub="Action required" />
        <StatCard label="Avg Win Prob." value={`${kpis.avgWinProbability}%`} icon={Target} accent="violet" trend="+4pts" trendUp sub="AI-scored" />
        <StatCard label="Unread Alerts" value={kpis.unreadAlerts} icon={Bell} accent="rose" sub="Needs review" />
        <StatCard label="High Risk" value={kpis.highRiskTenders} icon={ShieldAlert} accent="amber" sub="Senior review" />
        <StatCard label="Competitors" value={kpis.totalCompetitors} icon={Crosshair} accent="cyan" sub="Tracked" />
      </div>

      {/* Total addressable budget banner */}
      <Card className="overflow-hidden border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 p-5 dark:border-teal-900 dark:from-teal-950/40 dark:to-cyan-950/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-teal-700 dark:text-teal-300">Total Addressable Budget</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{formatCurrency(data.totalAddressableBudget, 'USD')}</p>
            <p className="mt-1 text-xs text-muted-foreground">Across {data.totals.tenders} tracked opportunities · {byCountry.length} countries · {byIndustry.length} industries</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewAll('reports')}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Report
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => onViewAll('feed')}>
              Browse Feed <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tender volume trend */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-teal-600" /> Tender Volume & Value
              </h3>
              <p className="text-xs text-muted-foreground">Last 12 weeks · published tenders</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-teal-500" /> Count
              <span className="ml-2 mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" /> Value
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trends} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number, n: string) => (n === 'value' ? formatCurrency(v, 'USD') : v)}
              />
              <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} fill="url(#countGrad)" name="Tenders" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk distribution */}
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <ShieldAlert className="h-4 w-4 text-rose-600" /> Risk Distribution
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">AI-assessed risk levels</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {riskData.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {riskData.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Industry breakdown */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-violet-600" /> Opportunities by Industry
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Count and addressable budget by sector</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byIndustry.map((d) => ({ ...d, label: INDUSTRY_LABELS[d.name] ?? d.name }))} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number, n: string) => (n === 'value' ? formatCurrency(v, 'USD') : v)}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byIndustry.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Win probability distribution */}
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-teal-600" /> Win Probability
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Distribution of AI-scored win probability</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={winBuckets} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" width={60} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {winBuckets.map((b, i) => (
                  <Cell key={i} fill={b.range === '81-100%' ? '#10b981' : b.range === '61-80%' ? '#14b8a6' : b.range === '41-60%' ? '#f59e0b' : b.range === '21-40%' ? '#f97316' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Pipeline summary + Top buyers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-cyan-600" /> Pipeline by Stage
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onViewAll('pipeline')}>
              View board <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            {pipelineSummary.filter((p) => p.stage !== 'won' && p.stage !== 'lost').map((p) => (
              <div key={p.stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{STAGE_LABELS[p.stage] ?? p.stage}</span>
                  <span className="text-muted-foreground">
                    {p.count} · {formatCurrency(p.value, 'USD')}
                  </span>
                </div>
                <Progress value={(p.value / maxPipelineValue) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Crosshair className="h-4 w-4 text-violet-600" /> Top Buyers by Budget
          </h3>
          <ScrollArea className="h-[180px] ti-scroll pr-3">
            <div className="space-y-2.5">
              {topBuyers.map((b, i) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{b.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.count} tender{b.count !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{formatCurrency(b.value, 'USD')}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Recent tenders + alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Rss className="h-4 w-4 text-teal-600" /> Recently Published
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onViewAll('feed')}>
              View all <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recentTenders.slice(0, 4).map((t) => (
              <TenderCard key={t.id} tender={t} onClick={() => onTenderClick(t)} compact />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4 text-rose-600" /> Recent Alerts
            </h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onViewAll('searches')}>
              All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <ScrollArea className="h-[280px] ti-scroll pr-3">
            <div className="space-y-2">
              {recentAlerts.map((a) => (
                <AlertRow key={a.id} alert={a} onClick={() => a.tender && onTenderClick(a.tender)} />
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

function AlertRow({ alert, onClick }: { alert: Alert; onClick?: () => void }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    new_tender: Rss,
    deadline_reminder: Clock,
    risk_change: ShieldAlert,
    score_change: Target,
    competitor: Crosshair,
    saved_search: CheckCircle2,
  }
  const Icon = icons[alert.type] ?? AlertCircle
  const colors: Record<string, string> = {
    info: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40',
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    critical: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
  }
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-lg border border-border p-2.5 text-left transition-colors hover:bg-muted/40"
    >
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${colors[alert.severity] ?? colors.info}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold">{alert.title}</p>
          {!alert.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
        </div>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{alert.message}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">{relativeTime(alert.createdAt)}</p>
      </div>
    </button>
  )
}
