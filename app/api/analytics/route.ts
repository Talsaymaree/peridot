import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { getAnalyticsSummary } from '@/lib/task-completions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function normalizeJsonValue(value: unknown): unknown {
  if (typeof value === 'bigint') return Number(value)
  if (Array.isArray(value)) return value.map(normalizeJsonValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeJsonValue(entry)]))
  }
  return value
}

export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const analytics = await getAnalyticsSummary(auth.context.userId)

    return NextResponse.json(normalizeJsonValue(analytics))
  } catch (error) {
    console.error('Error loading analytics:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
