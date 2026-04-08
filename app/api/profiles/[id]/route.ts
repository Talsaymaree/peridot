import { NextRequest, NextResponse } from 'next/server'
import {
  applyLocalProfileCookie,
  deleteLocalProfileServer,
  resolveActiveLocalProfile,
} from '@/lib/local-profiles-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const profileId = id.trim()

    if (!profileId) {
      return NextResponse.json({ error: 'Profile id is required.' }, { status: 400 })
    }

    const deletedProfile = await deleteLocalProfileServer(profileId)
    const { activeProfile } = await resolveActiveLocalProfile()
    const response = NextResponse.json({
      success: true,
      activeProfileId: activeProfile.id,
      deletedProfileId: deletedProfile.id,
    })

    applyLocalProfileCookie(response, activeProfile.id)
    return response
  } catch (error) {
    console.error('Error deleting profile:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message === 'Profile not found.' ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
