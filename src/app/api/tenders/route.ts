import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/tenant'
import { parseJsonArray } from '@/lib/format'

export const dynamic = 'force-dynamic'

/** List tenders with filtering, sorting and pagination. */
export async function GET(req: NextRequest) {
  const tenantId = await getTenantId()
  const { searchParams } = new URL(req.url)

  const industry = searchParams.get('industry')
  const country = searchParams.get('country')
  const status = searchParams.get('status')
  const procurementType = searchParams.get('procurementType')
  const buyerType = searchParams.get('buyerType')
  const riskLevel = searchParams.get('riskLevel')
  const q = searchParams.get('q')?.trim()
  const minBudget = searchParams.get('minBudget')
  const maxBudget = searchParams.get('maxBudget')
  const sortBy = searchParams.get('sortBy') ?? 'publishedAt'
  const sortDir = searchParams.get('sortDir') === 'asc' ? 'asc' : 'desc'
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)

  const where: Record<string, unknown> = { tenantId }
  if (industry && industry !== 'all') where.industry = industry
  if (country && country !== 'all') where.country = country
  if (status && status !== 'all') where.status = status
  if (procurementType && procurementType !== 'all') where.procurementType = procurementType
  if (buyerType && buyerType !== 'all') where.buyerType = buyerType
  if (riskLevel && riskLevel !== 'all') where.riskLevel = riskLevel
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { buyer: { contains: q } },
      { reference: { contains: q } },
    ]
  }
  if (minBudget || maxBudget) {
    const budgetFilter: Record<string, number> = {}
    if (minBudget) budgetFilter.gte = Number(minBudget)
    if (maxBudget) budgetFilter.lte = Number(maxBudget)
    where.budgetMax = budgetFilter
  }

  const orderBy: Record<string, string> = {}
  const validSorts = ['publishedAt', 'deadlineAt', 'opportunityScore', 'riskScore', 'budgetMax', 'winProbability', 'createdAt']
  orderBy[validSorts.includes(sortBy) ? sortBy : 'publishedAt'] = sortDir

  const tenders = await db.tender.findMany({
    where,
    orderBy,
    take: limit,
    include: { source: true },
  })

  const filters = {
    industries: await db.tender.findMany({ where: { tenantId }, select: { industry: true }, distinct: ['industry'] }),
    countries: await db.tender.findMany({ where: { tenantId }, select: { country: true }, distinct: ['country'] }),
  }

  return NextResponse.json({
    tenders: tenders.map((t) => ({
      ...t,
      industries: parseJsonArray(t.industries),
      keyRequirements: parseJsonArray(t.keyRequirements),
    })),
    total: tenders.length,
    filters: {
      industries: filters.industries.map((t) => t.industry),
      countries: filters.countries.map((t) => t.country),
    },
  })
}
