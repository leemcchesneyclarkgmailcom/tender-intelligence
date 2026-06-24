import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

export async function getAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

/** Safely parse JSON from an LLM response that may include ```json fences. */
export function parseJsonResponse<T = unknown>(raw: string): T | null {
  if (!raw) return null
  let cleaned = raw.trim()
  // strip code fences
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) cleaned = fence[1].trim()
  // find first { and last }
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1)
  }
  try {
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}

export interface TenderAIResult {
  summary: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskNotes: string
  opportunityScore: number
  winProbability: number
  opportunityNotes: string
  industries: string[]
  keyRequirements: string[]
}

/**
 * Run the full AI processing pipeline on a tender: summarization, risk
 * assessment, opportunity / win-probability scoring, and classification.
 */
export async function processTenderWithAI(input: {
  title: string
  description: string
  buyer: string
  buyerType: string
  country: string
  industry: string
  budgetMin?: number | null
  budgetMax?: number | null
  deadlineAt: string
}): Promise<TenderAIResult> {
  const zai = await getAI()

  const sys = `You are the AI engine behind "Tender Intelligence", an enterprise SaaS that monitors government procurement opportunities for construction, consulting, defence, technology and mining firms.

You analyse tenders and return STRICT JSON only (no prose, no code fences) with these fields:
{
  "summary": "3-4 sentence executive summary of the opportunity",
  "riskScore": number 0-100 (higher = more risk),
  "riskLevel": "low" | "medium" | "high" | "critical",
  "riskNotes": "1-2 sentence explanation of the main risk factors",
  "opportunityScore": number 0-100 (higher = better opportunity),
  "winProbability": number 0-100 (estimated win probability for a capable mid-size bidder),
  "opportunityNotes": "1-2 sentence rationale for the opportunity score",
  "industries": ["array","of","industry","tags"],
  "keyRequirements": ["array","of","key","requirements"]
}

Consider competition intensity, complexity, timeline pressure, geographic & political factors, budget size relative to scope, and buyer reputation.`

  const user = `Tender details:
Title: ${input.title}
Buyer: ${input.buyer} (${input.buyerType})
Country: ${input.country}
Industry: ${input.industry}
Budget: ${input.budgetMin ?? 'unspecified'} – ${input.budgetMax ?? 'unspecified'}
Deadline: ${input.deadlineAt}

Description:
${input.description}

Return the JSON now.`

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.4,
    })

    const content = completion.choices[0]?.message?.content ?? ''
    const parsed = parseJsonResponse<TenderAIResult>(content)
    if (parsed && typeof parsed.summary === 'string') {
      return {
        summary: parsed.summary,
        riskScore: clamp(parsed.riskScore),
        riskLevel: parsed.riskLevel,
        riskNotes: parsed.riskNotes ?? '',
        opportunityScore: clamp(parsed.opportunityScore),
        winProbability: clamp(parsed.winProbability),
        opportunityNotes: parsed.opportunityNotes ?? '',
        industries: Array.isArray(parsed.industries) ? parsed.industries : [],
        keyRequirements: Array.isArray(parsed.keyRequirements)
          ? parsed.keyRequirements
          : [],
      }
    }
  } catch (e) {
    console.error('[ai] processTenderWithAI failed:', (e as Error).message)
  }

  // Deterministic fallback so the UI never breaks
  return fallbackAnalysis(input)
}

function clamp(n: unknown): number {
  const v = Number(n)
  if (Number.isNaN(v)) return 50
  return Math.max(0, Math.min(100, Math.round(v)))
}

