'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, INDUSTRY_LABELS } from '@/lib/format'
import type { DashboardData } from '../types'
import { SectionHeader, Sparkline } from '../shared'
import {
  LineChart as LineIcon,
  Globe,
  TrendingUp,
  Building2,
  Target,
  ShieldAlert,
  DollarSign,
  Activity,
  Award,
  Loader2,
  Sparkles,
  MapPin,
} from 'lucide-react'

const CHART_COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#6366f1', '#ec4899']
const COUNTRY_FLAG: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  Australia: '🇦🇺',
  Canada: '🇨🇦',
  Germany: '🇩🇪',
  Singapore: '🇸🇬',
  'United Arab Emirates': '🇦🇪',
  Japan: '🇯🇵',
  Brazil: '🇧🇷',
  'South Africa': '🇿🇦',
}

export function AnalyticsSection({ data }: { data: DashboardData | null }) {
  const [extraData, setExtraData] = React.useState<{
    procurementTypes: { type: string; count: number; value: number }[]
    buyerTypes: { type: string; count: number }[]
    riskVsOpp: { x: number; y: number; name: string; budget: number }[]
    industryRadar: { industry: string; count: number; value: number; risk: number }[]
  } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/tenders?limit=200')
      .then((r) => r.json())
      .then((d) => {
        const tenders = d.tenders ?? []
        // procurement type aggregation
        const procMap = new Map<string, { count: number; value: number }>()
        for (const t of tenders) {
          const cur = procMap.get(t.procurementType) ?? { count: 0, value: 0 }
          cur.count += 1
          cur.value += t.budgetMax ?? 0
          procMap.set(t.procurementType, cur)
        }
        const procurementTypes = Array.from(procMap.entries()).map(([type, v]) => ({ type, ...v }))
        // buyer type aggregation
        const btMap = new Map<string, number>()
        for (const t of tenders) btMap.set(t.buyerType, (btMap.get(t.buyerType) ?? 0) + 1)
        const buyerTypes = Array.from(btMap.entries()).map(([type, count]) => ({ type, count }))
        // risk vs opportunity scatter
        const riskVsOpp = tenders
          .filter((t: { riskScore: number | null; opportunityScore: number | null }) => t.riskScore != null && t.opportunityScore != null)
          .map((t: { riskScore: number | null; opportunityScore: number | null; title: string; budgetMax: number | null }) => ({
            x: t.riskScore as number,
            y: t.opportunityScore as number,
            name: (t.title as string).slice(0, 30),
            budget: (t.budgetMax ?? 0) / 1e6,
          }))
        // industry radar (normalised)
        const indMap = new Map<string, { count: number; value: number; risk: number }>()
        for (const t of tenders) {
          const cur = indMap.get(t.industry) ?? { count: 0, value: 0, risk: 0 }
          cur.count += 1
          cur.value += t.budgetMax ?? 0
          cur.risk += t.riskScore ?? 0
          indMap.set(t.industry, cur)
        }
        const industryRadar = Array.from(indMap.entries()).map(([industry, v]) => ({
          industry: INDUSTRY_LABELS[industry] ?? industry,
          count: v.count,
          value: Math.round(v.value / 1e6),
          risk: v.count > 0 ? Math.round(v.risk / v.count) : 0,
        }))
        setExtraData({ procurementTypes, buyerTypes, riskVsOpp, industryRadar })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data || !extraData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    )
  }

  const { byIndustry, byCountry, topBuyers, trends, riskDistribution, winBuckets } = data
  const { procurementTypes, buyerTypes, riskVsOpp, industryRadar } = extraData

  // Buyer concentration (HHI-like — top buyer share of total budget)
  const totalBudget = topBuyers.reduce((s, b) => s + b.value, 0) || 1
  const topBuyerShare = topBuyers.length > 0 ? (topBuyers[0].value / totalBudget) * 100 : 0
  const top3Share = topBuyers.slice(0, 3).reduce((s, b) => s + b.value, 0) / totalBudget * 100

  // Country distribution with flags
  const countryData = byCountry.map((c) => ({
    ...c,
    flag: COUNTRY_FLAG[c.name] ?? '🌐',
    share: (c.count / byCountry.reduce((s, x) => s + x.count, 0)) * 100,
  }))

  return (
    <div>
      <SectionHeader
        title="Market Analytics"
        description="Deep-dive into procurement market structure, buyer concentration, and opportunity distribution"
        action={
          <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            <Sparkles className="mr-1 h-3 w-3" /> {data.totals.tenders} tenders analysed
          </Badge>
        }
      />

      {/* Top stats */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard icon={Globe} label="Countries monitored" value={byCountry.length} sub="Across 6 continents" accent="cyan" />
        <MetricCard icon={Building2} label="Active buyers" value={topBuyers.length} sub={`Top buyer holds ${topBuyerShare.toFixed(1)}% of budget`} accent="teal" />
        <MetricCard icon={Award} label="Buyer concentration (top 3)" value={`${top3Share.toFixed(1)}%`} sub={top3Share > 50 ? 'Highly concentrated market' : 'Diversified buyer base'} accent={top3Share > 50 ? 'rose' : 'emerald'} />
        <MetricCard icon={DollarSign} label="Avg. deal size" value={formatCurrency(data.totalAddressableBudget / Math.max(data.totals.tenders, 1), 'USD')} sub="Per tracked tender" accent="violet" />
      </div>

      {/* Row 1: Country breakdown + Industry radar */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Globe className="h-4 w-4 text-cyan-600" /> Geographic Distribution
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">Tender count by country</p>
          <div className="space-y-2.5">
            {countryData.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-lg">{c.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{c.count} ({c.share.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.share}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-violet-600" /> Industry Comparison
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Multi-dimensional view: count, value, risk</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={industryRadar}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="industry" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <PolarRadiusAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Radar name="Count" dataKey="count" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
              <Radar name="Risk (avg)" dataKey="risk" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Risk vs Opportunity scatter + Procurement types */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-teal-600" /> Risk vs Opportunity
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Each point = one tender · bubble size = budget</p>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                type="number"
                dataKey="x"
                name="Risk"
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                label={{ value: 'Risk →', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Opportunity"
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                label={{ value: 'Opportunity →', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
              />
              <ZAxis type="number" dataKey="budget" range={[40, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number, n: string) => (n === 'budget' ? `$${v.toFixed(1)}M` : v)}
              />
              <Scatter data={riskVsOpp} fill="#14b8a6" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="rounded bg-emerald-50 p-1.5 dark:bg-emerald-950/30">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">{riskVsOpp.filter((d) => d.x < 50 && d.y >= 60).length}</p>
              <p className="text-muted-foreground">Sweet spot</p>
            </div>
            <div className="rounded bg-amber-50 p-1.5 dark:bg-amber-950/30">
              <p className="font-bold text-amber-700 dark:text-amber-400">{riskVsOpp.filter((d) => d.x >= 50 && d.y >= 60).length}</p>
              <p className="text-muted-foreground">High reward/risk</p>
            </div>
            <div className="rounded bg-rose-50 p-1.5 dark:bg-rose-950/30">
              <p className="font-bold text-rose-700 dark:text-rose-400">{riskVsOpp.filter((d) => d.x >= 50 && d.y < 50).length}</p>
              <p className="text-muted-foreground">Avoid</p>
            </div>
            <div className="rounded bg-slate-50 p-1.5 dark:bg-slate-800/40">
              <p className="font-bold text-slate-700 dark:text-slate-300">{riskVsOpp.filter((d) => d.x < 50 && d.y < 50).length}</p>
              <p className="text-muted-foreground">Low stakes</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4 text-amber-600" /> Procurement Type Mix
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Distribution by procurement mechanism</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={procurementTypes} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} stroke="#94a3b8" width={80} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number, n: string) => (n === 'value' ? formatCurrency(v, 'USD') : v)}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {procurementTypes.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {procurementTypes.slice(0, 4).map((p, i) => (
              <div key={p.type} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
                <span className="flex items-center gap-1.5 capitalize">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  {p.type}
                </span>
                <span className="font-semibold">{p.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Trends + Buyer concentration */}
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-teal-600" /> 12-Week Trend (Count & Value)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Weekly published tender volume and budget value</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number, n: string) => (n === 'Budget (M)' ? `$${v.toFixed(1)}M` : v)}
              />
              <Line yAxisId="left" type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3, fill: '#14b8a6' }} name="Count" />
              <Line yAxisId="right" type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Budget (M)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Award className="h-4 w-4 text-violet-600" /> Buyer Concentration
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Top buyers by share of total budget</p>
          <ScrollArea className="h-[230px] ti-scroll pr-2">
            <div className="space-y-2">
              {topBuyers.map((b, i) => {
                const share = (b.value / totalBudget) * 100
                return (
                  <div key={b.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate font-medium">{i + 1}. {b.name}</span>
                      <span className="ml-2 shrink-0 font-semibold">{share.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${share}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Row 4: Industry by value + Buyer types + Win prob */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-emerald-600" /> Budget by Industry
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Addressable budget distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byIndustry.map((d) => ({ name: INDUSTRY_LABELS[d.name] ?? d.name, value: d.value }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={9}
              >
                {byIndustry.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number) => formatCurrency(v, 'USD')}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4 text-cyan-600" /> Buyer Type Mix
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Government / agency / municipal / defence</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={buyerTypes}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                paddingAngle={3}
              >
                {buyerTypes.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {buyerTypes.map((b, i) => (
              <div key={b.type} className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1">
                <span className="flex items-center gap-1.5 capitalize">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                  {b.type}
                </span>
                <span className="font-semibold">{b.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-amber-600" /> Win Probability Distribution
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">Bucketed AI win-probability scores</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={winBuckets} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {winBuckets.map((b, i) => (
                  <Cell
                    key={i}
                    fill={
                      b.range === '81-100%' ? '#10b981' :
                      b.range === '61-80%' ? '#14b8a6' :
                      b.range === '41-60%' ? '#f59e0b' :
                      b.range === '21-40%' ? '#f97316' : '#f43f5e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded bg-emerald-50 p-1.5 text-center dark:bg-emerald-950/30">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">{winBuckets.filter((b) => b.range === '81-100%' || b.range === '61-80%').reduce((s, b) => s + b.count, 0)}</p>
              <p className="text-muted-foreground">High-prob wins</p>
            </div>
            <div className="rounded bg-rose-50 p-1.5 text-center dark:bg-rose-950/30">
              <p className="font-bold text-rose-700 dark:text-rose-400">{winBuckets.filter((b) => b.range === '0-20%' || b.range === '21-40%').reduce((s, b) => s + b.count, 0)}</p>
              <p className="text-muted-foreground">Long shots</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub: string
  accent: 'teal' | 'amber' | 'violet' | 'cyan' | 'rose' | 'emerald'
}) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  }
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-md ${colors[accent]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
    </Card>
  )
}
