import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthContext } from '@/lib/auth'
import { getRegimenTint } from '@/lib/regimen-tints'

type CreateRoutinePayload = {
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

function normalizeRegimens(regimens: CreateRoutinePayload['regimens']) {
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

async function fetchRoutineTree(userId: string, routineId?: string) {
  const routines = routineId
    ? await prisma.$queryRaw<RoutineRow[]>`
        SELECT "id", "title", "description", "category", "isActive", "createdAt", "updatedAt"
        FROM "routines"
        WHERE "userId" = ${userId} AND "id" = ${routineId}
        ORDER BY "createdAt" DESC
      `
    : await prisma.$queryRaw<RoutineRow[]>`
        SELECT "id", "title", "description", "category", "isActive", "createdAt", "updatedAt"
        FROM "routines"
        WHERE "userId" = ${userId}
        ORDER BY "createdAt" DESC
      `

  if (routines.length === 0) {
    return routineId ? null : []
  }

  const result = []

  for (const routine of routines) {
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

    result.push({
      ...routine,
      isActive: Boolean(routine.isActive),
      regimens: regimenResults,
    })
  }

  return routineId ? result[0] : result
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const { userId } = auth.context

    const body = (await request.json()) as CreateRoutinePayload
    const { name, description, category, isActive = true } = body
    const regimens = normalizeRegimens(body.regimens)

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const routine = await prisma.routine.create({
      data: {
        title: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'CUSTOM',
        isActive,
        userId,
      },
    })

    if (regimens.length > 0) {
      await insertRegimensAndTasks(prisma, routine.id, regimens)
    }

    const hydratedRoutine = await fetchRoutineTree(userId, routine.id)

    return NextResponse.json(hydratedRoutine, { status: 201 })
  } catch (error) {
    console.error('Error creating routine:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const { userId } = auth.context

    const routines = await fetchRoutineTree(userId)

    return NextResponse.json(routines)
  } catch (error) {
    console.error('Error fetching routines:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
