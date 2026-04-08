import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { replaceWorkspaceFromBackup } from '@/lib/workspace-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext()

    if (!auth.ok) {
      return auth.response
    }

    const body = await request.json()
    const workspace = await replaceWorkspaceFromBackup(auth.context.userId, body)

    return NextResponse.json({
      profile: workspace.profile,
      routines: workspace.routines,
      inboxTasks: workspace.inboxTasks,
      completions: workspace.completions,
    })
  } catch (error) {
    console.error('Error importing workspace backup:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
