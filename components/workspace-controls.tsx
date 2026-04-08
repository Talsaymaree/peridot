'use client'

import { ChangeEvent, ReactNode, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Plus, Save, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createProfile,
  fetchProfiles,
  fetchWorkspace,
  fetchWorkspaceBackup,
  importWorkspaceBackup,
  removeProfile,
  selectProfile,
  subscribeToWorkspaceChanges,
  updateWorkspaceName,
} from '@/lib/workspace-client'
import type { WorkspaceProfileSummary } from '@/lib/workspace-types'

type WorkspaceControlsProps = {
  mobile?: boolean
}

const CREATE_PROFILE_OPTION = '__create_new_profile__'

type SettingsCommandAction = {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  variantClassName: string
}

function SettingsCommandDeck({
  ariaLabel,
  hubLabel,
  topAction,
  leftAction,
  rightAction,
}: {
  ariaLabel: string
  hubLabel: string
  topAction: SettingsCommandAction
  leftAction: SettingsCommandAction
  rightAction: SettingsCommandAction
}) {
  const actions = [
    { ...topAction, positionClassName: 'peridot-routine-command--top' },
    { ...leftAction, positionClassName: 'peridot-routine-command--left' },
    { ...rightAction, positionClassName: 'peridot-routine-command--right' },
  ]
  const deckId = useId().replace(/:/g, '')
  const cyanGlowId = `${deckId}-settings-cyan-glow`

  return (
    <div className="peridot-routine-command-deck peridot-routine-command-deck--detail peridot-settings-command-deck" role="group" aria-label={ariaLabel}>
      <div className="peridot-routine-command-deck-inner">
        <svg
          className="peridot-routine-command-frame"
          viewBox="0 0 400 440"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <filter id={cyanGlowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M112 62 H288 V188 L234 222 H166 L112 188 Z"
            className="peridot-routine-frame-shape peridot-routine-frame-top is-cyan"
            filter={`url(#${cyanGlowId})`}
          />

          <path
            d="M34 248 H184 V394 H34 Z"
            className="peridot-routine-frame-shape peridot-routine-frame-left is-cyan"
            filter={`url(#${cyanGlowId})`}
          />

          <path
            d="M216 248 H366 V394 H216 Z"
            className="peridot-routine-frame-shape peridot-routine-frame-right is-cyan"
            filter={`url(#${cyanGlowId})`}
          />

          <path
            d="M154 248 L166 222 H234 L246 248 L216 274 H184 Z"
            className="peridot-routine-frame-shape peridot-routine-frame-hub-plate is-cyan"
            filter={`url(#${cyanGlowId})`}
          />
        </svg>

        {actions.map((action) => (
          <button
            key={`${hubLabel}-${action.label}`}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={`peridot-routine-command ${action.positionClassName} ${action.variantClassName}`}
          >
            <span className="peridot-routine-command-label">{action.label}</span>
            <span className="peridot-routine-command-badge">
              {action.icon}
            </span>
          </button>
        ))}

        <div className="peridot-routine-command-hub" aria-hidden="true">
          <span>{hubLabel}</span>
        </div>
      </div>
    </div>
  )
}

export function WorkspaceControls({ mobile = false }: WorkspaceControlsProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<WorkspaceProfileSummary[]>([])
  const [activeProfileId, setActiveProfileId] = useState('')
  const [profileSelection, setProfileSelection] = useState('')
  const [draftName, setDraftName] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const controlHeightClass = mobile ? 'h-11 text-base sm:h-10 sm:text-sm' : 'h-11 text-sm'
  const primaryButtonClass = mobile
    ? 'peridot-accent-button h-11 w-full justify-center px-4 text-[15px] font-semibold uppercase tracking-[0.16em] sm:h-10 sm:text-sm'
    : 'peridot-accent-button h-11 justify-center px-4 font-semibold uppercase tracking-[0.16em]'
  const dangerButtonClass = mobile
    ? 'h-11 w-full justify-center border-[#bd0000]/35 bg-[rgba(189,0,0,0.08)] px-4 text-[15px] font-semibold uppercase tracking-[0.16em] text-[#ffdf33] hover:bg-[rgba(189,0,0,0.16)] hover:text-[#ffdf33] sm:h-10 sm:text-sm'
    : 'h-11 justify-center border-[#bd0000]/35 bg-[rgba(189,0,0,0.08)] px-4 font-semibold uppercase tracking-[0.16em] text-[#ffdf33] hover:bg-[rgba(189,0,0,0.16)] hover:text-[#ffdf33]'

  async function refreshControls() {
    const [workspace, profileState] = await Promise.all([
      fetchWorkspace(),
      fetchProfiles(),
    ])

    setProfiles(profileState.profiles)
    setActiveProfileId(profileState.activeProfileId)
    setProfileSelection(profileState.activeProfileId)
    setDraftName(workspace.profile.username || '')
  }

  useEffect(() => {
    async function refresh() {
      try {
        await refreshControls()
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load the workspace.')
      }
    }

    void refresh()

    return subscribeToWorkspaceChanges(() => {
      void refresh()
    })
  }, [])

  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? null

  async function handleSwitchProfile(profileId: string) {
    if (!profileId || profileId === activeProfileId) {
      return
    }

    setMessage(null)
    setError(null)

    try {
      await selectProfile(profileId)
      await refreshControls()
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
      await refreshControls()
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

  function handleProfileSelectionChange(nextValue: string) {
    setProfileSelection(nextValue)
    setMessage(null)
    setError(null)

    if (nextValue === CREATE_PROFILE_OPTION) {
      return
    }

    void handleSwitchProfile(nextValue)
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
      setMessage('Profile name saved.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the profile name.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProfile() {
    if (!activeProfileId || !activeProfile) {
      return
    }

    if (profiles.length <= 1) {
      setMessage(null)
      setError('At least one profile must remain.')
      return
    }

    const confirmed = window.confirm(
      `Delete "${activeProfile.name}"? This will remove its routines, board tasks, and completion history.`,
    )

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setMessage(null)
    setError(null)

    try {
      await removeProfile(activeProfileId)
      await refreshControls()
      setMessage(`Deleted profile "${activeProfile.name}".`)
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete that profile.')
    } finally {
      setIsDeleting(false)
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
    <div className="peridot-settings-control-shell">
      <section className="peridot-settings-command-section">
        <SettingsCommandDeck
          ariaLabel="Settings commands"
          hubLabel="Profile"
          topAction={{
            label: 'New',
            icon: <Plus className="h-4 w-4" />,
            onClick: () => handleProfileSelectionChange(CREATE_PROFILE_OPTION),
            variantClassName: 'is-edit',
          }}
          leftAction={{
            label: 'Backup',
            icon: <Download className="h-4 w-4" />,
            onClick: handleDownloadBackup,
            variantClassName: 'is-duplicate',
          }}
          rightAction={{
            label: isImporting ? 'Loading' : 'Load',
            icon: <Upload className="h-4 w-4" />,
            onClick: () => fileInputRef.current?.click(),
            disabled: isImporting,
            variantClassName: 'is-edit',
          }}
        />

        <div className="peridot-settings-command-copy">
          <div className="peridot-settings-count-cell peridot-analytics-stat-cell">
            <div className="peridot-analytics-stat-kicker">Profiles</div>
            <div className="peridot-analytics-stat-value">{profiles.length}</div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleBackupSelected}
          className="hidden"
        />
      </section>

      <section className="peridot-settings-identity">
        <div className="peridot-settings-identity-grid">
          <div className="peridot-settings-input-lane">
            <label className="peridot-settings-input-label">Active Profile</label>
            <select
              value={profileSelection || activeProfileId}
              onChange={(event) => handleProfileSelectionChange(event.target.value)}
              className={`peridot-control ${controlHeightClass} w-full px-3.5 outline-none sm:px-3`}
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id} className="bg-[#000000] text-[#ffdf33]">
                  {profile.name}
                </option>
              ))}
              <option value={CREATE_PROFILE_OPTION} className="bg-[#000000] text-[#ffdf33]">
                Create new profile
              </option>
            </select>
            {profileSelection === CREATE_PROFILE_OPTION ? (
              <>
                <label className="peridot-settings-input-label">New Profile Name</label>
                <Input
                  value={newProfileName}
                  onChange={(event) => setNewProfileName(event.target.value)}
                  placeholder="New profile name"
                  className={`peridot-control ${controlHeightClass} px-3.5 placeholder:text-[#66ff99]/35`}
                />
                <Button
                  type="button"
                  onClick={() => void handleCreateProfile()}
                  disabled={isCreating}
                  className={primaryButtonClass}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? 'Creating...' : 'Save profile'}
                </Button>
              </>
            ) : (
              <>
                <label className="peridot-settings-input-label">Profile Name</label>
                <Input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Active profile name"
                  className={`peridot-control ${controlHeightClass} px-3.5 placeholder:text-[#66ff99]/35`}
                />
                <Button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSaving || isDeleting}
                  className={primaryButtonClass}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save profile name'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDeleteProfile()}
                  disabled={isDeleting || isSaving || profiles.length <= 1}
                  className={dangerButtonClass}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete profile'}
                </Button>
              </>
            )}
          </div>
        </div>

      </section>

      {message ? (
        <div className="peridot-settings-status peridot-settings-status--success">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="peridot-settings-status peridot-settings-status--error">
          {error}
        </div>
      ) : null}
    </div>
  )
}


