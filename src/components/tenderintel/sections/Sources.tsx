'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { relativeTime, formatDateTime } from '@/lib/format'
import type { CollectionSource } from '../types'
import { SectionHeader } from '../shared'
import {
  Radar,
  Loader2,
  Globe,
  Activity,
  Zap,
  ExternalLink,
  RefreshCw,
  Clock,
  Database,
  CheckCircle2,
} from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  portal: 'Procurement Portal',
  tender_site: 'Tender Website',
  infrastructure: 'Infrastructure Feed',
  rss: 'RSS Feed',
  api: 'API Integration',
}

export function SourcesSection() {
  const [sources, setSources] = React.useState<CollectionSource[]>([])
  const [loading, setLoading] = React.useState(true)
  const [scanOpen, setScanOpen] = React.useState(false)
  const [scanSector, setScanSector] = React.useState('government procurement tender')
  const [scanRegion, setScanRegion] = React.useState('global')
  const [scanning, setScanning] = React.useState(false)
  const [scanResults, setScanResults] = React.useState<unknown[] | null>(null)
  const { toast } = useToast()

  const load = React.useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/sources')
    const data = await res.json()
    setSources(data.sources ?? [])
    setLoading(false)
  }, [])

  React.useEffect(() => { load() }, [load])

  const runScan = async () => {
    setScanning(true)
    setScanResults(null)
    toast({ title: 'Collection scan started', description: `Querying live web for "${scanSector}" (${scanRegion})…` })
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: scanSector, region: scanRegion }),
      })
      const data = await res.json()
      setScanResults(data.results ?? [])
      toast({ title: 'Scan complete', description: `${Array.isArray(data.results) ? data.results.length : 0} live results found.` })
      load()
    } finally {
      setScanning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    )
  }

  const totalItems = sources.reduce((s, x) => s + x.itemsFound, 0)
  const activeCount = sources.filter((s) => s.status === 'active').length
  const maxItems = Math.max(...sources.map((s) => s.itemsFound), 1)

  return (
    <div>
      <SectionHeader
        title="Collection Sources"
        description="Continuously monitored public procurement portals and government tender websites"
        action={
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setScanOpen(true)}>
            <Zap className="mr-1 h-3.5 w-3.5" /> Run Live Scan
          </Button>
        }
      />

      {/* Summary */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Radar className="h-3.5 w-3.5" /> Active sources
          </div>
          <p className="mt-1 text-2xl font-bold">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="h-3.5 w-3.5" /> Total items indexed
          </div>
          <p className="mt-1 text-2xl font-bold">{totalItems.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Queue workers
          </div>
          <p className="mt-1 text-2xl font-bold">4<span className="text-sm font-normal text-muted-foreground"> / 4</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Avg scan interval
          </div>
          <p className="mt-1 text-2xl font-bold">24<span className="text-sm font-normal text-muted-foreground">h</span></p>
        </Card>
      </div>

      {/* Sources grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{s.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{TYPE_LABELS[s.type] ?? s.type}</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] dark:bg-emerald-950 dark:text-emerald-300">
                <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 ti-live-dot" />
                {s.status}
              </Badge>
            </div>

            <a href={s.url} target="_blank" rel="noopener noreferrer" className="mb-3 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline">
              <ExternalLink className="h-3 w-3" /> {s.url.replace('https://', '')}
            </a>

            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-muted/40 p-2">
                <p className="text-[10px] text-muted-foreground">Region</p>
                <p className="font-semibold">{s.region}</p>
              </div>
              <div className="rounded bg-muted/40 p-2">
                <p className="text-[10px] text-muted-foreground">Country</p>
                <p className="font-semibold">{s.country ?? 'Global'}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Items indexed</span>
                <span className="font-semibold">{s.itemsFound.toLocaleString()}</span>
              </div>
              <Progress value={(s.itemsFound / maxItems) * 100} />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] text-muted-foreground">
              <span>Scans every {s.scanFreqHrs}h</span>
              <span>{s.lastScanAt ? `Last: ${relativeTime(s.lastScanAt)}` : 'Never scanned'}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Live scan results */}
      {scanResults && (
        <Card className="mt-5 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Live Web Scan Results
            <Badge variant="secondary" className="ml-1 text-xs">{Array.isArray(scanResults) ? scanResults.length : 0} items</Badge>
          </h3>
          <div className="max-h-80 overflow-y-auto space-y-2 ti-scroll pr-2">
            {Array.isArray(scanResults) && scanResults.length > 0 ? (
              scanResults.map((r: Record<string, unknown>, i) => (
                <div key={i} className="rounded-lg border border-border p-2.5 text-xs">
                  <p className="font-semibold">{String(r.title ?? r.snippet ?? 'Untitled').slice(0, 140)}</p>
                  {(r.url || r.link) && (
                    <a href={String(r.url ?? r.link)} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-block truncate text-[10px] text-teal-600 hover:underline">
                      {String(r.url ?? r.link)}
                    </a>
                  )}
                  {r.snippet && <p className="mt-0.5 line-clamp-2 text-muted-foreground">{String(r.snippet).slice(0, 200)}</p>}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">No live results returned. Try a different sector.</p>
            )}
          </div>
        </Card>
      )}

      {/* Scan dialog */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Live Collection Scan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Sector / keyword</Label>
              <Select value={scanSector} onValueChange={setScanSector}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="government procurement tender">Government procurement (general)</SelectItem>
                  <SelectItem value="construction infrastructure tender">Construction & infrastructure</SelectItem>
                  <SelectItem value="defence procurement contract">Defence procurement</SelectItem>
                  <SelectItem value="technology cloud government contract">Technology & cloud</SelectItem>
                  <SelectItem value="mining resources tender">Mining & resources</SelectItem>
                  <SelectItem value="consulting advisory government framework">Consulting frameworks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm font-medium">Region</Label>
              <Select value={scanRegion} onValueChange={setScanRegion}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="European Union">European Union</SelectItem>
                  <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              This triggers a live web search via the AI pipeline, surfaces fresh procurement notices, and updates all source "last scanned" timestamps. Results are shown below for review.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)}>Close</Button>
            <Button onClick={runScan} disabled={scanning} className="bg-teal-600 hover:bg-teal-700">
              {scanning ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Scanning…</> : <><Zap className="mr-1.5 h-3.5 w-3.5" /> Run Scan</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
