'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  formatBudget,
  formatCurrency,
  relativeTime,
  daysUntil,
  INDUSTRY_LABELS,
  STAGE_LABELS,
  initials,
  scoreColor,
} from '@/lib/format'
import type { Tender } from './types'
import {
  Building2,
  Calendar,
  Globe,
  TrendingUp,
  ShieldAlert,
  Target,
  Clock,
  ArrowUpRight,
} from 'lucide-react'

/* ───────────────────────── Sparkline ───────────────────────── */
export function Sparkline({
  data,
  color = '#14b8a6',
  width = 80,
  height = 28,
  className,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
  className?: string
}) {
  const gradId = React.useId()
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = width / (data.length - 1 || 1)
  const points = data
    .map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  const areaPoints = `0,${height} ${points} ${width},${height}`
  return (
    <svg width={width} height={height} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r={2.5} fill={color} />
    </svg>
  )
}

/* ───────────────────────── StatCard ───────────────────────── */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  accent = 'teal',
  sub,
  sparkData,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: string
  trendUp?: boolean
  accent?: 'teal' | 'amber' | 'violet' | 'cyan' | 'rose' | 'emerald'
  sub?: string
  sparkData?: number[]
}) {
  const accents: Record<string, { bg: string; spark: string }> = {
    teal: { bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300', spark: '#14b8a6' },
    amber: { bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', spark: '#f59e0b' },
    violet: { bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300', spark: '#8b5cf6' },
    cyan: { bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300', spark: '#06b6d4' },
    rose: { bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', spark: '#f43f5e' },
    emerald: { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', spark: '#10b981' },
  }
  const a = accents[accent]
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-teal-300/60 dark:hover:border-teal-800">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', a.bg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        {trend && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            <ArrowUpRight className={cn('h-3 w-3', !trendUp && 'rotate-90')} />
            {trend}
          </span>
        )}
        {sparkData && sparkData.length > 1 && (
          <Sparkline data={sparkData} color={a.spark} width={70} height={24} className="opacity-80" />
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── ScoreRing ───────────────────────── */
export function ScoreRing({
  score,
  size = 56,
  label,
}: {
  score: number
  size?: number
  label?: string
}) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : score >= 30 ? '#f97316' : '#f43f5e'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={4} className="text-muted/30" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {score}
        </span>
        {label && <span className="text-[8px] uppercase tracking-wide text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}

/* ───────────────────────── Badge helpers ───────────────────────── */
export function IndustryBadge({ industry, className }: { industry: string; className?: string }) {
  const colors: Record<string, string> = {
    construction: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    consulting: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
    defence: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    technology: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    mining: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    infrastructure: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    healthcare: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  }
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', colors[industry] ?? colors.technology, className)}>
      {INDUSTRY_LABELS[industry] ?? industry}
    </span>
  )
}

export function RiskBadge({ level, score }: { level?: string | null; score?: number | null }) {
  if (!level) return null
  const colors: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', colors[level] ?? colors.medium)}>
      <ShieldAlert className="h-3 w-3" />
      {level.charAt(0).toUpperCase() + level.slice(1)}{score != null ? ` · ${score}` : ''}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    closing: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    closed: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    awarded: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  }
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', colors[status] ?? colors.open)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  }
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', colors[priority] ?? colors.medium)}>
      {priority}
    </span>
  )
}

export function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    identified: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    qualifying: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    pursuing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    bidding: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
    won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    lost: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  }
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', colors[stage] ?? colors.identified)}>
      {STAGE_LABELS[stage] ?? stage}
    </span>
  )
}

/* ───────────────────────── TenderCard ───────────────────────── */
export function TenderCard({
  tender,
  onClick,
  compact = false,
}: {
  tender: Tender
  onClick?: () => void
  compact?: boolean
}) {
  const days = daysUntil(tender.deadlineAt)
  const closingSoon = days <= 14 && days >= 0
  return (
    <button
      onClick={onClick}
      className="group block w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-teal-400/60 hover:shadow-md dark:hover:border-teal-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <IndustryBadge industry={tender.industry} />
            <StatusBadge status={tender.status} />
            <RiskBadge level={tender.riskLevel} score={tender.riskScore} />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300">
            {tender.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{tender.buyer}</span>
            <span className="text-muted-foreground/50">·</span>
            <Globe className="h-3 w-3" />
            <span className="truncate">{tender.country}</span>
          </div>
        </div>
        {tender.opportunityScore != null && !compact && (
          <ScoreRing score={tender.opportunityScore} label="opp" size={48} />
        )}
      </div>

      {!compact && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{tender.summary ?? tender.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <Target className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          {formatBudget(tender.budgetMin, tender.budgetMax, tender.budgetCurrency)}
        </span>
        <span className={cn('inline-flex items-center gap-1', closingSoon ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
          <Clock className="h-3 w-3" />
          {days < 0 ? `Closed ${relativeTime(tender.deadlineAt)}` : `${days}d to deadline`}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {relativeTime(tender.publishedAt)}
        </span>
      </div>
    </button>
  )
}

/* ───────────────────────── Avatar ───────────────────────── */
export function UserAvatar({
  name,
  color,
  size = 32,
  className,
}: {
  name: string
  color?: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white', className)}
      style={{ backgroundColor: color ?? '#0d9488', width: size, height: size }}
      title={name}
    >
      {initials(name)}
    </div>
  )
}

/* ───────────────────────── Progress bar ───────────────────────── */
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color ?? '#14b8a6' }}
      />
    </div>
  )
}

/* ───────────────────────── Section header ───────────────────────── */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/* ───────────────────────── Empty state ───────────────────────── */
export function EmptyState({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

/* ───────────────────────── Skeleton ───────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  )
}

/* ───────────────────────── AI status pill ───────────────────────── */
export function AIStatusPill({ live = false }: { live?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
        live
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      )}
      title={live ? 'Live LLM connected' : 'AI using deterministic fallback (LLM unavailable)'}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-emerald-500 ti-live-dot' : 'bg-amber-500')} />
      AI {live ? 'Live' : 'Fallback'}
    </span>
  )
}

/* re-export trend icon for convenience */
export { TrendingUp }
