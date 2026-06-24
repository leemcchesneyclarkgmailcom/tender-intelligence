/** Shared types for the Tender Intelligence frontend. */

export type TenderStatus = 'open' | 'closing' | 'closed' | 'awarded' | 'cancelled'

export interface Tender {
  id: string
  reference: string
  title: string
  description: string
  buyer: string
  buyerType: string
  country: string
  region?: string | null
  industry: string
  category: string
  procurementType: string
  budgetMin: number | null
  budgetMax: number | null
  budgetCurrency: string
  publishedAt: string
  deadlineAt: string
  durationDays: number | null
  status: TenderStatus
  url?: string | null
  contactEmail?: string | null
  summary?: string | null
  riskScore?: number | null
  riskLevel?: string | null
  riskNotes?: string | null
  opportunityScore?: number | null
  winProbability?: number | null
  opportunityNotes?: string | null
  industries: string[]
  keyRequirements: string[]
  aiProcessedAt?: string | null
  source?: { id: string; name: string; url: string } | null
  pipelineEntries?: PipelineEntry[]
  alerts?: Alert[]
}

export interface PipelineEntry {
  id: string
  stage: string
  priority: string
  pursuitValue: number | null
  notes: string | null
  dueDate: string | null
  tender: Tender
  team?: { id: string; name: string; color: string } | null
  owner?: { id: string; name: string; avatarColor: string; jobTitle: string | null } | null
}

export interface Competitor {
  id: string
  name: string
  website?: string | null
  industry: string
  hqCountry?: string | null
  size: string
  winRate: number
  activeBids: number
  totalWins: number
  threatLevel: string
  notes?: string | null
  activities: CompetitorActivity[]
}

export interface CompetitorActivity {
  id: string
  type: string
  description: string
  value: number | null
  date: string
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: Record<string, unknown>
  notifyEmail: boolean
  lastRunAt: string | null
  resultCount: number
  createdAt: string
}

export interface Alert {
  id: string
  type: string
  severity: string
  title: string
  message: string
  read: boolean
  createdAt: string
  tender?: Tender | null
}

export interface Report {
  id: string
  title: string
  type: string
  periodStart: string
  periodEnd: string
  summary: string
  content: {
    highlights?: string[]
    recommendations?: string[]
    sections?: { heading: string; body: string }[]
    stats?: Record<string, number>
  }
  status: string
  createdAt: string
}

export interface Team {
  id: string
  name: string
  description?: string | null
  color: string
  memberCount: number
  activePursuits: number
  pipelineValue: number
  members: { user: { id: string; name: string; email: string; role: string; jobTitle: string | null; avatarColor: string }; role: string }[]
}

export interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAt: string
  user?: { name: string; email: string; avatarColor: string } | null
}

export interface CollectionSource {
  id: string
  name: string
  url: string
  type: string
  region: string
  country?: string | null
  status: string
  scanFreqHrs: number
  lastScanAt?: string | null
  itemsFound: number
}

export interface DashboardData {
  kpis: {
    activeTenders: number
    pipelineValue: number
    closingThisWeek: number
    avgWinProbability: number
    unreadAlerts: number
    highRiskTenders: number
    totalCompetitors: number
  }
  totalAddressableBudget: number
  trends: { label: string; count: number; value: number }[]
  byIndustry: { name: string; count: number; value: number }[]
  byCountry: { name: string; count: number }[]
  riskDistribution: { low: number; medium: number; high: number; critical: number }
  winBuckets: { range: string; count: number }[]
  pipelineSummary: { stage: string; count: number; value: number }[]
  topBuyers: { name: string; count: number; value: number }[]
  recentAlerts: Alert[]
  recentTenders: Tender[]
  competitors: Competitor[]
  savedSearches: SavedSearch[]
  sources: CollectionSource[]
  recentReports: Report[]
  totals: { tenders: number; pipeline: number; savedSearches: number; sources: number; reports: number }
}
