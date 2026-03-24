'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Plus, Save, Upload, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createProfile,
  fetchProfiles,
  fetchWorkspace,
  fetchWorkspaceBackup,
  importWorkspaceBackup,
  selectProfile,
  subscribeToWorkspaceChanges,
  updateWorkspaceName,
} from '@/lib/workspace-client'
import type { WorkspaceProfileSummary } from '@/lib/workspace-types'

type WorkspaceControlsProps = {
  mobile?: boolean
}

export function WorkspaceControls({ mobile = false }: WorkspaceControlsProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<WorkspaceProfileSummary[]>([])
  const [activeProfileId, setActiveProfileId] = useState('')
  const [draftName, setDraftName] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const controlHeightClass = mobile ? 'h-11 text-base sm:h-10 sm:text-sm' : 'h-11 text-sm'
  const primaryButtonClass = mobile
    ? 'h-11 w-full rounded-xl border border-emerald-300/20 bg-emerald-300 px-4 text-[15px] font-semibold text-emerald-950 hover:bg-emerald-200 sm:h-10 sm:text-sm'
    : 'h-11 rounded-2xl border border-emerald-300/20 bg-emerald-300 px-4 font-semibold text-emerald-950 hover:bg-emerald-200'
  const utilityButtonClass = mobile
    ? 'zune-button h-11 w-full justify-center px-4 text-[15px] sm:h-10 sm:justify-start sm:text-sm'
    : 'zune-button h-11 rounded-2xl justify-start px-4'

  useEffect(() => {
    async function refresh() {
      try {
        const [workspace, profileState] = await Promise.all([
          fetchWorkspace(),
          fetchProfiles(),
        ])
        setProfiles(profileState.profiles)
        setActiveProfileId(profileState.activeProfileId)
        setDraftName(workspace.profile.username || '')
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load the workspace.')
      }
    }

    void refresh()

    return subscribeToWorkspaceChanges(() => {
      void refresh()
    })
  }, [])

  async function handleSwitchProfile(profileId: string) {
    if (!profileId || profileId === activeProfileId) {
      return
    }

    setMessage(null)
    setError(null)

    try {
      await selectProfile(profileId)
      const [workspace, profileState] = await Promise.all([
        fetchWorkspace(),
        fetchProfiles(),
      ])
      setProfiles(profileState.profiles)
      setActiveProfileId(profileState.activeProfileId)
      setDraftName(workspace.profile.username || '')
      setMessage('Switched active profile.')
      router.push('/dashboard')
      router.refresh()
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : 'Unable to switch profiles.')
    }
  }

  async function handleCreateProfile() {
    const trimmed = newProfileName.trim()

    if (!trimmed) {
      setMessage(null)
      setError('A new profile name is required.')
      return
    }

    setIsCreating(true)
    setMessage(null)
    setError(null)

    try {
      await createProfile(trimmed)
      const [workspace, profileState] = await Promise.all([
        fetchWorkspace(),
        fetchProfiles(),
      ])
      setProfiles(profileState.profiles)
      setActiveProfileId(profileState.activeProfileId)
      setDraftName(workspace.profile.username || '')
      setNewProfileName('')
      setMessage(`Created and switched to "${trimmed}".`)
      router.push('/dashboard')
      router.refresh()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create that profile.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleSaveName() {
    const trimmed = draftName.trim()

    if (!trimmed) {
      setMessage(null)
      setError('Workspace name is required.')
      return
    }

    setIsSaving(true)
    setMessage(null)
    setError(null)

    try {
      const result = await updateWorkspaceName(trimmed)
      setDraftName(result.profile.username)
      setMessage('Workspace name saved to the local workspace database on this host.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the workspace name.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDownloadBackup() {
    try {
      const backup = await fetchWorkspaceBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filenameBase = (draftName || 'workspace')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
      link.href = url
      link.download = `peridot-${filenameBase || 'workspace'}-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setError(null)
      setMessage('Workspace backup downloaded.')
    } catch (backupError) {
      setMessage(null)
      setError(backupError instanceof Error ? backupError.message : 'Unable to create a backup right now.')
    }
  }

  async function handleBackupSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const confirmed = window.confirm('Replace the server-side workspace with this backup?')

    if (!confirmed) {
      event.target.value = ''
      return
    }

    setIsImporting(true)
    setMessage(null)
    setError(null)

    try {
      const contents = await file.text()
      const result = await importWorkspaceBackup(contents)
      const nextName =
        result &&
        typeof result === 'object' &&
        'profile' in result &&
        result.profile &&
        typeof result.profile === 'object' &&
        'username' in result.profile &&
        typeof result.profile.username === 'string'
          ? result.profile.username
          : ''
      setDraftName(nextName)
      setMessage('Backup imported into the local workspace.')
    } catch (backupError) {
      setError(backupError instanceof Error ? backupError.message : 'Unable to import that backup file.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <div className={mobile ? 'space-y-4' : 'space-y-3'}>
      <div className={`rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 ${mobile ? 'py-4' : 'py-5'}`}>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/35">
          <UserRound className="h-3.5 w-3.5" />
          Local Profiles
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/35">
              Active Profile
            </label>
            <select
              value={activeProfileId}
              onChange={(event) => void handleSwitchProfile(event.target.value)}
              className={`${controlHeightClass} w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-white outline-none sm:px-3`}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id} className="bg-[#0d1512] text-white">
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Active profile name"
            className={`${controlHeightClass} rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/35`}
          />

          <Button
            type="button"
            onClick={handleSaveName}
            disabled={isSaving}
            className={primaryButtonClass}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save workspace name'}
          </Button>
        </div>

        <div className="mt-3 text-xs leading-5 text-white/42">
          Profiles and routines now live in the app&apos;s SQLite database on this host instead of inside the browser.
        </div>
      </div>

      <div className={`rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 ${mobile ? 'py-4' : 'py-5'}`}>
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/35">Create Profile</div>

        <div className="mt-3 space-y-3">
          <Input
            value={newProfileName}
            onChange={(event) => setNewProfileName(event.target.value)}
            placeholder="New profile name"
            className={`${controlHeightClass} rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/35`}
          />
          <Button
            type="button"
            onClick={handleCreateProfile}
            disabled={isCreating}
            className={primaryButtonClass}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? 'Creating...' : 'Create profile'}
          </Button>
        </div>

        <div className="mt-3 text-xs leading-5 text-white/42">
          {profiles.length} local profile{profiles.length === 1 ? '' : 's'} available on this host.
        </div>
      </div>

      <div className={mobile ? 'grid gap-3' : 'grid gap-2'}>
        <Button
          type="button"
          variant="ghost"
          onClick={handleDownloadBackup}
          className={utilityButtonClass}
        >
          <Download className="h-4 w-4" />
          Back up workspace
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className={utilityButtonClass}
        >
          <Upload className="h-4 w-4" />
          {isImporting ? 'Importing backup...' : 'Load backup'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleBackupSelected}
          className="hidden"
        />
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-200/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
    </div>
  )
}
