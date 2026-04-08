'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Download, Plus, RefreshCcw, Trash2, Upload, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createLocalProfile,
  deleteLocalProfile,
  exportLocalWorkspaceBackup,
  importLocalWorkspaceBackupAsProfile,
  listLocalProfiles,
  LocalProfileSummary,
  readLocalWorkspace,
  recoverLocalBrowserData,
  setLocalUsername,
  subscribeToLocalWorkspaceChanges,
  switchLocalProfile,
} from '@/lib/local-data'

type LocalProfileControlsProps = {
  mobile?: boolean
}

export function LocalProfileControls({ mobile = false }: LocalProfileControlsProps) {
  const [profiles, setProfiles] = useState<LocalProfileSummary[]>([])
  const [activeProfileId, setActiveProfileId] = useState('')
  const [draftName, setDraftName] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function refresh() {
      const workspace = readLocalWorkspace()
      const nextProfiles = listLocalProfiles()
      const activeProfile = nextProfiles.find((profile) => profile.isActive)

      setProfiles(nextProfiles)
      setActiveProfileId(activeProfile?.id ?? '')
      setDraftName(workspace.profile.username.trim() || activeProfile?.name || '')
    }

    refresh()
    return subscribeToLocalWorkspaceChanges(refresh)
  }, [])

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? null

  function handleSaveName() {
    const trimmed = draftName.trim()

    if (!trimmed) {
      setMessage(null)
      setError('Profile name is required.')
      return
    }

    const result = setLocalUsername(trimmed)
    const nextProfiles = listLocalProfiles()
    const active = nextProfiles.find((profile) => profile.isActive)

    setProfiles(nextProfiles)
    setActiveProfileId(active?.id ?? '')
    setDraftName(result.workspace.profile.username.trim() || active?.name || trimmed)
    setError(null)
    setMessage(
      result.mergedIntoExisting
        ? `Linked routines and history to "${result.profileName}".`
        : 'Active profile renamed.',
    )
  }

  function handleCreateProfile() {
    const workspace = createLocalProfile(newProfileName.trim() || undefined)
    const profileName = workspace.profile.username.trim() || 'New profile'

    setNewProfileName('')
    setDraftName(profileName)
    setError(null)
    setMessage(`Created profile "${profileName}".`)
  }

  function handleSwitchProfile(profileId: string) {
    if (!profileId) {
      return
    }

    const workspace = switchLocalProfile(profileId)
    const nextProfiles = listLocalProfiles()
    const active = nextProfiles.find((profile) => profile.isActive)

    setProfiles(nextProfiles)
    setActiveProfileId(profileId)
    setDraftName(workspace.profile.username.trim() || active?.name || '')
    setError(null)
    setMessage('Switched local profile.')
  }

  function handleDeleteProfile() {
    if (!activeProfile) {
      return
    }

    const confirmed = window.confirm(`Delete "${activeProfile.name}" from this browser?`)

    if (!confirmed) {
      return
    }

    try {
      deleteLocalProfile(activeProfile.id)
      const nextProfiles = listLocalProfiles()
      const nextActive = nextProfiles.find((profile) => profile.isActive)

      setProfiles(nextProfiles)
      setActiveProfileId(nextActive?.id ?? '')
      setDraftName(readLocalWorkspace().profile.username.trim() || nextActive?.name || '')
      setError(null)
      setMessage(`Deleted profile "${activeProfile.name}".`)
    } catch (deleteError) {
      setMessage(null)
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete that profile.')
    }
  }

  function handleDownloadBackup() {
    try {
      const backup = exportLocalWorkspaceBackup()
      const blob = new Blob([backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filenameBase = (activeProfile?.name || draftName || 'workspace')
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
      setMessage('Active profile backup downloaded.')
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

    try {
      const contents = await file.text()
      const workspace = importLocalWorkspaceBackupAsProfile(contents)
      const nextProfiles = listLocalProfiles()
      const active = nextProfiles.find((profile) => profile.isActive)

      setProfiles(nextProfiles)
      setActiveProfileId(active?.id ?? '')
      setDraftName(workspace.profile.username.trim() || active?.name || '')
      setError(null)
      setMessage('Backup loaded as a new local profile.')
    } catch (backupError) {
      setMessage(null)
      setError(backupError instanceof Error ? backupError.message : 'Unable to load that backup file.')
    } finally {
      event.target.value = ''
    }
  }

  function handleRecoverBrowserData() {
    const result = recoverLocalBrowserData()
    const nextProfiles = listLocalProfiles()
    const active = nextProfiles.find((profile) => profile.isActive)
    const workspace = readLocalWorkspace()

    setProfiles(nextProfiles)
    setActiveProfileId(active?.id ?? '')
    setDraftName(workspace.profile.username.trim() || active?.name || '')

    if (result.status === 'recovered') {
      setError(null)
      setMessage(
        `Recovered ${result.recoveredRoutineCount} routine${result.recoveredRoutineCount === 1 ? '' : 's'} from older browser data.`,
      )
      return
    }

    setMessage(null)
    setError(
      `No older Peridot browser data was found on ${result.currentOrigin || 'this origin'}. If you used a different port or hostname before, open that older URL and export a backup there.`,
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#ffdf33]/35">
          <UserRound className="h-3.5 w-3.5" />
          Local Profiles
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#ffdf33]/35">
              Active Profile
            </label>
            <select
              value={activeProfileId}
              onChange={(event) => handleSwitchProfile(event.target.value)}
              className="h-10 w-full rounded-xl border border-[#33b7db]/16 bg-[#33b7db]/8 px-3 text-sm text-[#ffdf33] outline-none"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id} className="bg-[#000000] text-[#ffdf33]">
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div className={mobile ? 'grid gap-2' : 'grid gap-2'}>
            <Input
              value={newProfileName}
              onChange={(event) => setNewProfileName(event.target.value)}
              placeholder="New profile name"
              className="h-10 rounded-xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33] placeholder:text-[#ffdf33]/35"
            />
            <Button
              type="button"
              onClick={handleCreateProfile}
              className="peridot-accent-button h-10 rounded-xl px-4 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create profile
            </Button>
          </div>
        </div>

        <div className="mt-3 text-xs leading-5 text-[#ffdf33]/42">
          {profiles.length} local profile{profiles.length === 1 ? '' : 's'} stored in this browser.
        </div>
      </div>

      <div className="rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-[#ffdf33]/35">Active Profile Name</div>

        <div className="mt-3 space-y-3">
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Rename active profile"
            className="h-10 rounded-xl border-[#33b7db]/10 bg-[#33b7db]/[0.04] text-[#ffdf33] placeholder:text-[#ffdf33]/35"
          />

          <div className={mobile ? 'grid gap-2' : 'flex gap-2'}>
            <Button
              type="button"
              onClick={handleSaveName}
              className="peridot-accent-button h-10 rounded-xl px-4 font-semibold"
            >
              Save name
            </Button>
            {profiles.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDeleteProfile}
                className="h-10 border border-rose-200/20 bg-rose-300/10 px-4 text-rose-100 hover:bg-rose-300/20"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete profile
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3 text-xs leading-5 text-[#ffdf33]/42">
          Each local profile keeps its own routines, calendar history, and analytics.
        </div>
      </div>

      <div className="grid gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleRecoverBrowserData}
          className="zune-button h-10 justify-start px-4"
        >
          <RefreshCcw className="h-4 w-4" />
          Recover browser data
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleDownloadBackup}
          className="zune-button h-10 justify-start px-4"
        >
          <Download className="h-4 w-4" />
          Back up active profile
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="zune-button h-10 justify-start px-4"
        >
          <Upload className="h-4 w-4" />
          Load backup as profile
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
        <div className="peridot-success-note rounded-xl px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
    </div>
  )
}


