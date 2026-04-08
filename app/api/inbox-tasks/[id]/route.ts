import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchInboxTasks } from '@/lib/workspace-server'
import type { InboxTaskInput } from '@/lib/workspace-types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const { id } = await context.params
    const body = (await request.json()) as InboxTaskInput
    const title = body.title?.trim()
    const description = typeof body.description === 'string' ? body.description.trim() || null : undefined
    const completedAt =
      typeof body.completed === 'boolean'
        ? body.completed
          ? new Date()
          : null
        : undefined

    if (typeof body.title === 'string' && !title) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 })
    }

    await prisma.$executeRaw`
      UPDATE "inbox_tasks"
      SET
        "title" = COALESCE(${title ?? null}, "title"),
        "description" = CASE
          WHEN ${typeof body.description === 'string'} THEN ${description}
          ELSE "description"
        END,
        "completedAt" = CASE
          WHEN ${typeof body.completed === 'boolean'} THEN ${completedAt}
          ELSE "completedAt"
        END,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${id} AND "userId" = ${auth.context.userId}
    `

    const task = (await fetchInboxTasks(auth.context.userId)).find((item) => item.id === id)

    if (!task) {
      return NextResponse.json({ error: 'Inbox task not found.' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating inbox task:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const { id } = await context.params

    await prisma.$executeRaw`
      DELETE FROM "inbox_tasks"
      WHERE "id" = ${id} AND "userId" = ${auth.context.userId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inbox task:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