function fallbackAnalysis(input: {
  title: string
  description: string
  buyer: string
  country: string
  industry: string
  deadlineAt: string
}): TenderAIResult {
  const len = input.description.length
  const risk = Math.min(85, 40 + Math.floor(len / 240))
  const opp = Math.max(15, 90 - Math.floor(len / 300))
  return {
    summary: `${input.title} issued by ${input.buyer} in ${input.country}. The procurement covers ${input.industry} requirements with a closing deadline of ${input.deadlineAt}. Review the full specification to confirm scope alignment and mandatory qualifications.`,
    riskScore: risk,
    riskLevel: risk >= 70 ? 'high' : risk >= 50 ? 'medium' : 'low',
    riskNotes:
      'Heuristic estimate based on specification length and complexity. Run AI analysis for a detailed assessment.',
    opportunityScore: opp,
    winProbability: Math.max(10, opp - 10),
    opportunityNotes:
      'Estimated opportunity score. Confirm team capacity and past performance with this buyer.',
    industries: [input.industry],
    keyRequirements: ['Compliance documentation', 'Past performance', 'Financial capacity'],
  }
}

/**
 * Semantic / natural-language search over tenders. Uses the LLM to expand the
 * natural-language query into structured filter criteria, then ranks results.
 */
export async function semanticSearchPlan(query: string): Promise<{
  keywords: string[]
  industries: string[]
  countries: string[]
  intent: string
}> {
  const zai = await getAI()
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You convert a natural-language tender search into STRICT JSON: {"keywords":["..."],"industries":["..."],"countries":["..."],"intent":"one short sentence describing what the user wants"}. Return JSON only.',
        },
        { role: 'user', content: query },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.2,
    })
    const parsed = parseJsonResponse<{
      keywords: string[]
      industries: string[]
      countries: string[]
      intent: string
    }>(completion.choices[0]?.message?.content ?? '')
    if (parsed) return parsed
  } catch (e) {
    console.error('[ai] semanticSearchPlan failed:', (e as Error).message)
  }
  return {
    keywords: query.split(/\s+/).filter((w) => w.length > 2),
    industries: [],
    countries: [],
    intent: query,
  }
}

/** Generate a market-intelligence / weekly summary report from tender data. */
export async function generateMarketIntelligence(input: {
  period: string
  industry: string
  tenderCount: number
  totalBudget: number
  topBuyers: string[]
  sampleTitles: string[]
}): Promise<{ summary: string; highlights: string[]; recommendations: string[] }> {
  const zai = await getAI()
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a procurement market analyst. Produce STRICT JSON: {"summary":"2-3 paragraph executive summary","highlights":["3-5 bullet highlights"],"recommendations":["3-5 actionable recommendations for a bidding firm"]}. Return JSON only.',
        },
        {
          role: 'user',
          content: `Period: ${input.period}
Industry focus: ${input.industry}
Tenders published: ${input.tenderCount}
Total addressable budget: $${input.totalBudget.toLocaleString()}
Top buyers: ${input.topBuyers.join(', ')}
Sample opportunities: ${input.sampleTitles.join(' | ')}`,
        },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.5,
    })
    const parsed = parseJsonResponse<{
      summary: string
      highlights: string[]
      recommendations: string[]
    }>(completion.choices[0]?.message?.content ?? '')
    if (parsed?.summary) return parsed
  } catch (e) {
    console.error('[ai] generateMarketIntelligence failed:', (e as Error).message)
  }
  return {
    summary: `Over the ${input.period}, ${input.tenderCount} ${input.industry} tenders were published representing an addressable budget of $${input.totalBudget.toLocaleString()}. Activity was concentrated among ${input.topBuyers.slice(0, 3).join(', ')} and peer agencies. The pipeline remains active and competitive.`,
    highlights: [
      `${input.tenderCount} new ${input.industry} opportunities tracked`,
      `$${input.totalBudget.toLocaleString()} total addressable budget`,
      `Primary buyers: ${input.topBuyers.slice(0, 3).join(', ')}`,
    ],
    recommendations: [
      'Prioritise opportunities with win probability above 60%',
      'Allocate capture resources to the top 3 buyers by volume',
      'Monitor deadline clustering to avoid bid-team overload',
    ],
  }
}

/** Live web search for fresh procurement news / tenders. */
export async function webSearchTenders(query: string, num = 8) {
  const zai = await getAI()
  try {
    const results = await zai.functions.invoke('web_search', {
      query,
      num,
      recency_days: 30,
    })
    return results
  } catch (e) {
    console.error('[ai] webSearchTenders failed:', (e as Error).message)
    return []
  }
}
