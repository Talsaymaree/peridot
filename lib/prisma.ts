import { PrismaClient } from '@/lib/generated/prisma-runtime-v3'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
