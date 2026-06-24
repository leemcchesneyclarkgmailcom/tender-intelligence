'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Rss,
  KanbanSquare,
  Crosshair,
  Bell,
  Bookmark,
  FileBarChart,
  Users,
  Radar,
  ScrollText,
  Search,
  Sun,
  Moon,
  Building2,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Plus,
  Menu,
  X,
} from 'lucide-react'

export type SectionId =
  | 'dashboard'
  | 'feed'
  | 'pipeline'
  | 'competitors'
  | 'searches'
  | 'reports'
  | 'teams'
  | 'sources'
  | 'audit'

const NAV: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'feed', label: 'Tender Feed', icon: Rss, group: 'Overview' },
  { id: 'pipeline', label: 'Opportunity Pipeline', icon: KanbanSquare, group: 'Workflow' },
  { id: 'competitors', label: 'Competitor Intelligence', icon: Crosshair, group: 'Workflow' },
  { id: 'searches', label: 'Saved Searches & Alerts', icon: Bookmark, group: 'Workflow' },
  { id: 'reports', label: 'Reports & Intelligence', icon: FileBarChart, group: 'Workflow' },
  { id: 'sources', label: 'Collection Sources', icon: Radar, group: 'Platform' },
  { id: 'teams', label: 'Teams & Permissions', icon: Users, group: 'Platform' },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText, group: 'Platform' },
]

export function AppShell({
  active,
  onNavigate,
  unreadAlerts,
  totalTenders,
  tenantName,
  onGlobalSearch,
  searchValue,
  onSearchChange,
  onOpenAlerts,
  children,
  mobileNavOpen,
  setMobileNavOpen,
}: {
  active: SectionId
  onNavigate: (s: SectionId) => void
  unreadAlerts: number
  totalTenders: number
  tenantName: string
  onGlobalSearch: (q: string) => void
  searchValue: string
  onSearchChange: (v: string) => void
  onOpenAlerts: () => void
  children: React.ReactNode
  mobileNavOpen: boolean
  setMobileNavOpen: (v: boolean) => void
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof NAV>()
    for (const item of NAV) {
      if (!map.has(item.group)) map.set(item.group, [])
      map.get(item.group)!.push(item)
    }
    return Array.from(map.entries())
  }, [])

  const Sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 shadow-lg shadow-teal-900/20">
          <Radar className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-sidebar-foreground">Tender Intelligence</p>
          <p className="truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Enterprise Procurement OS</p>
        </div>
        <button
          className="ml-auto rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 ti-scroll">
        {groups.map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">{group}</p>
            {items.map((item) => {
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    setMobileNavOpen(false)
                  }}
                  className={cn(
                    'group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground')} />
                  {item.label}
                  {item.id === 'feed' && totalTenders > 0 && (
                    <Badge variant="secondary" className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground text-[10px]">
                      {totalTenders}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Tenant footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-sidebar-accent/50 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sidebar-foreground">{tenantName}</p>
            <p className="flex items-center gap-1 text-[10px] text-sidebar-foreground/50">
              <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" /> Enterprise plan · Multi-tenant
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">{Sidebar}</aside>

        {/* Mobile sidebar */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72">{Sidebar}</div>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global semantic search */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onGlobalSearch(searchValue)
              }}
              className="relative max-w-xl flex-1"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tenders in natural language… (e.g. 'Australian civil works over $50M')"
                className="h-9 pl-9 pr-20"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 h-7 -translate-y-1/2 bg-teal-600 px-2.5 text-xs hover:bg-teal-700"
              >
                <Sparkles className="mr-1 h-3 w-3" /> AI
              </Button>
            </form>

            <div className="ml-auto flex items-center gap-1.5">
              {/* Alerts */}
              <Button variant="ghost" size="icon" className="relative" onClick={onOpenAlerts}>
                <Bell className="h-5 w-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {unreadAlerts}
                  </span>
                )}
              </Button>

              {/* Theme toggle */}
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <div className="mx-1 h-6 w-px bg-border" />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-xs font-semibold text-white">
                      EW
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-semibold leading-tight">Eleanor Whitfield</p>
                      <p className="text-[10px] text-muted-foreground">Owner · BuildCore</p>
                    </div>
                    <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">Eleanor Whitfield</p>
                    <p className="text-xs font-normal text-muted-foreground">eleanor.whitfield@buildcore.com</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" /> Profile & Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Security & Access
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Plus className="mr-2 h-4 w-4" /> Invite Team Member
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-rose-600 focus:text-rose-700">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

          {/* Footer */}
          <footer className="mt-auto border-t border-border bg-card px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 ti-live-dot" />
                <span>All systems operational</span>
                <span className="text-muted-foreground/40">·</span>
                <span>Queue workers: 4 active</span>
                <span className="hidden text-muted-foreground/40 sm:inline">·</span>
                <span className="hidden sm:inline">Vector index synced 2m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href="#" className="hover:text-foreground">Docs</Link>
                <Link href="#" className="hover:text-foreground">API</Link>
                <Link href="#" className="hover:text-foreground">Status</Link>
                <span className="text-muted-foreground/40">·</span>
                <span>© 2025 Tender Intelligence</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
