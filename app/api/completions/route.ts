import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { getCompletionsForDate, normalizeIsoDate, saveTaskCompletion } from '@/lib/task-completions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SaveCompletionPayload = {
  date?: string
  regimenId?: string
  taskId?: string
  completed?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const date = normalizeIsoDate(new URL(request.url).searchParams.get('date'))

    if (!date) {
      return NextResponse.json({ error: 'A valid date is required.' }, { status: 400 })
    }

    const items = await getCompletionsForDate(auth.context.userId, date)

    return NextResponse.json({ date, items })
  } catch (error) {
    console.error('Error loading task completions:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as SaveCompletionPayload
    const date = normalizeIsoDate(body.date)
    const regimenId = body.regimenId?.trim()
    const taskId = body.taskId?.trim()

    if (!date || !regimenId || !taskId || typeof body.completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid completion payload.' }, { status: 400 })
    }

    const saved = await saveTaskCompletion({
      userId: auth.context.userId,
      date,
      regimenId,
      taskId,
      completed: body.completed,
    })

    if (!saved) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 })
    }

    return NextResponse.json({
      date,
      regimenId,
      taskId,
      ...saved,
    })
  } catch (error) {
    console.error('Error saving task completion:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
