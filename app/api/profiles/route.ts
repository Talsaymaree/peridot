import { NextRequest, NextResponse } from 'next/server'
import {
  applyLocalProfileCookie,
  createLocalProfileServer,
  resolveActiveLocalProfile,
} from '@/lib/local-profiles-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { activeProfile, profiles } = await resolveActiveLocalProfile()

    return NextResponse.json({
      activeProfileId: activeProfile.id,
      profiles,
    })
  } catch (error) {
    console.error('Error loading profiles:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: string }
    const profile = await createLocalProfileServer(body.name?.trim() || '')
    const response = NextResponse.json({
      profile,
      activeProfileId: profile.id,
    })

    applyLocalProfileCookie(response, profile.id)
    return response
  } catch (error) {
    console.error('Error creating profile:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
