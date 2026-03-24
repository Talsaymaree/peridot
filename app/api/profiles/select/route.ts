import { NextRequest, NextResponse } from 'next/server'
import {
  applyLocalProfileCookie,
  getLocalProfileById,
} from '@/lib/local-profiles-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { profileId?: string }
    const profileId = body.profileId?.trim()

    if (!profileId) {
      return NextResponse.json({ error: 'Profile id is required.' }, { status: 400 })
    }

    const profile = await getLocalProfileById(profileId)

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const response = NextResponse.json({
      activeProfileId: profile.id,
      profile: {
        id: profile.id,
        name: profile.name?.trim() || 'Workspace',
      },
    })

    applyLocalProfileCookie(response, profile.id)
    return response
  } catch (error) {
    console.error('Error selecting profile:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
