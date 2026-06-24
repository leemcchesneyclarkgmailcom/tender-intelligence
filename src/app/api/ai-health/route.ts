import { NextResponse } from 'next/server'
import { getAI } from '@/lib/ai'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/** Lightweight probe to determine whether the live LLM is reachable. */
export async function GET() {
  try {
    const zai = await getAI()
    await zai.chat.completions.create({
      messages: [{ role: 'user', content: 'ping' }],
      thinking: { type: 'disabled' },
      max_tokens: 4,
    })
    return NextResponse.json({ live: true, mode: 'live', checkedAt: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({
      live: false,
      mode: 'fallback',
      error: (e as Error).message?.slice(0, 120) ?? 'unknown',
      checkedAt: new Date().toISOString(),
    })
  }
}
