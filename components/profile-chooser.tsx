'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'
import { ArrowRight, Plus, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createProfile,
  fetchProfiles,
  selectProfile,
} from '@/lib/workspace-client'
import type { WorkspaceProfileSummary } from '@/lib/workspace-types'

export function ProfileChooser() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<WorkspaceProfileSummary[]>([])
  const [activeProfileId, setActiveProfileId] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfiles() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchProfiles()
        setProfiles(result.profiles)
        setActiveProfileId(result.activeProfileId)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profiles.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfiles()
  }, [])

  async function handleSelectProfile(profileId: string) {
    setPendingProfileId(profileId)
    setError(null)

    try {
      await selectProfile(profileId)
      router.push('/dashboard')
      router.refresh()
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'Unable to open that profile.')
    } finally {
      setPendingProfileId(null)
    }
  }

  async function handleCreateProfile() {
    const trimmed = newProfileName.trim()

    if (!trimmed) {
      setError('A profile name is required.')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      await createProfile(trimmed)
      router.push('/dashboard')
      router.refresh()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create that profile.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <PeridotPageChrome>
      <div className="peridot-shell min-h-screen px-5 py-8 sm:px-8 sm:py-10">
      <div className="peridot-stage-shell">
        <section className="peridot-stage-header">
          <div className="peridot-stage-box">
            <div className="peridot-stage-kicker">Profiles</div>
            <h1 className="peridot-stage-title">Choose a profile before you enter the workspace</h1>
            <div className="peridot-stage-meta">Each profile keeps its own flows and analytics</div>
            <p className="peridot-stage-description">
              Every profile keeps its own routines, calendar state, and analytics in the local SQLite database on this host.
            </p>
          </div>

          <div className="peridot-stage-box is-compact">
            <div className="peridot-stage-kicker">Create Another Profile</div>
            <div className="mt-4 space-y-3">
              <Input
                value={newProfileName}
                onChange={(event) => setNewProfileName(event.target.value)}
                placeholder="New profile name"
                className="h-11 rounded-xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33] placeholder:text-[#ffdf33]/35"
              />
              <Button
                type="button"
                onClick={handleCreateProfile}
                disabled={isCreating}
                className="peridot-accent-button h-11 w-full rounded-xl px-4 font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? 'Creating profile...' : 'Create and open'}
              </Button>
            </div>
          </div>
        </section>

        <section className="peridot-panel p-6 sm:p-7">
          <div className="mb-5">
            <div className="peridot-section-label text-xs text-[#ffdf33]/45">Existing Profiles</div>
            <h2 className="peridot-panel-heading mt-2 text-2xl font-semibold text-[#ffdf33]">Open an existing workspace</h2>
          </div>

          {isLoading ? (
            <div className="rounded-[1.4rem] border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-5 py-10 text-center text-[#ffdf33]/50">
              Loading profiles...
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => {
                const isPending = pendingProfileId === profile.id
                const isActive = activeProfileId === profile.id

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => void handleSelectProfile(profile.id)}
                    className="peridot-panel-soft group p-5 text-left transition hover:bg-[#33b7db]/[0.08]"
                    disabled={isPending}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#ffdf33]/40">
                          <UserRound className="h-3.5 w-3.5" />
                          {isActive ? 'Current' : 'Profile'}
                        </div>
                        <div className="peridot-panel-heading mt-3 text-xl font-semibold text-[#ffdf33]">
                          {profile.name}
                        </div>
                        <div className="peridot-copy mt-2 text-sm text-[#ffdf33]/50">
                          Updated {new Date(profile.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#ffdf33]/35 transition group-hover:text-[#ffdf33]/70" />
                    </div>
                    <div className="peridot-copy mt-4 text-sm text-[#ffdf33]/58">
                      {isPending ? 'Opening profile...' : 'Open this profile'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {error ? (
          <div className="peridot-danger-note rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}
      </div>
      </div>
    </PeridotPageChrome>
  )
}

