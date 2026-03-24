import { NextResponse } from 'next/server'
import { ensureAppSchema } from '@/lib/ensure-schema'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { resolveActiveLocalProfile } from '@/lib/local-profiles-server'

export type AuthContext = {
  userId: string
  email: string
  name: string
  isGuest: boolean
}

type AuthResult =
  | {
      ok: true
      context: AuthContext
    }
  | {
      ok: false
      response: NextResponse
    }

async function syncAuthenticatedUser(context: Omit<AuthContext, 'isGuest'>) {
  await ensureAppSchema()
  await prisma.user.upsert({
    where: { id: context.userId },
    create: {
      id: context.userId,
      email: context.email,
      name: context.name,
    },
    update: {
      email: context.email,
      name: context.name,
    },
  })
}

export async function getAuthContext(): Promise<AuthResult> {
  await ensureAppSchema()

  if (!isSupabaseConfigured()) {
    const { activeProfile } = await resolveActiveLocalProfile()

    return {
      ok: true,
      context: {
        userId: activeProfile.id,
        email: activeProfile.email,
        name: activeProfile.name,
        isGuest: true,
      },
    }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const context = {
    userId: user.id,
    email: user.email || `${user.id}@peridot.local`,
    name: user.user_metadata?.full_name || user.user_metadata?.name || 'Peridot User',
  }

  await syncAuthenticatedUser(context)

  return {
    ok: true,
    context: {
      ...context,
      isGuest: false,
    },
  }
}
