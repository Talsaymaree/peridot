'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Upload, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  exportLocalWorkspaceBackup,
  importLocalWorkspaceBackup,
  readLocalWorkspace,
  setLocalUsername,
  subscribeToLocalWorkspaceChanges,
} from '@/lib/local-data'

type LocalWorkspaceControlsProps = {
  mobile?: boolean
}

export function LocalWorkspaceControls({ mobile = false }: LocalWorkspaceControlsProps) {
  const [username, setUsername] = useState('')
  const [draftName, setDraftName] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function refresh() {
      const workspace = readLocalWorkspace()
      setUsername(workspace.profile.username)
      setDraftName((current) => (isEditing ? current : workspace.profile.username))
    }

    refresh()
    return subscribeToLocalWorkspaceChanges(refresh)
  }, [isEditing])

  const wrapperClassName = useMemo(
    () =>
      mobile
        ? 'space-y-3'
        : 'space-y-3',
    [mobile],
  )

  function handleSaveName() {
    const trimmed = draftName.trim()
    setLocalUsername(trimmed)
    setUsername(trimmed)
    setDraftName(trimmed)
    setIsEditing(false)
    setError(null)
    setMessage(trimmed ? 'Username saved on this device.' : 'Username cleared from this device.')
  }

  function handleDownloadBackup() {
    try {
      const backup = exportLocalWorkspaceBackup()
      const blob = new Blob([backup], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filenameBase = username.trim() ? username.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'workspace'
      link.href = url
      link.download = `peridot-${filenameBase || 'workspace'}-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setError(null)
      setMessage('Backup downloaded.')
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
      const workspace = importLocalWorkspaceBackup(contents)
      setUsername(workspace.profile.username)
      setDraftName(workspace.profile.username)
      setIsEditing(false)
      setError(null)
      setMessage('Backup loaded onto this device.')
    } catch (backupError) {
      setMessage(null)
      setError(backupError instanceof Error ? backupError.message : 'Unable to load that backup file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className={wrapperClassName}>
      <div className="rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#ffdf33]/35">
          <UserRound className="h-3.5 w-3.5" />
          Local Workspace
        </div>
        {isEditing || !username ? (
          <div className="mt-3 space-y-3">
            <Input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Choose a username"
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
              {username ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDraftName(username)
                    setIsEditing(false)
                    setMessage(null)
                    setError(null)
                  }}
                  className="zune-button h-10 px-4"
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <div className="truncate text-sm text-[#ffdf33]/82">{username}</div>
            <button
              type="button"
              onClick={() => {
                setDraftName(username)
                setIsEditing(true)
                setMessage(null)
                setError(null)
              }}
              className="peridot-accent-link mt-2 text-xs uppercase tracking-[0.16em]"
            >
              Change name
            </button>
          </div>
        )}
        <div className="mt-3 text-xs leading-5 text-[#ffdf33]/42">
          Your routines and history stay in this browser unless you export a backup.
        </div>
      </div>

      <div className={mobile ? 'grid gap-2' : 'grid gap-2'}>
        <Button
          type="button"
          variant="ghost"
          onClick={handleDownloadBackup}
          className="zune-button h-10 justify-start px-4"
        >
          <Download className="h-4 w-4" />
          Back up data
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="zune-button h-10 justify-start px-4"
        >
          <Upload className="h-4 w-4" />
          Load backup
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

