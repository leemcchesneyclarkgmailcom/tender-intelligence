'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Search, SlidersHorizontal, Sparkles, X, RotateCcw } from 'lucide-react'
import type { Tender } from '../types'
import { TenderCard, EmptyState, SectionHeader } from '../shared'

interface SearchResponse {
  query: string
  intent: string
  plan: { keywords: string[]; industries: string[]; countries: string[] }
  results: (Tender & { searchScore: number })[]
  count: number
}

export function TenderFeedSection({
  onTenderClick,
  externalQuery,
  onQueryConsumed,
}: {
  onTenderClick: (t: Tender) => void
  externalQuery?: string
  onQueryConsumed?: () => void
}) {
  const [tenders, setTenders] = React.useState<Tender[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<Record<string, string>>({
    industry: 'all',
    country: 'all',
    status: 'all',
    riskLevel: 'all',
    procurementType: 'all',
    sortBy: 'publishedAt',
    sortDir: 'desc',
  })
  const [q, setQ] = React.useState('')
  const [searching, setSearching] = React.useState(false)
  const [searchResult, setSearchResult] = React.useState<SearchResponse | null>(null)
  const [filterOptions, setFilterOptions] = React.useState<{ industries: string[]; countries: string[] }>({ industries: [], countries: [] })

  const loadTenders = React.useCallback(async () => {
    setLoading(true)
    setSearchResult(null)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => v && v !== 'all' && params.set(k, v))
    if (q) params.set('q', q)
    const res = await fetch(`/api/tenders?${params}`)
    const data = await res.json()
    setTenders(data.tenders ?? [])
    setFilterOptions({ industries: data.filters?.industries ?? [], countries: data.filters?.countries ?? [] })
    setLoading(false)
  }, [filters, q])

  React.useEffect(() => {
    loadTenders()
  }, [loadTenders])

  // Handle external semantic search from the global top bar
  React.useEffect(() => {
    if (externalQuery) {
      runSemanticSearch(externalQuery)
      onQueryConsumed?.()
    }
  }, [externalQuery, onQueryConsumed])

  const runSemanticSearch = async (query: string) => {
    if (!query.trim()) return
    setSearching(true)
    setLoading(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data: SearchResponse = await res.json()
      setSearchResult(data)
      setTenders(data.results)
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({ industry: 'all', country: 'all', status: 'all', riskLevel: 'all', procurementType: 'all', sortBy: 'publishedAt', sortDir: 'desc' })
    setQ('')
    setSearchResult(null)
  }

  return (
    <div>
      <SectionHeader
        title="Tender Feed"
        description="Continuously monitored government procurement opportunities worldwide"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="mr-1 h-3 w-3 text-teal-600" /> AI-enriched
            </Badge>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        }
      />

      {/* Semantic search banner */}
      {searchResult && (
        <Card className="mb-4 border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900 dark:bg-teal-950/20">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">AI Semantic Search</p>
                <Badge variant="secondary" className="text-xs">{searchResult.count} results</Badge>
              </div>
              <p className="mt-1 text-xs text-foreground/70">
                <span className="font-medium">Intent:</span> {searchResult.intent}
              </p>
              {searchResult.plan.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {searchResult.plan.keywords.slice(0, 8).map((k) => (
                    <Badge key={k} variant="outline" className="text-[10px] font-normal">{k}</Badge>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 shrink-0" onClick={() => { setSearchResult(null); loadTenders() }}>
              <X className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Filters sidebar */}
        <Card className="h-fit p-4 lg:sticky lg:top-20">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Filters</h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Keyword</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Title, buyer, ref…"
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <FilterSelect label="Industry" value={filters.industry} onChange={(v) => setFilters({ ...filters, industry: v })} options={filterOptions.industries} />
            <FilterSelect label="Country" value={filters.country} onChange={(v) => setFilters({ ...filters, country: v })} options={filterOptions.countries} />
            <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={['open', 'closing', 'closed', 'awarded']} />
            <FilterSelect label="Risk Level" value={filters.riskLevel} onChange={(v) => setFilters({ ...filters, riskLevel: v })} options={['low', 'medium', 'high', 'critical']} />
            <FilterSelect label="Procurement" value={filters.procurementType} onChange={(v) => setFilters({ ...filters, procurementType: v })} options={['open', 'selective', 'negotiated', 'framework', 'rfp', 'rfq']} />
            <FilterSelect label="Sort by" value={filters.sortBy} onChange={(v) => setFilters({ ...filters, sortBy: v })} options={['publishedAt', 'deadlineAt', 'opportunityScore', 'riskScore', 'budgetMax', 'winProbability']} />
          </div>
        </Card>

        {/* Results */}
        <div>
          {loading ? (
            <div className="space-y-3">
              {searching && (
                <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-sm dark:border-teal-900 dark:bg-teal-950/20">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  <span className="text-teal-700 dark:text-teal-300">Running AI semantic search…</span>
                </div>
              )}
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-1.5">
                        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-14 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-3 flex gap-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : tenders.length === 0 ? (
            <EmptyState icon={Search} title="No tenders found" description="Try adjusting your filters or search query." />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing <span className="font-semibold text-foreground">{tenders.length}</span> opportunities
                  {searchResult && <span> · ranked by AI relevance</span>}
                </span>
              </div>
              <ScrollArea className="h-[calc(100vh-220px)] ti-scroll pr-3">
                <div className="grid gap-3 pb-4">
                  {tenders.map((t) => (
                    <TenderCard key={t.id} tender={t} onClick={() => onTenderClick(t)} />
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="text-xs capitalize">
              {o.replace(/-/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
