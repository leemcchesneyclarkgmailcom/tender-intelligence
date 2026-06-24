'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { relativeTime } from '@/lib/format'
import type { SavedSearch, Alert, Tender } from '../types'
import { SectionHeader, EmptyState } from '../shared'
import {
  Bookmark,
  Bell,
  Plus,
  Trash2,
  Search,
  Check,
  Clock,
  ShieldAlert,
  Target,
  Crosshair,
  Rss,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react'

export function SearchesSection({ onTenderClick }: { onTenderClick: (t: Tender) => void }) {
  const [searches, setSearches] = React.useState<SavedSearch[]>([])
  const [alerts, setAlerts] = React.useState<Alert[]>([])
  const [loading, setLoading] = React.useState(true)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newName, setNewName] = React.useState('')
  const [newQuery, setNewQuery] = React.useState('')
  const [newNotify, setNewNotify] = React.useState(true)
  const { toast } = useToast()

  const load = React.useCallback(async () => {
    setLoading(true)
    const [s, a] = await Promise.all([
      fetch('/api/saved-searches').then((r) => r.json()),
      fetch('/api/alerts').then((r) => r.json()),
    ])
    setSearches(s.searches ?? [])
    setAlerts(a.alerts ?? [])
    setLoading(false)
  }, [])

  React.useEffect(() => { load() }, [load])

  const createSearch = async () => {
    if (!newName || !newQuery) {
      toast({ title: 'Name and query required', variant: 'destructive' })
      return
    }
    await fetch('/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, query: newQuery, filters: {}, notifyEmail: newNotify }),
    })
    toast({ title: 'Saved search created', description: `"${newName}" is now monitoring new tenders.` })
    setNewName('')
    setNewQuery('')
    setCreateOpen(false)
    load()
  }

  const deleteSearch = async (id: string) => {
    await fetch(`/api/saved-searches/${id}`, { method: 'DELETE' })
    toast({ title: 'Saved search deleted' })
    load()
  }

  const toggleAlert = async (alert: Alert) => {
    await fetch(`/api/alerts/${alert.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !alert.read }),
    })
    load()
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
        title="Saved Searches & Alerts"
        description="Natural-language saved searches with automated alert generation"
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Plus className="mr-1 h-3.5 w-3.5" /> New Saved Search
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Saved Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Search name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Australian civil works >$50M" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">Natural-language query</Label>
                  <Input value={newQuery} onChange={(e) => setNewQuery(e.target.value)} placeholder="e.g. civil construction Australia large infrastructure" />
                  <p className="mt-1 text-xs text-muted-foreground">Our AI will parse this into structured filters and run it against new tenders daily.</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email notifications</p>
                      <p className="text-xs text-muted-foreground">Alert me when new matches are found</p>
                    </div>
                  </div>
                  <Switch checked={newNotify} onCheckedChange={setNewNotify} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createSearch} className="bg-teal-600 hover:bg-teal-700">Create Search</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Saved searches */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Bookmark className="h-4 w-4 text-teal-600" /> Saved Searches
            <Badge variant="secondary" className="ml-auto text-xs">{searches.length}</Badge>
          </h3>
          {searches.length === 0 ? (
            <EmptyState icon={Bookmark} title="No saved searches" description="Create a saved search to monitor new tenders automatically." />
          ) : (
            <div className="space-y-2.5">
              {searches.map((s) => (
                <div key={s.id} className="group rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{s.name}</p>
                        {s.notifyEmail && <Mail className="h-3 w-3 text-teal-600" />}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Search className="h-3 w-3" /> {s.query}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded bg-muted/50 px-1.5 py-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> {s.resultCount} results
                        </span>
                        {s.lastRunAt && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> ran {relativeTime(s.lastRunAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteSearch(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alerts */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Bell className="h-4 w-4 text-rose-600" /> Alert Centre
            <Badge variant="secondary" className="ml-auto text-xs">
              {alerts.filter((a) => !a.read).length} unread
            </Badge>
          </h3>
          {alerts.length === 0 ? (
            <EmptyState icon={Bell} title="No alerts" description="Alerts will appear here when tenders match your saved searches." />
          ) : (
            <ScrollArea className="h-[520px] ti-scroll pr-2">
              <div className="space-y-2">
                {alerts.map((a) => (
                  <AlertCard key={a.id} alert={a} onToggle={() => toggleAlert(a)} onClick={() => a.tender && onTenderClick(a.tender)} />
                ))}
              </div>
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  )
}

function AlertCard({ alert, onToggle, onClick }: { alert: Alert; onToggle: () => void; onClick: () => void }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    new_tender: Rss,
    deadline_reminder: Clock,
    risk_change: ShieldAlert,
    score_change: Target,
    competitor: Crosshair,
    saved_search: Bookmark,
  }
  const Icon = icons[alert.type] ?? AlertCircle
  const colors: Record<string, string> = {
    info: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40',
    success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    critical: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
  }
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border p-3 transition-colors ${alert.read ? 'border-border/60 bg-muted/10' : 'border-border bg-card'}`}>
      <button onClick={onClick} className="flex w-full items-start gap-2.5 text-left">
        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${colors[alert.severity] ?? colors.info}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`truncate text-xs ${alert.read ? 'font-normal text-muted-foreground' : 'font-semibold'}`}>{alert.title}</p>
            {!alert.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{alert.message}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/60">{relativeTime(alert.createdAt)}</p>
        </div>
      </button>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onToggle}>
        {alert.read ? <span className="text-[10px] text-muted-foreground">Undo</span> : <Check className="h-3.5 w-3.5 text-emerald-600" />}
      </Button>
    </div>
  )
}
