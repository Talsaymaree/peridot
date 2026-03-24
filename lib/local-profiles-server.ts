import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { ensureAppSchema } from '@/lib/ensure-schema'
import type { WorkspaceProfileSummary } from '@/lib/workspace-types'

export const LOCAL_PROFILE_COOKIE = 'peridot-local-profile-id'

const LOCAL_PROFILE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function toProfileSummary(profile: {
  id: string
  name: string | null
  email: string
  createdAt: Date
  updatedAt: Date
}): WorkspaceProfileSummary {
  return {
    id: profile.id,
    name: profile.name?.trim() || 'Workspace',
    email: profile.email,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  }
}

export async function ensureLocalProfilesExist() {
  await ensureAppSchema()
  const count = await prisma.user.count()

  if (count > 0) {
    return
  }

  await prisma.user.create({
    data: {
      id: 'guest',
      email: 'guest@peridot.local',
      name: 'Workspace',
    },
  })
}

export async function listLocalProfilesServer() {
  await ensureLocalProfilesExist()

  const profiles = await prisma.user.findMany({
    orderBy: [
      { createdAt: 'asc' },
      { name: 'asc' },
    ],
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return profiles.map(toProfileSummary)
}

export async function getLocalProfileById(profileId: string) {
  await ensureAppSchema()
  return prisma.user.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getRememberedLocalProfile() {
  const cookieStore = await cookies()
  const requestedId = cookieStore.get(LOCAL_PROFILE_COOKIE)?.value?.trim()

  if (!requestedId) {
    return null
  }

  return getLocalProfileById(requestedId)
}

export async function resolveActiveLocalProfile() {
  const profiles = await listLocalProfilesServer()
  const cookieStore = await cookies()
  const requestedId = cookieStore.get(LOCAL_PROFILE_COOKIE)?.value
  const activeProfile = profiles.find((profile) => profile.id === requestedId) ?? profiles[0]

  return {
    activeProfile,
    profiles,
  }
}

export async function createLocalProfileServer(name: string) {
  await ensureLocalProfilesExist()

  const trimmed = name.trim()

  if (!trimmed) {
    throw new Error('Profile name is required.')
  }

  const existingProfiles = await listLocalProfilesServer()
  const duplicate = existingProfiles.find((profile) => normalizeName(profile.name) === normalizeName(trimmed))

  if (duplicate) {
    throw new Error(`A profile named "${trimmed}" already exists.`)
  }

  const id = crypto.randomUUID()
  const profile = await prisma.user.create({
    data: {
      id,
      email: `local-${id}@peridot.local`,
      name: trimmed,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return toProfileSummary(profile)
}

export function applyLocalProfileCookie(response: { cookies: { set: (name: string, value: string, options: typeof LOCAL_PROFILE_COOKIE_OPTIONS) => void } }, profileId: string) {
  response.cookies.set(LOCAL_PROFILE_COOKIE, profileId, LOCAL_PROFILE_COOKIE_OPTIONS)
}
