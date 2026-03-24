import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthContext } from '@/lib/auth'
import { getRegimenTint } from '@/lib/regimen-tints'

type UpdateRoutinePayload = {
  name?: string
  description?: string
  category?: string
  isActive?: boolean
  regimens?: Array<{
    title?: string
    description?: string
    cadence?: string
    colorTint?: string
    recurrenceType?: string
    recurrenceDays?: string[]
    recurrenceTimes?: Record<string, string>
    tasks?: Array<{
      title?: string
      description?: string
      priority?: string
      status?: string
      dueDate?: string | null
      dueLabel?: string
      dueBucket?: string
      referenceUrl?: string
      referenceLabel?: string
      referenceType?: string
    }>
  }>
}

type RoutineRow = {
  id: string
  title: string
  description: string | null
  category: string
  isActive: boolean | number
  createdAt: Date
  updatedAt: Date
}

type RegimenRow = {
  id: string
  title: string
  description: string | null
  cadence: string
  colorTint: string | null
  recurrenceType: string | null
  recurrenceDays: string | null
  recurrenceTimes: string | null
  createdAt: Date
  updatedAt: Date
  routineId: string
}

type TaskRow = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueDate: Date | null
  dueLabel: string | null
  dueBucket: string | null
  referenceUrl: string | null
  referenceLabel: string | null
  referenceType: string | null
  createdAt: Date
  updatedAt: Date
  regimenId: string
}

function normalizeRegimens(regimens: UpdateRoutinePayload['regimens']) {
  return (
    regimens
      ?.map((regimen) => {
        const title = regimen.title?.trim()

        if (!title || !regimen.tasks?.some((task) => task.title?.trim())) {
          return null
        }

        return {
          title,
          description: regimen.description?.trim() || null,
          cadence: regimen.cadence?.trim() || 'CUSTOM',
          colorTint: getRegimenTint(regimen.colorTint),
          recurrenceType: regimen.recurrenceType?.trim() || null,
          recurrenceDays: regimen.recurrenceDays?.map((day) => day.trim()).filter(Boolean).join(',') || null,
          recurrenceTimes: regimen.recurrenceTimes ? JSON.stringify(Object.fromEntries(Object.entries(regimen.recurrenceTimes).map(([day, time]) => [day.trim(), time.trim()]).filter(([, time]) => Boolean(time)))) : null,
          tasks: {
            create:
              regimen.tasks
                ?.map((task) => {
                  const taskTitle = task.title?.trim()

                  if (!taskTitle) {
                    return null
                  }

                  return {
                    title: taskTitle,
                    description: task.description?.trim() || null,
                    priority: task.priority?.trim() || 'MEDIUM',
                    status: task.status?.trim() || 'TODO',
                    dueDate: task.dueDate ? new Date(task.dueDate) : null,
                    dueLabel: task.dueLabel?.trim() || null,
                    dueBucket: task.dueBucket?.trim() || null,
                    referenceUrl: task.referenceUrl?.trim() || null,
                    referenceLabel: task.referenceLabel?.trim() || null,
                    referenceType: task.referenceType?.trim() || null,
                  }
                })
                .filter((task): task is NonNullable<typeof task> => Boolean(task)) ?? [],
          },
        }
      })
      .filter((regimen): regimen is NonNullable<typeof regimen> => Boolean(regimen)) ?? []
  )
}

async function insertRegimensAndTasks(
  db: any,
  routineId: string,
  regimens: ReturnType<typeof normalizeRegimens>,
) {
  for (const regimen of regimens) {
    const regimenId = crypto.randomUUID()

    await db.$executeRaw`
      INSERT INTO "regimens" ("id", "title", "description", "cadence", "colorTint", "recurrenceType", "recurrenceDays", "createdAt", "updatedAt", "routineId")
      VALUES (${regimenId}, ${regimen.title}, ${regimen.description}, ${regimen.cadence}, ${regimen.colorTint}, ${regimen.recurrenceType}, ${regimen.recurrenceDays}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${routineId})
    `

    await db.$executeRaw`
      UPDATE "regimens"
      SET "recurrenceTimes" = ${regimen.recurrenceTimes}
      WHERE "id" = ${regimenId}
    `

    for (const task of regimen.tasks.create) {
      const taskId = crypto.randomUUID()

      await db.$executeRaw`
        INSERT INTO "tasks" ("id", "title", "description", "priority", "status", "dueDate", "dueLabel", "dueBucket", "referenceUrl", "referenceLabel", "referenceType", "createdAt", "updatedAt", "regimenId")
        VALUES (${taskId}, ${task.title}, ${task.description}, ${task.priority}, ${task.status}, ${task.dueDate}, ${task.dueLabel}, ${task.dueBucket}, ${task.referenceUrl}, ${task.referenceLabel}, ${task.referenceType}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${regimenId})
      `
    }
  }
}

async function fetchRoutineTree(userId: string, routineId: string) {
  const routines = await prisma.$queryRaw<RoutineRow[]>`
    SELECT "id", "title", "description", "category", "isActive", "createdAt", "updatedAt"
    FROM "routines"
    WHERE "userId" = ${userId} AND "id" = ${routineId}
    ORDER BY "createdAt" DESC
  `

  if (routines.length === 0) {
    return null
  }

  const routine = routines[0]
  const regimens = await prisma.$queryRaw<RegimenRow[]>`
    SELECT "id", "title", "description", "cadence", "colorTint", "recurrenceType", "recurrenceDays", "recurrenceTimes", "createdAt", "updatedAt", "routineId"
    FROM "regimens"
    WHERE "routineId" = ${routine.id}
    ORDER BY "createdAt" ASC
  `

  const regimenResults = []

  for (const regimen of regimens) {
    const tasks = await prisma.$queryRaw<TaskRow[]>`
      SELECT "id", "title", "description", "priority", "status", "dueDate", "dueLabel", "dueBucket", "referenceUrl", "referenceLabel", "referenceType", "createdAt", "updatedAt", "regimenId"
      FROM "tasks"
      WHERE "regimenId" = ${regimen.id}
      ORDER BY "createdAt" ASC
    `

    regimenResults.push({
      ...regimen,
      tasks,
    })
  }

  return {
    ...routine,
    isActive: Boolean(routine.isActive),
    regimens: regimenResults,
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const { userId } = auth.context
    const { id } = await params
    const body = (await request.json()) as UpdateRoutinePayload
    const { name, description, category, isActive = true } = body
    const regimens = normalizeRegimens(body.regimens)

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const existingRoutine = await prisma.routine.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existingRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.regimen.deleteMany({
        where: { routineId: id },
      })

      await tx.routine.update({
        where: { id },
        data: {
          title: name.trim(),
          description: description?.trim() || null,
          category: category?.trim() || 'CUSTOM',
          isActive,
        },
      })

      if (regimens.length > 0) {
        await insertRegimensAndTasks(tx, id, regimens)
      }
    })

    const updatedRoutine = await fetchRoutineTree(userId, id)

    return NextResponse.json(updatedRoutine)
  } catch (error) {
    console.error('Error updating routine:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const { userId } = auth.context
    const { id } = await params
    const existingRoutine = await prisma.routine.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existingRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    await prisma.routine.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting routine:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
