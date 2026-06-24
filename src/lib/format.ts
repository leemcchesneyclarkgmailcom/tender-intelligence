/** Formatting helpers shared across API + UI. */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'AED ',
  INR: '₹',
}

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code + ' '
}

export function formatCurrency(amount: number, currency = 'USD', compact = true): string {
  const sym = currencySymbol(currency)
  if (compact) {
    if (Math.abs(amount) >= 1e9) return `${sym}${(amount / 1e9).toFixed(2)}B`
    if (Math.abs(amount) >= 1e6) return `${sym}${(amount / 1e6).toFixed(1)}M`
    if (Math.abs(amount) >= 1e3) return `${sym}${(amount / 1e3).toFixed(1)}K`
  }
  return `${sym}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function formatBudget(min: number | null, max: number | null, currency = 'USD'): string {
  if (min == null && max == null) return 'Undisclosed'
  if (min != null && max != null) {
    if (min === max) return formatCurrency(min, currency)
    return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`
  }
  if (max != null) return `Up to ${formatCurrency(max, currency)}`
  return `From ${formatCurrency(min!, currency)}`
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = d.getTime() - Date.now()
  const abs = Math.abs(diff)
  const day = 86400000
  const hour = 3600000
  const min = 60000
  if (abs < min) return 'just now'
  if (abs < hour) {
    const n = Math.floor(abs / min)
    return diff < 0 ? `${n}m ago` : `in ${n}m`
  }
  if (abs < day) {
    const n = Math.floor(abs / hour)
    return diff < 0 ? `${n}h ago` : `in ${n}h`
  }
  const n = Math.floor(abs / day)
  return diff < 0 ? `${n}d ago` : `in ${n}d`
}

export function daysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean)
  }
}

export const INDUSTRY_LABELS: Record<string, string> = {
  construction: 'Construction',
  consulting: 'Consulting',
  defence: 'Defence',
  technology: 'Technology',
  mining: 'Mining & Resources',
  infrastructure: 'Infrastructure',
  healthcare: 'Healthcare',
}

export const STAGE_LABELS: Record<string, string> = {
  identified: 'Identified',
  qualifying: 'Qualifying',
  pursuing: 'Pursuing',
  bidding: 'Bidding',
  won: 'Won',
  lost: 'Lost',
}

export const STAGE_COLORS: Record<string, string> = {
  identified: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  qualifying: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  pursuing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  bidding: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  lost: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

export const RISK_COLORS: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

export const SEVERITY_COLORS: Record<string, string> = {
  info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

export function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 50) return 'text-amber-600 dark:text-amber-400'
  if (score >= 30) return 'text-orange-600 dark:text-orange-400'
  return 'text-rose-600 dark:text-rose-400'
}

export function riskColor(level: string | null): string {
  if (!level) return ''
  return RISK_COLORS[level] ?? ''
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
