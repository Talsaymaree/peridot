import type {
  AnalyticsSummary,
  CompletionItem,
  InboxTaskInput,
  InboxTaskRecord,
  RoutineInput,
  RoutineRecord,
  WorkspaceProfileSummary,
  WorkspaceSnapshot,
} from '@/lib/workspace-types'

const WORKSPACE_CHANGE_EVENT = 'peridot:server-workspace-changed'

export type WorkspaceChangeReason =
  | 'profile-created'
  | 'profile-deleted'
  | 'profile-selected'
  | 'workspace-name-updated'
  | 'workspace-imported'
  | 'completion-updated'
  | 'routine-created'
  | 'routine-updated'
  | 'routine-deleted'
  | 'inbox-task-created'
  | 'inbox-task-updated'
  | 'inbox-task-deleted'

type CompletionSaveResult = {
  date: string
  regimenId: string
  taskId: string
  completed: boolean
  completedAt: string | null
}

type ProfilesResponse = {
  activeProfileId: string
  profiles: WorkspaceProfileSummary[]
}

function emitWorkspaceChange(reason: WorkspaceChangeReason) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(WORKSPACE_CHANGE_EVENT, {
      detail: { reason },
    }),
  )
}

async function readJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : 'Request failed'

    throw new Error(message)
  }

  return body as T
}

export function subscribeToWorkspaceChanges(listener: (reason: WorkspaceChangeReason) => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handle = (event: Event) => {
    const reason =
      event instanceof CustomEvent &&
      event.detail &&
      typeof event.detail === 'object' &&
      'reason' in event.detail &&
      typeof event.detail.reason === 'string'
        ? event.detail.reason as WorkspaceChangeReason
        : 'workspace-imported'

    listener(reason)
  }
  window.addEventListener(WORKSPACE_CHANGE_EVENT, handle)

  return () => {
    window.removeEventListener(WORKSPACE_CHANGE_EVENT, handle)
  }
}

export function getWorkspaceChangeEventName() {
  return WORKSPACE_CHANGE_EVENT
}

export async function fetchWorkspace() {
  return readJson<WorkspaceSnapshot>('/api/workspace')
}

export async function fetchProfiles() {
  return readJson<ProfilesResponse>('/api/profiles')
}

export async function createProfile(name: string) {
  const result = await readJson<{
    profile: WorkspaceProfileSummary
    activeProfileId: string
  }>('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

  emitWorkspaceChange('profile-created')
  return result
}

export async function removeProfile(profileId: string) {
  const result = await readJson<{
    success: boolean
    activeProfileId: string
  }>(`/api/profiles/${encodeURIComponent(profileId)}`, {
    method: 'DELETE',
  })

  emitWorkspaceChange('profile-deleted')
  return result
}

export async function selectProfile(profileId: string) {
  const result = await readJson<{
    activeProfileId: string
    profile: {
      id: string
      name: string
    }
  }>('/api/profiles/select', {
    method: 'POST',
    body: JSON.stringify({ profileId }),
  })

  emitWorkspaceChange('profile-selected')
  return result
}

export async function updateWorkspaceName(name: string) {
  const result = await readJson<{ profile: { username: string } }>('/api/workspace', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })

  emitWorkspaceChange('workspace-name-updated')
  return result
}

export async function fetchWorkspaceBackup() {
  return readJson<Record<string, unknown>>('/api/workspace/backup')
}

export async function importWorkspaceBackup(raw: string) {
  const payload = JSON.parse(raw)
  const result = await readJson('/api/workspace/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  emitWorkspaceChange('workspace-imported')
  return result
}

export async function fetchAnalytics() {
  return readJson<AnalyticsSummary>('/api/analytics')
}

export async function fetchCompletions(date: string) {
  const result = await readJson<{ date: string; items: CompletionItem[] }>(`/api/completions?date=${encodeURIComponent(date)}`)
  return result.items
}

export async function saveTaskCompletion(input: {
  date: string
  regimenId: string
  taskId: string
  completed: boolean
}) {
  const result = await readJson<CompletionSaveResult>('/api/completions', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  emitWorkspaceChange('completion-updated')
  return result
}

export async function createRoutine(input: RoutineInput) {
  const result = await readJson<RoutineRecord>('/api/routines', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  emitWorkspaceChange('routine-created')
  return result
}

export async function updateRoutine(routineId: string, input: RoutineInput) {
  const result = await readJson<RoutineRecord>(`/api/routines/${routineId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

  emitWorkspaceChange('routine-updated')
  return result
}

export async function removeRoutine(routineId: string) {
  const result = await readJson<{ success: boolean }>(`/api/routines/${routineId}`, {
    method: 'DELETE',
  })

  emitWorkspaceChange('routine-deleted')
  return result
}

export async function fetchInboxTasks() {
  return readJson<InboxTaskRecord[]>('/api/inbox-tasks')
}

export async function createInboxTask(input: InboxTaskInput) {
  const result = await readJson<InboxTaskRecord>('/api/inbox-tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  emitWorkspaceChange('inbox-task-created')
  return result
}

export async function updateInboxTask(taskId: string, input: InboxTaskInput) {
  const result = await readJson<InboxTaskRecord>(`/api/inbox-tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

  emitWorkspaceChange('inbox-task-updated')
  return result
}

export async function removeInboxTask(taskId: string) {
  const result = await readJson<{ success: boolean }>(`/api/inbox-tasks/${taskId}`, {
    method: 'DELETE',
  })

  emitWorkspaceChange('inbox-task-deleted')
  return result
}
