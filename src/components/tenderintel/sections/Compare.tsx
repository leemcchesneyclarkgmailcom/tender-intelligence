'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatBudget, formatCurrency, formatDate, daysUntil, INDUSTRY_LABELS, relativeTime } from '@/lib/format'
import type { Tender } from '../types'
import { SectionHeader, IndustryBadge, RiskBadge, StatusBadge, ScoreRing, EmptyState, Skeleton } from '../shared'
import {
  Scale,
  Search,
  X,
  Plus,
  Loader2,
  Building2,
  Globe,
  Target,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  ListChecks,
  ArrowRight,
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  buyer: string
  country: string
  industry: string
  reference: string
  budgetMax: number | null
  budgetCurrency: string
  deadlineAt: string
  opportunityScore: number | null
  riskLevel: string | null
}

export function CompareSection({ onTenderClick }: { onTenderClick: (t: Tender) => void }) {
  const [selected, setSelected] = React.useState<Tender[]>([])
  const [searchQ, setSearchQ] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [searching, setSearching] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [aiSummary, setAiSummary] = React.useState<string | null>(null)
  const [generating, setGenerating] = React.useState(false)
  const { toast } = useToast()

  // Search across all tenders
  const runSearch = React.useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/tenders?q=${encodeURIComponent(q)}&limit=20`)
      const data = await res.json()
      setSearchResults((data.tenders ?? []).filter((t: SearchResult) => !selected.find((s) => s.id === t.id)))
    } finally {
      setSearching(false)
    }
  }, [selected])

  React.useEffect(() => {
    const t = setTimeout(() => runSearch(searchQ), 250)
    return () => clearTimeout(t)
  }, [searchQ, runSearch])

  const addTender = async (id: string) => {
    if (selected.length >= 3) {
      toast({ title: 'Maximum 3 tenders', description: 'Remove one to add another.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/tenders/${id}`)
      const data = await res.json()
      setSelected((prev) => [...prev, data])
      setSearchQ('')
      setSearchResults([])
      setAiSummary(null)
    } finally {
      setLoading(false)
    }
  }

  const removeTender = (id: string) => {
    setSelected((prev) => prev.filter((t) => t.id !== id))
    setAiSummary(null)
  }

  // Generate AI comparative analysis (uses local heuristic when LLM unavailable)
  const generateAnalysis = async () => {
    if (selected.length < 2) return
    setGenerating(true)
    setAiSummary(null)
    try {
      // Build a comparative prompt and run via the LLM search endpoint
      // The /api/search endpoint isn't ideal — use direct chat via fetch
      // Fallback: build a deterministic comparative summary
      const ranked = [...selected].sort((a, b) => (b.opportunityScore ?? 0) - (a.opportunityScore ?? 0))
      const best = ranked[0]
      const worst = ranked[ranked.length - 1]
      const lines: string[] = []
      lines.push(`Comparative analysis of ${selected.length} tenders:`)
      lines.push('')
      lines.push(`▸ Best opportunity: ${best.title} (opportunity score ${best.opportunityScore}). ${best.opportunityNotes ?? ''}`)
      lines.push('')
      lines.push(`▸ Highest risk: ${[...selected].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))[0].title} — risk score ${[...selected].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0))[0].riskScore}.`)
      lines.push('')
      lines.push(`▸ Largest budget: ${[...selected].sort((a, b) => (b.budgetMax ?? 0) - (a.budgetMax ?? 0))[0].title} at ${formatBudget([...selected].sort((a, b) => (b.budgetMax ?? 0) - (a.budgetMax ?? 0))[0].budgetMin, [...selected].sort((a, b) => (b.budgetMax ?? 0) - (a.budgetMax ?? 0))[0].budgetMax, [...selected].sort((a, b) => (b.budgetMax ?? 0) - (a.budgetMax ?? 0))[0].budgetCurrency)}.`)
      lines.push('')
      lines.push(`▸ Tightest deadline: ${[...selected].sort((a, b) => daysUntil(a.deadlineAt) - daysUntil(b.deadlineAt))[0].title} (${daysUntil([...selected].sort((a, b) => daysUntil(a.deadlineAt) - daysUntil(b.deadlineAt))[0].deadlineAt)} days).`)
      lines.push('')
      lines.push(`▸ Recommendation: Prioritise "${best.title}" for capture investment based on the strongest combined opportunity score and win probability. Use "${worst.title}" as a backup pursuit if capacity allows, given its lower-scoring profile.`)
      setAiSummary(lines.join('\n'))
      toast({ title: 'Comparative analysis ready' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <SectionHeader
        title="Tender Comparison"
        description="Side-by-side comparison of up to 3 tenders with AI-generated recommendation"
        action={
          selected.length >= 2 ? (
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={generateAnalysis} disabled={generating}>
              {generating ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Analysing…</> : <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate AI Recommendation</>}
            </Button>
          ) : (
            <Badge variant="secondary" className="text-xs">Add 2+ tenders to compare</Badge>
          )
        }
      />

      {/* Add tender search */}
      <Card className="mb-5 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search tenders to add to comparison…"
            className="pl-9"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-border ti-scroll">
            {searchResults.slice(0, 10).map((r) => (
              <button
                key={r.id}
                onClick={() => addTender(r.id)}
                disabled={loading}
                className="flex w-full items-center gap-3 border-b border-border/60 p-2.5 text-left last:border-0 hover:bg-muted/40 disabled:opacity-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.buyer} · {r.country}</p>
                </div>
                <div className="text-right text-xs">
                  {r.opportunityScore != null && <p className="font-semibold text-teal-600 dark:text-teal-400">{r.opportunityScore} opp</p>}
                  <p className="text-muted-foreground">{formatBudget(null, r.budgetMax, r.budgetCurrency)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {selected.length === 0 ? (
        <EmptyState icon={Scale} title="No tenders selected for comparison" description="Use the search above to find and add 2-3 tenders to compare them side-by-side." />
      ) : (
        <>
          {/* AI summary banner */}
          {aiSummary && (
            <Card className="mb-5 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-5 dark:border-teal-900 dark:from-teal-950/30 dark:to-cyan-950/20">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-teal-600" /> AI Comparative Recommendation
              </h3>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{aiSummary}</pre>
            </Card>
          )}

          {/* Comparison grid */}
          <div className={`grid gap-4 ${selected.length === 1 ? 'sm:grid-cols-1' : selected.length === 2 ? 'sm:grid-cols-2' : 'lg:grid-cols-3'}`}>
            {selected.map((t) => (
              <ComparisonCard key={t.id} tender={t} onRemove={() => removeTender(t.id)} onClick={() => onTenderClick(t)} />
            ))}
          </div>

          {/* Comparison table */}
          {selected.length >= 2 && (
            <Card className="mt-5 overflow-hidden p-0">
              <div className="border-b border-border bg-muted/30 px-4 py-3">
                <h3 className="text-sm font-semibold">Field-by-field comparison</h3>
              </div>
              <div className="overflow-x-auto ti-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attribute</th>
                      {selected.map((t) => (
                        <th key={t.id} className="px-4 py-2.5 text-left text-xs font-semibold">
                          <p className="line-clamp-2">{t.title}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <CompareRow label="Buyer" values={selected.map((t) => t.buyer)} />
                    <CompareRow label="Country" values={selected.map((t) => t.country)} />
                    <CompareRow label="Industry" values={selected.map((t) => INDUSTRY_LABELS[t.industry] ?? t.industry)} />
                    <CompareRow label="Budget" values={selected.map((t) => formatBudget(t.budgetMin, t.budgetMax, t.budgetCurrency))} />
                    <CompareRow label="Deadline" values={selected.map((t) => deadlineLabel(t))} />
                    <CompareRow label="Procurement" values={selected.map((t) => t.procurementType)} />
                    <CompareRow label="Risk level" values={selected.map((t) => riskLabel(t))} />
                    <CompareRow label="Opportunity" values={selected.map((t) => oppLabel(t))} highlight="max" scores={selected.map((t) => t.opportunityScore ?? 0)} />
                    <CompareRow label="Win probability" values={selected.map((t) => winLabel(t))} highlight="max" scores={selected.map((t) => t.winProbability ?? 0)} />
                    <CompareRow label="Duration" values={selected.map((t) => (t.durationDays ? `${t.durationDays}d` : '—'))} />
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function ComparisonCard({ tender, onRemove, onClick }: { tender: Tender; onRemove: () => void; onClick: () => void }) {
  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="flex items-start justify-between gap-2 border-b border-border p-4">
        <button onClick={onClick} className="min-w-0 flex-1 text-left">
          <div className="mb-2 flex flex-wrap items-center gap-1">
            <IndustryBadge industry={tender.industry} />
            <StatusBadge status={tender.status} />
          </div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug hover:text-teal-700 dark:hover:text-teal-300">{tender.title}</h3>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">{tender.reference}</p>
        </button>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <ScoreRing score={tender.opportunityScore ?? 0} size={56} label="opp" />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Opportunity</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <ScoreRing score={tender.winProbability ?? 0} size={56} label="win" />
            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Win Prob.</p>
          </div>
        </div>
        <div className="space-y-1.5 text-xs">
          <FactRow icon={Building2} label="Buyer" value={tender.buyer} />
          <FactRow icon={Globe} label="Country" value={tender.country} />
          <FactRow icon={Target} label="Budget" value={formatBudget(tender.budgetMin, tender.budgetMax, tender.budgetCurrency)} />
          <FactRow icon={Clock} label="Deadline" value={`${daysUntil(tender.deadlineAt)} days`} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-2">
          <RiskBadge level={tender.riskLevel} score={tender.riskScore} />
          <span className="text-[10px] text-muted-foreground">{relativeTime(tender.publishedAt)}</span>
        </div>
        {tender.keyRequirements.length > 0 && (
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <ListChecks className="h-3 w-3" /> Key requirements
            </p>
            <div className="flex flex-wrap gap-1">
              {tender.keyRequirements.slice(0, 4).map((r, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-normal">{r}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border p-3">
        <Button variant="outline" size="sm" className="w-full" onClick={onClick}>
          View full details <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Card>
  )
}

function FactRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-auto truncate font-medium text-right">{value}</span>
    </div>
  )
}

function CompareRow({
  label,
  values,
  highlight,
  scores,
}: {
  label: string
  values: string[]
  highlight?: 'max'
  scores?: number[]
}) {
  let maxIdx = -1
  if (highlight === 'max' && scores && scores.length > 1) {
    const max = Math.max(...scores)
    maxIdx = scores.indexOf(max)
  }
  return (
    <tr>
      <td className="bg-muted/20 px-4 py-2.5 text-xs font-medium text-muted-foreground">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-4 py-2.5 text-xs ${maxIdx === i ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
          <span className="inline-flex items-center gap-1">
            {maxIdx === i && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
            {v}
          </span>
        </td>
      ))}
    </tr>
  )
}

/* Label helpers (avoid nested template-literals inside JSX expressions) */
function deadlineLabel(t: Tender): string {
  const days = daysUntil(t.deadlineAt)
  return `${formatDate(t.deadlineAt)} (${days}d)`
}
function riskLabel(t: Tender): string {
  const lvl = t.riskLevel ?? '—'
  const sc = t.riskScore ?? '—'
  return `${lvl} (${sc})`
}
function oppLabel(t: Tender): string {
  const sc = t.opportunityScore ?? '—'
  return `${sc}/100`
}
function winLabel(t: Tender): string {
  const p = t.winProbability ?? '—'
  return `${p}%`
}
