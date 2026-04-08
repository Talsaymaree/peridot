import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchInboxTasks } from '@/lib/workspace-server'
import type { InboxTaskInput } from '@/lib/workspace-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const tasks = await fetchInboxTasks(auth.context.userId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error loading inbox tasks:', error)
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

    const body = (await request.json()) as InboxTaskInput
    const title = body.title?.trim()

    if (!title) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const completedAt = body.completed ? new Date() : null

    await prisma.$executeRaw`
      INSERT INTO "inbox_tasks" ("id", "title", "description", "completedAt", "createdAt", "updatedAt", "userId")
      VALUES (${id}, ${title}, ${body.description?.trim() || null}, ${completedAt}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${auth.context.userId})
    `

    const tasks = await fetchInboxTasks(auth.context.userId)
    const task = tasks.find((item) => item.id === id)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating inbox task:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
