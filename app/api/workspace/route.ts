import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWorkspaceSnapshot } from '@/lib/workspace-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const workspace = await getWorkspaceSnapshot(auth.context.userId)

    return NextResponse.json(workspace)
  } catch (error) {
    console.error('Error loading workspace:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as { name?: string }
    const name = body.name?.trim()

    if (!name) {
      return NextResponse.json({ error: 'Workspace name is required.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: auth.context.userId },
      data: { name },
    })

    return NextResponse.json({
      profile: {
        username: name,
      },
    })
  } catch (error) {
    console.error('Error updating workspace:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
