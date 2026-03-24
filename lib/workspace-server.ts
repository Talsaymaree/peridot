import { prisma } from '@/lib/prisma'
import { getRegimenTint } from '@/lib/regimen-tints'
import { ensureTaskCompletionStorage } from '@/lib/task-completions'
import type {
  CompletionRecord,
  LocalWorkspace,
  RoutineInput,
  RoutineRecord,
  WorkspaceSnapshot,
} from '@/lib/workspace-types'

type RoutineRow = {
  id: string
  title: string
  description: string | null
  category: string
  isActive: boolean | number
  createdAt: Date | string
  updatedAt: Date | string
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
  createdAt: Date | string
  updatedAt: Date | string
  routineId: string
}

type TaskRow = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  recurrenceType: string | null
  recurrenceDays: string | null
  dueDate: Date | string | null
  dueLabel: string | null
  dueBucket: string | null
  completedAt: Date | string | null
  referenceUrl: string | null
  referenceLabel: string | null
  referenceType: string | null
  createdAt: Date | string
  updatedAt: Date | string
  regimenId: string
}

type CompletionRow = {
  date: string
  regimenId: string
  taskId: string
  completedAt: Date | string
}

type BackupEnvelope = {
  workspace?: unknown
  profile?: unknown
  routines?: unknown
  completions?: unknown
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNullableString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function toIsoString(value: unknown, fallback = new Date().toISOString()) {
  if (!value) {
    return fallback
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value !== 'string') {
    return fallback
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString()
}

function normalizeIsoDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null
  }

  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const parsed = new Date(year, month - 1, day)

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return `${yearText}-${monthText}-${dayText}`
}

function normalizeRegimens(regimens: RoutineInput['regimens']) {
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
          recurrenceTimes: regimen.recurrenceTimes
            ? JSON.stringify(
                Object.fromEntries(
                  Object.entries(regimen.recurrenceTimes)
                    .map(([day, time]) => [day.trim(), time.trim()])
                    .filter(([, time]) => Boolean(time)),
                ),
              )
            : null,
          tasks:
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
        }
      })
      .filter((regimen): regimen is NonNullable<typeof regimen> => Boolean(regimen)) ?? []
  )
}

export async function insertRegimensAndTasks(
  db: any,
  routineId: string,
  regimens: ReturnType<typeof normalizeRegimens>,
) {
  for (const regimen of regimens) {
    const regimenId = crypto.randomUUID()

    await db.$executeRaw`
      INSERT INTO "regimens" ("id", "title", "description", "cadence", "colorTint", "recurrenceType", "recurrenceDays", "recurrenceTimes", "createdAt", "updatedAt", "routineId")
      VALUES (${regimenId}, ${regimen.title}, ${regimen.description}, ${regimen.cadence}, ${regimen.colorTint}, ${regimen.recurrenceType}, ${regimen.recurrenceDays}, ${regimen.recurrenceTimes}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${routineId})
    `

    for (const task of regimen.tasks) {
      const taskId = crypto.randomUUID()

      await db.$executeRaw`
        INSERT INTO "tasks" ("id", "title", "description", "priority", "status", "dueDate", "dueLabel", "dueBucket", "referenceUrl", "referenceLabel", "referenceType", "createdAt", "updatedAt", "regimenId")
        VALUES (${taskId}, ${task.title}, ${task.description}, ${task.priority}, ${task.status}, ${task.dueDate}, ${task.dueLabel}, ${task.dueBucket}, ${task.referenceUrl}, ${task.referenceLabel}, ${task.referenceType}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${regimenId})
      `
    }
  }
}

