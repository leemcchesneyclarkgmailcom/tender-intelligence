'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateTime, relativeTime } from '@/lib/format'
import type { AuditLog } from '../types'
import { SectionHeader, UserAvatar } from '../shared'
import { Loader2, Search, ScrollText, Filter } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  login: 'Sign In',
  view_tender: 'Viewed Tender',
  create_search: 'Created Search',
  update_pipeline: 'Updated Pipeline',
  ai_summarize: 'AI Analysis',
  generate_report: 'Generated Report',
  invite_user: 'Invited User',
  scan_triggered: 'Scan Triggered',
}

const RESOURCE_COLORS: Record<string, string> = {
  auth: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  tender: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  saved_search: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  pipeline: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  report: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  team: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  source: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
}

export function AuditLogsSection() {
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [action, setAction] = React.useState('all')
  const [q, setQ] = React.useState('')

  React.useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (action !== 'all') params.set('action', action)
    fetch(`/api/audit-logs?${params}&limit=100`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .finally(() => setLoading(false))
  }, [action])

  const filtered = logs.filter((l) => {
    if (!q) return true
    const hay = `${l.details} ${l.action} ${l.resource} ${l.user?.name ?? ''}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <div>
      <SectionHeader
        title="Audit Logs"
        description="Immutable record of all user and system activity for compliance"
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity…" className="h-8 pl-8 text-xs" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All actions</SelectItem>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary" className="text-xs">{filtered.length} entries</Badge>
        </div>
      </Card>

      <Card className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No audit entries found</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-260px)] ti-scroll">
            <div className="divide-y divide-border">
              {filtered.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30">
                  {log.user ? (
                    <UserAvatar name={log.user.name} color={log.user.avatarColor} size={32} />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <ScrollText className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{log.user?.name ?? 'System'}</span>
                      <Badge className={`text-[10px] ${RESOURCE_COLORS[log.resource] ?? RESOURCE_COLORS.auth}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                      {log.resource && (
                        <Badge variant="outline" className="text-[10px] font-normal">{log.resource}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{log.details}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground/60">
                      <span>{formatDateTime(log.createdAt)}</span>
                      <span>·</span>
                      <span>{relativeTime(log.createdAt)}</span>
                      {log.ipAddress && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{log.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  )
}
