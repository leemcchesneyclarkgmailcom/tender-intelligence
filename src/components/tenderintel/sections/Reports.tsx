'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { formatDateTime, formatDate } from '@/lib/format'
import type { Report } from '../types'
import { SectionHeader, EmptyState } from '../shared'
import {
  FileBarChart,
  Loader2,
  Sparkles,
  Plus,
  FileText,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  weekly: 'Weekly Digest',
  market_intelligence: 'Market Intelligence',
  competitor_brief: 'Competitor Brief',
  pipeline_review: 'Pipeline Review',
}

const TYPE_COLORS: Record<string, string> = {
  weekly: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  market_intelligence: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  competitor_brief: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  pipeline_review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}

export function ReportsSection() {
  const [reports, setReports] = React.useState<Report[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<Report | null>(null)
  const [genOpen, setGenOpen] = React.useState(false)
  const [genType, setGenType] = React.useState('weekly')
  const [genIndustry, setGenIndustry] = React.useState('all')
  const [generating, setGenerating] = React.useState(false)
  const { toast } = useToast()

  const load = React.useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/reports')
    const data = await res.json()
    setReports(data.reports ?? [])
    if (data.reports?.length && !selected) setSelected(data.reports[0])
    setLoading(false)
  }, [selected])

  React.useEffect(() => { load() }, [load])

  const generate = async () => {
    setGenerating(true)
    toast({ title: 'Generating report…', description: 'AI is analysing the market and writing the report.' })
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: genType, industry: genIndustry }),
      })
      const data = await res.json()
      if (data.report) {
        toast({ title: 'Report generated', description: data.report.title })
        setGenOpen(false)
        load()
      }
    } catch {
      toast({ title: 'Generation failed', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

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
        title="Reports & Intelligence"
        description="AI-generated weekly digests, market intelligence summaries, and competitor briefs"
        action={
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setGenOpen(true)}>
            <Sparkles className="mr-1 h-3.5 w-3.5" /> Generate Report
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Report list */}
        <Card className="p-3">
          <h3 className="mb-2 px-2 text-sm font-semibold">Report Library</h3>
          <ScrollArea className="h-[600px] ti-scroll pr-2">
            <div className="space-y-2">
              {reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`flex w-full flex-col gap-1.5 rounded-lg border p-3 text-left transition-all ${
                    selected?.id === r.id ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20' : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={`text-[10px] ${TYPE_COLORS[r.type] ?? TYPE_COLORS.weekly}`}>{TYPE_LABELS[r.type] ?? r.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug">{r.title}</p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground">{r.summary}</p>
                </button>
              ))}
              {reports.length === 0 && (
                <EmptyState icon={FileBarChart} title="No reports yet" description="Generate your first AI report." />
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Report viewer */}
        <Card className="p-6">
          {selected ? (
            <div>
              <div className="mb-4 border-b border-border pb-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className={`text-xs ${TYPE_COLORS[selected.type] ?? TYPE_COLORS.weekly}`}>{TYPE_LABELS[selected.type] ?? selected.type}</Badge>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="mr-1 h-3 w-3" /> {formatDate(selected.periodStart)} – {formatDate(selected.periodEnd)}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">Generated {formatDateTime(selected.createdAt)}</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight">{selected.title}</h2>
              </div>

              {/* Summary */}
              <div className="mb-5 rounded-lg border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/20">
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-teal-600" /> Executive Summary
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">{selected.summary}</p>
              </div>

              {/* Highlights */}
              {selected.content?.highlights?.length > 0 && (
                <div className="mb-5">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 text-emerald-600" /> Key Highlights
                  </h3>
                  <ul className="space-y-1.5">
                    {selected.content.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span className="text-foreground/90">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selected.content?.recommendations?.length > 0 && (
                <div className="mb-5">
                  <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                    <Lightbulb className="h-4 w-4 text-amber-600" /> Recommendations
                  </h3>
                  <div className="space-y-2">
                    {selected.content.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/40 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/20">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">{i + 1}</span>
                        <span className="text-foreground/90">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections */}
              {selected.content?.sections?.length > 0 && (
                <div className="space-y-3">
                  {selected.content.sections.map((s, i) => (
                    <div key={i} className="rounded-lg border border-border p-4">
                      <h4 className="mb-1.5 text-sm font-semibold">{s.heading}</h4>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{s.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
                </Button>
                <Button variant="outline" size="sm">Share with team</Button>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Sparkles className="mr-1 h-3.5 w-3.5" /> Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState icon={FileBarChart} title="Select a report" description="Choose a report from the library to view its full content." />
          )}
        </Card>
      </div>

      {/* Generate dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Report type</label>
              <Select value={genType} onValueChange={setGenType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                  <SelectItem value="market_intelligence">Market Intelligence</SelectItem>
                  <SelectItem value="competitor_brief">Competitor Brief</SelectItem>
                  <SelectItem value="pipeline_review">Pipeline Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Industry focus</label>
              <Select value={genIndustry} onValueChange={setGenIndustry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="defence">Defence</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="mining">Mining & Resources</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              The AI pipeline will analyse tracked tenders for the selected scope, generate an executive summary, key highlights, and actionable recommendations.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
            <Button onClick={generate} disabled={generating} className="bg-teal-600 hover:bg-teal-700">
              {generating ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating…</> : <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