export async function fetchRoutineTree(userId: string, routineId?: string) {
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

  const result: RoutineRecord[] = []

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
        SELECT "id", "title", "description", "priority", "status", "recurrenceType", "recurrenceDays", "dueDate", "dueLabel", "dueBucket", "completedAt", "referenceUrl", "referenceLabel", "referenceType", "createdAt", "updatedAt", "regimenId"
        FROM "tasks"
        WHERE "regimenId" = ${regimen.id}
        ORDER BY "createdAt" ASC
      `

      regimenResults.push({
        id: regimen.id,
        title: regimen.title,
        description: regimen.description,
        cadence: regimen.cadence,
        colorTint: regimen.colorTint,
        recurrenceType: regimen.recurrenceType,
        recurrenceDays: regimen.recurrenceDays,
        recurrenceTimes: regimen.recurrenceTimes,
        createdAt: toIsoString(regimen.createdAt),
        updatedAt: toIsoString(regimen.updatedAt),
        routineId: regimen.routineId,
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          recurrenceType: task.recurrenceType,
          recurrenceDays: task.recurrenceDays,
          dueDate: task.dueDate ? toIsoString(task.dueDate) : null,
          dueLabel: task.dueLabel,
          dueBucket: task.dueBucket,
          completedAt: task.completedAt ? toIsoString(task.completedAt) : null,
          referenceUrl: task.referenceUrl,
          referenceLabel: task.referenceLabel,
          referenceType: task.referenceType,
          createdAt: toIsoString(task.createdAt),
          updatedAt: toIsoString(task.updatedAt),
          regimenId: task.regimenId,
        })),
      })
    }

    result.push({
      id: routine.id,
      title: routine.title,
      description: routine.description,
      category: routine.category,
      isActive: Boolean(routine.isActive),
      createdAt: toIsoString(routine.createdAt),
      updatedAt: toIsoString(routine.updatedAt),
      regimens: regimenResults,
    })
  }

  return routineId ? result[0] : result
}

export async function getWorkspaceSnapshot(userId: string): Promise<WorkspaceSnapshot> {
  const [user, routines] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    }),
    fetchRoutineTree(userId),
  ])

  return {
    profile: {
      username: user?.name?.trim() || '',
    },
    routines: routines as RoutineRecord[],
  }
}

export async function getWorkspaceBackup(userId: string) {
  await ensureTaskCompletionStorage()

  const [snapshot, completions] = await Promise.all([
    getWorkspaceSnapshot(userId),
    prisma.$queryRaw<CompletionRow[]>`
      SELECT "date", "regimenId", "taskId", "completedAt"
      FROM "task_completions"
      WHERE "userId" = ${userId}
      ORDER BY "completedAt" DESC
    `,
  ])

  return {
    app: 'Peridot',
    version: 1,
    exportedAt: new Date().toISOString(),
    workspace: {
      version: 1 as const,
      profile: snapshot.profile,
      routines: snapshot.routines,
      completions: completions.map((completion) => ({
        date: completion.date,
        regimenId: completion.regimenId,
        taskId: completion.taskId,
        completedAt: toIsoString(completion.completedAt),
      })),
    } satisfies LocalWorkspace,
  }
}

function findTask(routines: RoutineRecord[], regimenId: string, taskId: string) {
  for (const routine of routines) {
    for (const regimen of routine.regimens) {
      if (regimen.id !== regimenId) {
        continue
      }

      const task = regimen.tasks.find((item) => item.id === taskId)

      if (task) {
        return task
      }
    }
  }

  return null
}

function sanitizeTask(value: unknown) {
  const record = asRecord(value)
  const createdAt = toIsoString(record?.createdAt)

  return {
    id: asString(record?.id, crypto.randomUUID()),
    title: asString(record?.title).trim(),
    description: asNullableString(record?.description),
    priority: asString(record?.priority, 'MEDIUM').trim() || 'MEDIUM',
    status: asString(record?.status, 'TODO').trim() || 'TODO',
    recurrenceType: asNullableString(record?.recurrenceType),
    recurrenceDays: asNullableString(record?.recurrenceDays),
    dueDate: asNullableString(record?.dueDate),
    dueLabel: asNullableString(record?.dueLabel),
    dueBucket: asNullableString(record?.dueBucket),
    completedAt: asNullableString(record?.completedAt),
    referenceUrl: asNullableString(record?.referenceUrl),
    referenceLabel: asNullableString(record?.referenceLabel),
    referenceType: asNullableString(record?.referenceType),
    createdAt,
    updatedAt: toIsoString(record?.updatedAt, createdAt),
  }
}

function sanitizeRegimen(value: unknown, routineId: string) {
  const record = asRecord(value)
  const createdAt = toIsoString(record?.createdAt)
  const title = asString(record?.title).trim()

  if (!title) {
    return null
  }

  return {
    id: asString(record?.id, crypto.randomUUID()),
    title,
    description: asNullableString(record?.description),
    cadence: asString(record?.cadence, 'CUSTOM').trim() || 'CUSTOM',
    colorTint: asNullableString(record?.colorTint),
    recurrenceType: asNullableString(record?.recurrenceType),
    recurrenceDays: asNullableString(record?.recurrenceDays),
    recurrenceTimes: asNullableString(record?.recurrenceTimes),
    createdAt,
    updatedAt: toIsoString(record?.updatedAt, createdAt),
    routineId,
    tasks: asArray(record?.tasks)
      .map((task) => sanitizeTask(task))
      .filter((task) => task.title.trim().length > 0),
  }
}

function sanitizeRoutine(value: unknown) {
  const record = asRecord(value)
  const id = asString(record?.id, crypto.randomUUID())
  const createdAt = toIsoString(record?.createdAt)
  const title = asString(record?.title).trim()

  if (!title) {
    return null
  }

  return {
    id,
    title,
    description: asNullableString(record?.description),
    category: asString(record?.category, 'CUSTOM').trim() || 'CUSTOM',
    isActive: asBoolean(record?.isActive, true),
    createdAt,
    updatedAt: toIsoString(record?.updatedAt, createdAt),
    regimens: asArray(record?.regimens)
      .map((regimen) => sanitizeRegimen(regimen, id))
      .filter((regimen): regimen is NonNullable<typeof regimen> => Boolean(regimen)),
  }
}

function sanitizeCompletion(value: unknown, routines: RoutineRecord[]): CompletionRecord | null {
  const record = asRecord(value)
  const date = normalizeIsoDate(record?.date)
  const regimenId = asString(record?.regimenId).trim()
  const taskId = asString(record?.taskId).trim()

  if (!date || !regimenId || !taskId || !findTask(routines, regimenId, taskId)) {
    return null
  }

  return {
    date,
    regimenId,
    taskId,
    completedAt: toIsoString(record?.completedAt),
  }
}

export function sanitizeWorkspaceImport(value: unknown): LocalWorkspace {
  const record = asRecord(value)
  const routines = asArray(record?.routines)
    .map((routine) => sanitizeRoutine(routine))
    .filter((routine): routine is RoutineRecord => Boolean(routine))

  return {
    version: 1,
    profile: {
      username: asString(asRecord(record?.profile)?.username).trim(),
    },
    routines,
    completions: asArray(record?.completions)
      .map((completion) => sanitizeCompletion(completion, routines))
      .filter((completion): completion is CompletionRecord => Boolean(completion)),
  }
}

export async function replaceWorkspaceFromBackup(userId: string, payload: unknown) {
  await ensureTaskCompletionStorage()

  const parsed = payload as BackupEnvelope
  const source = parsed?.workspace ?? {
    profile: parsed?.profile,
    routines: parsed?.routines,
    completions: parsed?.completions,
  }
  const workspace = sanitizeWorkspaceImport(source)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: workspace.profile.username || 'Workspace',
      },
    })

    await tx.taskCompletion.deleteMany({
      where: { userId },
    })

    await tx.routine.deleteMany({
      where: { userId },
    })

    for (const routine of workspace.routines) {
      await tx.$executeRaw`
        INSERT INTO "routines" ("id", "title", "description", "category", "isActive", "createdAt", "updatedAt", "userId")
        VALUES (${routine.id}, ${routine.title}, ${routine.description}, ${routine.category}, ${routine.isActive}, ${new Date(routine.createdAt)}, ${new Date(routine.updatedAt)}, ${userId})
      `

      for (const regimen of routine.regimens) {
        await tx.$executeRaw`
          INSERT INTO "regimens" ("id", "title", "description", "cadence", "colorTint", "recurrenceType", "recurrenceDays", "recurrenceTimes", "createdAt", "updatedAt", "routineId")
          VALUES (${regimen.id}, ${regimen.title}, ${regimen.description}, ${regimen.cadence}, ${regimen.colorTint}, ${regimen.recurrenceType}, ${regimen.recurrenceDays}, ${regimen.recurrenceTimes}, ${new Date(regimen.createdAt)}, ${new Date(regimen.updatedAt)}, ${routine.id})
        `

        for (const task of regimen.tasks) {
          await tx.$executeRaw`
            INSERT INTO "tasks" ("id", "title", "description", "priority", "status", "recurrenceType", "recurrenceDays", "dueDate", "dueLabel", "dueBucket", "completedAt", "referenceUrl", "referenceLabel", "referenceType", "createdAt", "updatedAt", "regimenId")
            VALUES (${task.id}, ${task.title}, ${task.description}, ${task.priority}, ${task.status}, ${task.recurrenceType}, ${task.recurrenceDays}, ${task.dueDate ? new Date(task.dueDate) : null}, ${task.dueLabel}, ${task.dueBucket}, ${task.completedAt ? new Date(task.completedAt) : null}, ${task.referenceUrl}, ${task.referenceLabel}, ${task.referenceType}, ${new Date(task.createdAt)}, ${new Date(task.updatedAt)}, ${regimen.id})
          `
        }
      }
    }

    for (const completion of workspace.completions) {
      await tx.$executeRaw`
        INSERT INTO "task_completions" ("id", "date", "completedAt", "createdAt", "updatedAt", "userId", "regimenId", "taskId")
        VALUES (${crypto.randomUUID()}, ${completion.date}, ${new Date(completion.completedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${userId}, ${completion.regimenId}, ${completion.taskId})
      `
    }
  })

  return workspace
}
