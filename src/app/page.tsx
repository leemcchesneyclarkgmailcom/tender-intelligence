'use client'

import * as React from 'react'
import { AppShell, type SectionId } from '@/components/tenderintel/AppShell'
import { DashboardSection } from '@/components/tenderintel/sections/Dashboard'
import { TenderFeedSection } from '@/components/tenderintel/sections/TenderFeed'
import { PipelineSection } from '@/components/tenderintel/sections/Pipeline'
import { CompetitorsSection } from '@/components/tenderintel/sections/Competitors'
import { SearchesSection } from '@/components/tenderintel/sections/Searches'
import { ReportsSection } from '@/components/tenderintel/sections/Reports'
import { TeamsSection } from '@/components/tenderintel/sections/Teams'
import { AuditLogsSection } from '@/components/tenderintel/sections/AuditLogs'
import { SourcesSection } from '@/components/tenderintel/sections/Sources'
import { CompareSection } from '@/components/tenderintel/sections/Compare'
import { CalendarSection } from '@/components/tenderintel/sections/Calendar'
import { AnalyticsSection } from '@/components/tenderintel/sections/Analytics'
import { TenderDetailDrawer } from '@/components/tenderintel/TenderDetailDrawer'
import type { DashboardData, Tender } from '@/components/tenderintel/types'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [section, setSection] = React.useState<SectionId>('dashboard')
  const [dashboard, setDashboard] = React.useState<DashboardData | null>(null)
  const [dashLoading, setDashLoading] = React.useState(true)
  const [selectedTender, setSelectedTender] = React.useState<Tender | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [pendingSearch, setPendingSearch] = React.useState<string | undefined>(undefined)
  const [mobileNav, setMobileNav] = React.useState(false)

  const loadDashboard = React.useCallback(async () => {
    setDashLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setDashboard(data)
    } catch (e) {
      console.error('dashboard load failed', e)
    } finally {
      setDashLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleGlobalSearch = (q: string) => {
    if (!q.trim()) return
    setPendingSearch(q)
    setSection('feed')
  }

  const handleNavigate = (s: SectionId) => {
    setSection(s)
    // refresh dashboard data when returning to it (reflects AI analysis changes)
    if (s === 'dashboard') loadDashboard()
  }

  const unreadAlerts = dashboard?.kpis.unreadAlerts ?? 0
  const totalTenders = dashboard?.totals.tenders ?? 0
  const tenantName = 'BuildCore Group'

  return (
    <AppShell
      active={section}
      onNavigate={handleNavigate}
      unreadAlerts={unreadAlerts}
      totalTenders={totalTenders}
      tenantName={tenantName}
      onGlobalSearch={handleGlobalSearch}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onOpenAlerts={() => setSection('searches')}
      mobileNavOpen={mobileNav}
      setMobileNavOpen={setMobileNav}
    >
      {dashLoading && section === 'dashboard' ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span className="ml-2 text-sm text-muted-foreground">Loading intelligence dashboard…</span>
        </div>
      ) : (
        <React.Suspense fallback={null}>
          {section === 'dashboard' && dashboard && (
            <DashboardSection
              data={dashboard}
              onTenderClick={setSelectedTender}
              onViewAll={(s) => setSection(s as SectionId)}
            />
          )}
          {section === 'feed' && (
            <TenderFeedSection
              onTenderClick={setSelectedTender}
              externalQuery={pendingSearch}
              onQueryConsumed={() => setPendingSearch(undefined)}
            />
          )}
          {section === 'pipeline' && <PipelineSection onTenderClick={setSelectedTender} />}
          {section === 'compare' && <CompareSection onTenderClick={setSelectedTender} />}
          {section === 'calendar' && <CalendarSection onTenderClick={setSelectedTender} />}
          {section === 'analytics' && <AnalyticsSection data={dashboard} />}
          {section === 'competitors' && <CompetitorsSection />}
          {section === 'searches' && <SearchesSection onTenderClick={setSelectedTender} />}
          {section === 'reports' && <ReportsSection />}
          {section === 'teams' && <TeamsSection />}
          {section === 'sources' && <SourcesSection />}
          {section === 'audit' && <AuditLogsSection />}
        </React.Suspense>
      )}

      <TenderDetailDrawer
        tenderId={selectedTender?.id ?? null}
        onClose={() => setSelectedTender(null)}
        onAnalyzed={loadDashboard}
      />
    </AppShell>
  )
}
