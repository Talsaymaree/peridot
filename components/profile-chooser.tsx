'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Play, Plus, UserRound } from 'lucide-react'
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
    <div className="peridot-mock-shell min-h-screen px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="peridot-mock-card overflow-hidden rounded-[1.1rem] px-7 py-8 sm:px-9 sm:py-10">
          <div className="text-sm font-semibold text-white/88">Peridot</div>
          <div className="mt-10 max-w-md">
            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl">
              Manage your routines and everything around them.
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              Keep your content and profile-specific data separate on this host, so each workspace stays focused and private.
            </p>
          </div>

          <div className="mt-10 peridot-mock-subcard rounded-[1rem] p-5">
            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/42">Why profiles help</div>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  Each profile keeps its own routines, schedule state, and analytics in the local SQLite workspace on this host.
                </p>
              </div>
              <div className="flex items-center justify-start gap-3 sm:justify-end">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full peridot-mock-green">
                  <Play className="h-4 w-4" />
                </div>
                <div className="text-sm text-white/62">Start with a profile, then enter the workspace.</div>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCreateProfile}
            disabled={isCreating || !newProfileName.trim()}
            className="peridot-mock-button mt-10 h-14 w-full rounded-full text-lg font-semibold"
          >
            {isCreating ? 'Creating...' : "Let's Start"}
          </Button>
        </section>

        <section className="peridot-mock-card overflow-hidden rounded-[1.1rem] px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[2rem] font-semibold leading-none text-white">Hi there</div>
              <p className="mt-2 text-sm text-[#ff9e84]">{profiles.length} workspace{profiles.length === 1 ? '' : 's'} available on this host</p>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
              <UserRound className="h-5 w-5 text-white/75" />
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <Input
              value={newProfileName}
              onChange={(event) => setNewProfileName(event.target.value)}
              placeholder="Create a new profile"
              className="h-12 border-white/8 bg-white/[0.05] text-white placeholder:text-white/30"
            />
            <Button
              type="button"
              onClick={handleCreateProfile}
              disabled={isCreating}
              className="peridot-mock-button h-12 min-w-12 rounded-full px-5"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8">
            <div className="text-xl font-semibold text-white">Open a workspace</div>
            <p className="mt-2 text-sm leading-7 text-white/58">
              Use an existing profile or create a new one without changing the content model.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-[0.9rem] border border-white/8 bg-white/[0.04] px-5 py-10 text-center text-white/50">
              Loading profiles...
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {profiles.map((profile) => {
                const isPending = pendingProfileId === profile.id
                const isActive = activeProfileId === profile.id

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => void handleSelectProfile(profile.id)}
                    className="peridot-mock-subcard group rounded-[0.95rem] p-5 text-left transition hover:-translate-y-[1px]"
                    disabled={isPending}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/38">
                          <UserRound className="h-3.5 w-3.5" />
                          {isActive ? 'Current profile' : 'Workspace'}
                        </div>
                        <div className="mt-4 text-xl font-semibold text-white">
                          {profile.name}
                        </div>
                        <div className="mt-2 text-sm text-white/48">
                          Updated {new Date(profile.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="peridot-mock-badge inline-flex h-10 w-10 items-center justify-center rounded-full">
                        <ArrowRight className="h-4 w-4 text-white/42 transition group-hover:text-white/78" />
                      </div>
                    </div>
                    <div className="mt-5 text-sm text-white/58">
                      {isPending ? 'Opening profile...' : 'Open this profile'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {error ? (
            <div className="mt-5 rounded-[0.75rem] border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
