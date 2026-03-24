import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { getWorkspaceBackup } from '@/lib/workspace-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const backup = await getWorkspaceBackup(auth.context.userId)

    return NextResponse.json(backup)
  } catch (error) {
    console.error('Error creating workspace backup:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
