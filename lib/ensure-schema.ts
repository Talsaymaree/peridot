import { prisma } from '@/lib/prisma'

let ensureSchemaPromise: Promise<void> | null = null

export async function ensureAppSchema() {
  if (!ensureSchemaPromise) {
    ensureSchemaPromise = (async () => {
      await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON')

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key"
        ON "users"("email")
      `)

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "routines" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "category" TEXT NOT NULL DEFAULT 'CUSTOM',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          CONSTRAINT "routines_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "regimens" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "cadence" TEXT NOT NULL DEFAULT 'CUSTOM',
          "colorTint" TEXT,
          "recurrenceType" TEXT,
          "recurrenceDays" TEXT,
          "recurrenceTimes" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "routineId" TEXT NOT NULL,
          CONSTRAINT "regimens_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "routines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "tasks" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
          "status" TEXT NOT NULL DEFAULT 'TODO',
          "recurrenceType" TEXT,
          "recurrenceDays" TEXT,
          "dueDate" DATETIME,
          "dueLabel" TEXT,
          "dueBucket" TEXT,
          "completedAt" DATETIME,
          "referenceUrl" TEXT,
          "referenceLabel" TEXT,
          "referenceType" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "regimenId" TEXT NOT NULL,
          CONSTRAINT "tasks_regimenId_fkey" FOREIGN KEY ("regimenId") REFERENCES "regimens" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "inbox_tasks" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "completedAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          CONSTRAINT "inbox_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "inbox_tasks_userId_createdAt_idx"
        ON "inbox_tasks"("userId", "createdAt")
      `)

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "inbox_tasks_userId_completedAt_idx"
        ON "inbox_tasks"("userId", "completedAt")
      `)

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "task_completions" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "date" TEXT NOT NULL,
          "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          "regimenId" TEXT NOT NULL,
          "taskId" TEXT NOT NULL,
          CONSTRAINT "task_completions_regimenId_fkey" FOREIGN KEY ("regimenId") REFERENCES "regimens" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "task_completions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `)

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "task_completions_userId_date_taskId_key"
        ON "task_completions"("userId", "date", "taskId")
      `)

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "task_completions_userId_date_idx"
        ON "task_completions"("userId", "date")
      `)

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "task_completions_userId_completedAt_idx"
        ON "task_completions"("userId", "completedAt")
      `)

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "task_completions_regimenId_date_idx"
        ON "task_completions"("regimenId", "date")
      `)
    })().catch((error) => {
      ensureSchemaPromise = null
      throw error
    })
  }

  await ensureSchemaPromise
}
