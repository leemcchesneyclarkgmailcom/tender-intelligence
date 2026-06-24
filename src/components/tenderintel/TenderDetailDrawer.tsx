'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { formatBudget, formatCurrency, formatDate, daysUntil, relativeTime, INDUSTRY_LABELS } from '@/lib/format'
import type { Tender } from './types'
import {
  IndustryBadge,
  RiskBadge,
  StatusBadge,
  ScoreRing,
  UserAvatar,
  ProgressBar,
} from './shared'
import {
  Building2,
  Globe,
  Calendar,
  Clock,
  Target,
  ShieldAlert,
  Sparkles,
  Loader2,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle2,
  ListChecks,
  Tag,
  Briefcase,
} from 'lucide-react'

export function TenderDetailDrawer({
  tenderId,
  onClose,
  onAnalyzed,
}: {
  tenderId: string | null
  onClose: () => void
  onAnalyzed?: () => void
}) {
  const [tender, setTender] = React.useState<Tender | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [analyzing, setAnalyzing] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    if (!tenderId) {
      setTender(null)
      return
    }
    setLoading(true)
    fetch(`/api/tenders/${tenderId}`)
      .then((r) => r.json())
      .then((data) => setTender(data))
      .finally(() => setLoading(false))
  }, [tenderId])

  const runAnalysis = async () => {
    if (!tenderId) return
    setAnalyzing(true)
    toast({ title: 'AI analysis running', description: 'Summarising, scoring risk & opportunity…' })
    try {
      const res = await fetch(`/api/tenders/${tenderId}/analyze`, { method: 'POST' })
      const data = await res.json()
      if (data.tender) {
        setTender((prev) => (prev ? { ...prev, ...data.tender } : prev))
        toast({ title: 'AI analysis complete', description: 'Risk, opportunity & summary updated.' })
        onAnalyzed?.()
      }
    } catch {
      toast({ title: 'Analysis failed', description: 'Please retry.', variant: 'destructive' })
    } finally {
      setAnalyzing(false)
    }
  }

  const open = tenderId !== null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {tender && <IndustryBadge industry={tender.industry} />}
                {tender && <StatusBadge status={tender.status} />}
                {tender && <RiskBadge level={tender.riskLevel} score={tender.riskScore} />}
              </div>
              <SheetTitle className="text-base font-bold leading-snug">
                {loading ? 'Loading…' : tender?.title}
              </SheetTitle>
              {tender && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">{tender.reference}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tender ? (
          <ScrollArea className="flex-1 ti-scroll">
            <div className="space-y-6 p-6">
              {/* AI scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                  <ScoreRing score={tender.opportunityScore ?? 0} size={64} label="opportunity" />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">Opportunity Score</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                  <ScoreRing score={tender.winProbability ?? 0} size={64} label="win prob" />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">Win Probability</p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={runAnalysis} disabled={analyzing} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Run AI Analysis
                    </>
                  )}
                </Button>
                {tender.url && (
                  <Button variant="outline" asChild>
                    <a href={tender.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Source Portal
                    </a>
                  </Button>
                )}
              </div>

              {/* Key facts grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Fact icon={Building2} label="Buyer" value={tender.buyer} sub={tender.buyerType} />
                <Fact icon={Briefcase} label="Procurement" value={tender.procurementType} sub={tender.category} />
                <Fact icon={Globe} label="Country" value={tender.country} sub={tender.region ?? undefined} />
                <Fact icon={Target} label="Budget" value={formatBudget(tender.budgetMin, tender.budgetMax, tender.budgetCurrency)} sub={`${tender.budgetCurrency}`} />
                <Fact icon={Calendar} label="Published" value={formatDate(tender.publishedAt)} sub={relativeTime(tender.publishedAt)} />
                <Fact icon={Clock} label="Deadline" value={formatDate(tender.deadlineAt)} sub={daysUntil(tender.deadlineAt) < 0 ? 'closed' : `${daysUntil(tender.deadlineAt)} days left`} />
              </div>

              {tender.durationDays && (
                <Fact icon={Calendar} label="Duration" value={`${tender.durationDays} days (~${Math.round(tender.durationDays / 30)} months)`} />
              )}

              <Separator />

              {/* AI Summary */}
              {tender.summary && (
                <section>
                  <SectionTitle icon={FileText}>AI Executive Summary</SectionTitle>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{tender.summary}</p>
                </section>
              )}

              {/* Risk assessment */}
              {tender.riskNotes && (
                <section>
                  <SectionTitle icon={ShieldAlert}>Risk Assessment</SectionTitle>
                  <div className="mt-2 rounded-lg border border-border bg-rose-50/50 p-3 dark:bg-rose-950/20">
                    <div className="mb-2 flex items-center justify-between">
                      <RiskBadge level={tender.riskLevel} score={tender.riskScore} />
                      <span className="text-xs text-muted-foreground">Risk score</span>
                    </div>
                    <ProgressBar value={tender.riskScore ?? 0} color="#f43f5e" />
                    <p className="mt-2 text-xs leading-relaxed text-foreground/80">{tender.riskNotes}</p>
                  </div>
                </section>
              )}

              {/* Opportunity notes */}
              {tender.opportunityNotes && (
                <section>
                  <SectionTitle icon={Target}>Opportunity Rationale</SectionTitle>
                  <div className="mt-2 rounded-lg border border-border bg-teal-50/50 p-3 dark:bg-teal-950/20">
                    <p className="text-xs leading-relaxed text-foreground/80">{tender.opportunityNotes}</p>
                  </div>
                </section>
              )}

              {/* Key requirements */}
              {tender.keyRequirements.length > 0 && (
                <section>
                  <SectionTitle icon={ListChecks}>Key Requirements</SectionTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tender.keyRequirements.map((req, i) => (
                      <Badge key={i} variant="secondary" className="font-normal">
                        <CheckCircle2 className="mr-1 h-3 w-3 text-teal-600" />
                        {req}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Industry tags */}
              {tender.industries.length > 0 && (
                <section>
                  <SectionTitle icon={Tag}>Industry Classification</SectionTitle>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tender.industries.map((ind, i) => (
                      <Badge key={i} variant="outline" className="font-normal">
                        {INDUSTRY_LABELS[ind] ?? ind}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {/* Full description */}
              <section>
                <SectionTitle icon={FileText}>Full Specification</SectionTitle>
                <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3 text-xs leading-relaxed text-foreground/80 ti-scroll">
                  {tender.description}
                </div>
              </section>

              {/* Pipeline + alerts */}
              {tender.pipelineEntries && tender.pipelineEntries.length > 0 && (
                <section>
                  <SectionTitle icon={Briefcase}>In Pipeline</SectionTitle>
                  <div className="mt-2 space-y-2">
                    {tender.pipelineEntries.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-xs">
                        <span className="font-medium capitalize">{p.stage}</span>
                        {p.owner && (
                          <span className="flex items-center gap-1.5">
                            <UserAvatar name={p.owner.name} color={p.owner.avatarColor} size={20} />
                            {p.owner.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tender.contactEmail && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {tender.contactEmail}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      {children}
    </h3>
  )
}
