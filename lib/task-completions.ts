import { prisma } from '@/lib/prisma'
import { ensureAppSchema } from '@/lib/ensure-schema'

type CompletionRow = {
  regimenId: string
  taskId: string
  completedAt: Date | string
}

type OwnershipRow = {
  taskId: string
}

type LatestCompletionRow = {
  completedAt: Date | string | null
}

type TotalsRow = {
  totalCompleted: number | bigint | null
  completedToday: number | bigint | null
  completedThisWeek: number | bigint | null
  activeDays: number | bigint | null
}

type ActivityRow = {
  date: string
  total: number | bigint
}

type RegimenAnalyticsRow = {
  regimenId: string
  regimenTitle: string
  routineTitle: string
  completedCount: number | bigint
  lastCompletedAt: Date | string | null
}

type AnalyticsCompletionRow = {
  date: string
  regimenId: string
  regimenTitle: string
  routineTitle: string
  completedAt: Date | string | null
}

type StreakRow = {
  date: string
}

export type CompletionItem = {
  regimenId: string
  taskId: string
  completedAt: string
}

export type AnalyticsSummary = {
  totals: {
    totalCompleted: number
    completedToday: number
    completedThisWeek: number
    activeDays: number
    currentStreak: number
  }
  series: Array<{
    date: string
    label: string
    total: number
  }>
  weekdayBreakdown: Array<{
    day: string
    label: string
    total: number
  }>
  topRegimens: Array<{
    regimenId: string
    regimenTitle: string
    routineTitle: string
    completedCount: number
    lastCompletedAt: string | null
  }>
}

type SaveCompletionInput = {
  userId: string
  date: string
  regimenId: string
  taskId: string
  completed: boolean
}

let ensureStoragePromise: Promise<void> | null = null

function toNumber(value: number | bigint | null | undefined) {
  if (typeof value === 'bigint') return Number(value)
  return Number(value ?? 0)
}

