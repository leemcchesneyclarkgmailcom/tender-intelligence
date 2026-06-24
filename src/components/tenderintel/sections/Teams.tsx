'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCurrency, relativeTime } from '@/lib/format'
import type { Team, AuditLog as AuditLogType } from '../types'
import { SectionHeader, UserAvatar, EmptyState } from '../shared'
import {
  Users,
  Loader2,
  Plus,
  Crown,
  Shield,
  UserCheck,
  Eye,
  Settings,
  Activity,
} from 'lucide-react'

const ROLE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  owner: { icon: Crown, color: 'text-amber-600 bg-amber-100 dark:bg-amber-950', label: 'Owner' },
  admin: { icon: Shield, color: 'text-rose-600 bg-rose-100 dark:bg-rose-950', label: 'Admin' },
  manager: { icon: UserCheck, color: 'text-teal-600 bg-teal-100 dark:bg-teal-950', label: 'Manager' },
  analyst: { icon: Activity, color: 'text-violet-600 bg-violet-100 dark:bg-violet-950', label: 'Analyst' },
  viewer: { icon: Eye, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800', label: 'Viewer' },
}

export function TeamsSection() {
  const [teams, setTeams] = React.useState<Team[]>([])
  const [logs, setLogs] = React.useState<AuditLogType[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/teams').then((r) => r.json()),
      fetch('/api/audit-logs?limit=12').then((r) => r.json()),
    ]).then(([t, l]) => {
      setTeams(t.teams ?? [])
      setLogs(l.logs ?? [])
      setLoading(false)
    })
  }, [])

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
        title="Teams & Permissions"
        description="Multi-tenant team management with role-based access control"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-1 h-3.5 w-3.5" /> Roles & Permissions
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-1 h-3.5 w-3.5" /> Invite Member
            </Button>
          </div>
        }
      />

      {/* Teams grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((t) => (
          <Card key={t.id} className="overflow-hidden p-0">
            <div className="h-1.5 w-full" style={{ backgroundColor: t.color }} />
            <div className="p-4">
              <h3 className="text-sm font-bold">{t.name}</h3>
              {t.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{t.memberCount}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Members</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{t.activePursuits}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Pursuits</p>
                </div>
                <div>
                  <p className="text-sm font-bold">{formatCurrency(t.pipelineValue, 'USD')}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Pipeline</p>
                </div>
              </div>
              <div className="mt-3 flex -space-x-2">
                {t.members.slice(0, 5).map((m) => (
                  <UserAvatar key={m.user.id} name={m.user.name} color={m.user.avatarColor} size={28} className="ring-2 ring-card" />
                ))}
                {t.members.length > 5 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold ring-2 ring-card">
                    +{t.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Members table + recent activity */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-teal-600" /> All Members
            <Badge variant="secondary" className="ml-auto text-xs">
              {teams.reduce((s, t) => s + t.memberCount, 0)} total
            </Badge>
          </h3>
          <ScrollArea className="h-[440px] ti-scroll pr-2">
            <div className="space-y-1.5">
              {teams.flatMap((t) =>
                t.members.map((m) => ({ ...m, teamName: t.name, teamColor: t.color }))
              ).map((m, i) => {
                const role = ROLE_META[m.user.role] ?? ROLE_META.viewer
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5 hover:bg-muted/30">
                    <UserAvatar name={m.user.name} color={m.user.avatarColor} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-medium">{m.teamName}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
                    </div>
                    <Badge className={`shrink-0 text-[10px] ${role.color}`}>
                      <role.icon className="mr-1 h-3 w-3" /> {role.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-violet-600" /> Permission Matrix
          </h3>
          <div className="space-y-2">
            {Object.entries(ROLE_META).map(([role, meta]) => (
              <div key={role} className="flex items-center gap-2.5 rounded-lg border border-border p-2.5">
                <Badge className={`text-[10px] ${meta.color}`}>
                  <meta.icon className="mr-1 h-3 w-3" /> {meta.label}
                </Badge>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {(role === 'owner' || role === 'admin') && <span className="rounded bg-muted px-1.5 py-0.5">All access</span>}
                  {(role === 'manager') && <span className="rounded bg-muted px-1.5 py-0.5">Manage pipeline</span>}
                  {(role === 'analyst') && <span className="rounded bg-muted px-1.5 py-0.5">Run AI</span>}
                  {(role === 'manager' || role === 'analyst') && <span className="rounded bg-muted px-1.5 py-0.5">Create searches</span>}
                  <span className="rounded bg-muted px-1.5 py-0.5">View feed</span>
                </div>
              </div>
            ))}
          </div>

          <h4 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Team Activity</h4>
          <ScrollArea className="h-[180px] ti-scroll pr-2">
            <div className="space-y-1.5">
              {logs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <div className="min-w-0">
                    <p className="truncate">
                      <span className="font-medium">{log.user?.name ?? 'System'}</span>{' '}
                      <span className="text-muted-foreground">{log.details}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">{relativeTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