function toIsoString(value: Date | string | null) {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function normalizeIsoDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

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

export async function ensureTaskCompletionStorage() {
  if (!ensureStoragePromise) {
    ensureStoragePromise = ensureAppSchema().catch((error) => {
      ensureStoragePromise = null
      throw error
    })
  }

  await ensureStoragePromise
}

async function taskBelongsToUser(userId: string, regimenId: string, taskId: string) {
  const rows = await prisma.$queryRaw<OwnershipRow[]>`
    SELECT t."id" AS "taskId"
    FROM "tasks" t
    INNER JOIN "regimens" g ON g."id" = t."regimenId"
    INNER JOIN "routines" r ON r."id" = g."routineId"
    WHERE r."userId" = ${userId}
      AND g."id" = ${regimenId}
      AND t."id" = ${taskId}
    LIMIT 1
  `

  return rows.length > 0
}

async function syncTaskCompletedAt(userId: string, taskId: string) {
  const latestRows = await prisma.$queryRaw<LatestCompletionRow[]>`
    SELECT MAX("completedAt") AS "completedAt"
    FROM "task_completions"
    WHERE "userId" = ${userId}
      AND "taskId" = ${taskId}
  `

  const latestCompletedAt = latestRows[0]?.completedAt ?? null

  await prisma.$executeRaw`
    UPDATE "tasks"
    SET "completedAt" = ${latestCompletedAt}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${taskId}
  `
}

export async function getCompletionsForDate(userId: string, date: string): Promise<CompletionItem[]> {
  await ensureTaskCompletionStorage()

  const rows = await prisma.$queryRaw<CompletionRow[]>`
    SELECT "regimenId", "taskId", "completedAt"
    FROM "task_completions"
    WHERE "userId" = ${userId}
      AND "date" = ${date}
    ORDER BY "completedAt" DESC
  `

  return rows.map((row) => ({
    regimenId: row.regimenId,
    taskId: row.taskId,
    completedAt: toIsoString(row.completedAt) || new Date().toISOString(),
  }))
}

export async function saveTaskCompletion(input: SaveCompletionInput) {
  await ensureTaskCompletionStorage()

  const ownsTask = await taskBelongsToUser(input.userId, input.regimenId, input.taskId)

  if (!ownsTask) {
    return null
  }

  const completedAt = new Date()

  await prisma.$transaction(async (tx) => {
    if (input.completed) {
      await tx.$executeRaw`
        INSERT INTO "task_completions" ("id", "date", "completedAt", "createdAt", "updatedAt", "userId", "regimenId", "taskId")
        VALUES (${crypto.randomUUID()}, ${input.date}, ${completedAt}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${input.userId}, ${input.regimenId}, ${input.taskId})
        ON CONFLICT("userId", "date", "taskId")
        DO UPDATE SET
          "completedAt" = excluded."completedAt",
          "updatedAt" = CURRENT_TIMESTAMP,
          "regimenId" = excluded."regimenId"
      `
    } else {
      await tx.$executeRaw`
        DELETE FROM "task_completions"
        WHERE "userId" = ${input.userId}
          AND "date" = ${input.date}
          AND "taskId" = ${input.taskId}
      `
    }
  })

  await syncTaskCompletedAt(input.userId, input.taskId)

  return {
    completed: input.completed,
    completedAt: input.completed ? completedAt.toISOString() : null,
  }
}

function buildCurrentStreak(dates: string[], today: string) {
  if (!dates.includes(today)) return 0

  const uniqueDates = new Set(dates)
  let streak = 0
  let cursor = new Date(`${today}T12:00:00`)

  while (uniqueDates.has(localIsoDate(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export async function getAnalyticsSummary(userId: string): Promise<AnalyticsSummary> {
  await ensureTaskCompletionStorage()

  const today = new Date()
  const todayIso = localIsoDate(today)
  const weekStartIso = localIsoDate(addDays(today, -6))
  const weekdayOrder = [
    { day: 'MON', label: 'Mon', jsDay: 1 },
    { day: 'TUE', label: 'Tue', jsDay: 2 },
    { day: 'WED', label: 'Wed', jsDay: 3 },
    { day: 'THU', label: 'Thu', jsDay: 4 },
    { day: 'FRI', label: 'Fri', jsDay: 5 },
    { day: 'SAT', label: 'Sat', jsDay: 6 },
    { day: 'SUN', label: 'Sun', jsDay: 0 },
  ] as const
  const completionRows = await prisma.$queryRaw<AnalyticsCompletionRow[]>`
    SELECT
      tc."date" AS "date",
      tc."regimenId" AS "regimenId",
      g."title" AS "regimenTitle",
      r."title" AS "routineTitle",
      tc."completedAt" AS "completedAt"
    FROM "task_completions" tc
    INNER JOIN "regimens" g ON g."id" = tc."regimenId"
    INNER JOIN "routines" r ON r."id" = g."routineId"
    WHERE tc."userId" = ${userId}
    ORDER BY tc."completedAt" DESC
  `

  const dailyTotals = new Map<string, number>()
  const weekdayTotals = new Map<string, number>(weekdayOrder.map((item) => [item.day, 0]))
  const regimenStats = new Map<string, { regimenId: string; regimenTitle: string; routineTitle: string; completedCount: number; lastCompletedAt: string | null }>()

  for (const row of completionRows) {
    dailyTotals.set(row.date, (dailyTotals.get(row.date) ?? 0) + 1)

    const completedDate = new Date(`${row.date}T12:00:00`)
    const weekday = weekdayOrder.find((item) => item.jsDay === completedDate.getDay())
    if (weekday) {
      weekdayTotals.set(weekday.day, (weekdayTotals.get(weekday.day) ?? 0) + 1)
    }

    const current = regimenStats.get(row.regimenId)
    const completedAt = toIsoString(row.completedAt)

    if (!current) {
      regimenStats.set(row.regimenId, {
        regimenId: row.regimenId,
        regimenTitle: row.regimenTitle,
        routineTitle: row.routineTitle,
        completedCount: 1,
        lastCompletedAt: completedAt,
      })
      continue
    }

    current.completedCount += 1
    if (completedAt && (!current.lastCompletedAt || completedAt > current.lastCompletedAt)) {
      current.lastCompletedAt = completedAt
    }
  }

  const labelFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
  const series = Array.from({ length: 14 }, (_, index) => {
    const date = addDays(today, index - 13)
    const dateIso = localIsoDate(date)
    return {
      date: dateIso,
      label: labelFormatter.format(date),
      total: dailyTotals.get(dateIso) ?? 0,
    }
  })
  const weekdayBreakdown = weekdayOrder.map((item) => ({
    day: item.day,
    label: item.label,
    total: weekdayTotals.get(item.day) ?? 0,
  }))

  const streakDates = Array.from(new Set(completionRows.map((row) => row.date))).sort((left, right) => right.localeCompare(left))
  const topRegimens = Array.from(regimenStats.values())
    .sort((left, right) => {
      if (right.completedCount !== left.completedCount) return right.completedCount - left.completedCount
      return (right.lastCompletedAt || '').localeCompare(left.lastCompletedAt || '')
    })
    .slice(0, 5)

  return {
    totals: {
      totalCompleted: completionRows.length,
      completedToday: completionRows.filter((row) => row.date === todayIso).length,
      completedThisWeek: completionRows.filter((row) => row.date >= weekStartIso).length,
      activeDays: new Set(completionRows.map((row) => row.date)).size,
      currentStreak: buildCurrentStreak(streakDates, todayIso),
    },
    series,
    weekdayBreakdown,
    topRegimens,
  }
}
