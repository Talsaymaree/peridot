export const LEGACY_LOCAL_WORKSPACE_STORAGE_KEY = 'peridot-workspace-v1'
export const LOCAL_WORKSPACE_STORAGE_KEY = 'peridot-workspace-profiles-v1'
export const LOCAL_WORKSPACE_CHANGE_EVENT = 'peridot:workspace-changed'

export type TaskRecord = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  recurrenceType: string | null
  recurrenceDays: string | null
  dueDate: string | null
  dueLabel: string | null
  dueBucket: string | null
  completedAt: string | null
  referenceUrl: string | null
  referenceLabel: string | null
  referenceType: string | null
  createdAt: string
  updatedAt: string
}

export type RegimenRecord = {
  id: string
  title: string
  description: string | null
  cadence: string
  colorTint: string | null
  recurrenceType: string | null
  recurrenceDays: string | null
  recurrenceTimes: string | null
  createdAt: string
  updatedAt: string
  routineId: string
  tasks: TaskRecord[]
}

export type RoutineRecord = {
  id: string
  title: string
  description: string | null
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  regimens: RegimenRecord[]
}

export type CompletionRecord = {
  date: string
  regimenId: string
  taskId: string
  completedAt: string
}

export type CompletionItem = {
  regimenId: string
  taskId: string
  completedAt: string
}

export type AnalyticsSummary = {
  totals: {
    totalCompleted: number
    completedToday: number
    completedThisWeek: number
    activeDays: number
    currentStreak: number
  }
  series: Array<{
    date: string
    label: string
    total: number
  }>
  flowSeries: Array<{
    date: string
    label: string
    total: number
  }>
  routineSeries: Array<{
    date: string
    label: string
    total: number
  }>
  topRegimens: Array<{
    regimenId: string
    regimenTitle: string
    routineTitle: string
    completedCount: number
    lastCompletedAt: string | null
  }>
}

export type LocalWorkspace = {
  version: 1
  profile: {
    username: string
  }
  routines: RoutineRecord[]
  completions: CompletionRecord[]
}

export type LocalProfileSummary = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type SetLocalUsernameResult = {
  workspace: LocalWorkspace
  profileName: string
  mergedIntoExisting: boolean
}

export type BrowserRecoveryResult = {
  status: 'recovered' | 'not_found'
  recoveredWorkspaceCount: number
  recoveredRoutineCount: number
  sourceKeys: string[]
  currentOrigin: string
}

type LocalProfileRecord = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  workspace: LocalWorkspace
}

type LocalWorkspaceProfilesStore = {
  version: 1
  activeProfileId: string
  profiles: LocalProfileRecord[]
}

export type RoutineInput = {
  name?: string
  description?: string
  category?: string
  isActive?: boolean
  regimens?: Array<{
    title?: string
    description?: string
    cadence?: string
    colorTint?: string
    recurrenceType?: string
    recurrenceDays?: string[]
    recurrenceTimes?: Record<string, string>
    tasks?: Array<{
      title?: string
      description?: string
      priority?: string
      status?: string
      dueDate?: string | null
      dueLabel?: string
      dueBucket?: string
      referenceUrl?: string
      referenceLabel?: string
      referenceType?: string
    }>
  }>
}

type CompletionInput = {
  date: string
  regimenId: string
  taskId: string
  completed: boolean
}

type BackupEnvelope = {
  app?: string
  version?: number
  exportedAt?: string
  workspace?: unknown
  profile?: unknown
  routines?: unknown
  completions?: unknown
}

const seriesLabelFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `peridot-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`
}

function nowIso() {
  return new Date().toISOString()
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNullableString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function normalizeTimestamp(value: unknown, fallback = nowIso()) {
  if (typeof value !== 'string') return fallback

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString()
}

function normalizeIsoDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const parsed = new Date(`${value}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : value
}

function defaultWorkspace(): LocalWorkspace {
  return {
    version: 1,
    profile: {
      username: '',
    },
    routines: [],
    completions: [],
  }
}

function createProfileRecord(name?: string, workspace?: LocalWorkspace): LocalProfileRecord {
  const timestamp = nowIso()
  const nextWorkspace = workspace ? sanitizeWorkspace(workspace) : defaultWorkspace()
  const trimmedName = name?.trim() || nextWorkspace.profile.username.trim() || 'Workspace'

  return {
    id: createId(),
    name: trimmedName,
    createdAt: timestamp,
    updatedAt: timestamp,
    workspace: nextWorkspace,
  }
}

function defaultProfilesStore(): LocalWorkspaceProfilesStore {
  const profile = createProfileRecord()

  return {
    version: 1,
    activeProfileId: profile.id,
    profiles: [profile],
  }
}

function profileDisplayName(profile: LocalProfileRecord, index: number) {
  return profile.name.trim() || profile.workspace.profile.username.trim() || `Workspace ${index + 1}`
}

function normalizeProfileNameKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

function hasWorkspaceData(workspace: LocalWorkspace) {
  return workspace.routines.length > 0 || workspace.completions.length > 0
}

function hasProfileData(profile: LocalProfileRecord) {
  return hasWorkspaceData(profile.workspace)
}

function isPlaceholderProfile(profile: LocalProfileRecord, index: number) {
  const profileName = normalizeProfileNameKey(profileDisplayName(profile, index))

  return !profile.workspace.profile.username.trim() && (
    profileName === 'workspace' ||
    profileName === `workspace ${index + 1}` ||
    profileName === 'guest' ||
    profileName === 'guest workspace'
  )
}

function mergeWorkspaces(target: LocalWorkspace, source: LocalWorkspace, username: string) {
  const routineMap = new Map<string, RoutineRecord>()
  const completionMap = new Map<string, CompletionRecord>()

  for (const routine of [...target.routines, ...source.routines]) {
    const existing = routineMap.get(routine.id)

    if (!existing || routine.updatedAt > existing.updatedAt) {
      routineMap.set(routine.id, routine)
    }
  }

  for (const completion of [...target.completions, ...source.completions]) {
    const key = `${completion.date}:${completion.regimenId}:${completion.taskId}`
    const existing = completionMap.get(key)

    if (!existing || completion.completedAt > existing.completedAt) {
      completionMap.set(key, completion)
    }
  }

  return sanitizeWorkspace({
    version: 1,
    profile: {
      username,
    },
    routines: Array.from(routineMap.values()),
    completions: Array.from(completionMap.values()),
  })
}

function mergeIntoProfile(profile: LocalProfileRecord, profileName: string, workspace: LocalWorkspace) {
  profile.workspace = mergeWorkspaces(profile.workspace, workspace, profileName)
  profile.name = profileName
  profile.updatedAt = nowIso()
}

function hasNamedProfile(profile: LocalProfileRecord, index: number) {
  return !isPlaceholderProfile(profile, index) && profileDisplayName(profile, index).trim().length > 0
}

function healProfilesStore(store: LocalWorkspaceProfilesStore) {
  const activeProfile = activeProfileRecord(store)
  const activeIndex = store.profiles.findIndex((profile) => profile.id === activeProfile.id)
  const populatedProfiles = store.profiles.filter((profile) => hasProfileData(profile))

  if (populatedProfiles.length === 1) {
    const sourceProfile = populatedProfiles[0]

    if (sourceProfile.id !== activeProfile.id && !hasProfileData(activeProfile)) {
      if (activeIndex >= 0 && hasNamedProfile(activeProfile, activeIndex)) {
        const targetName = activeProfile.workspace.profile.username.trim() || profileDisplayName(activeProfile, activeIndex)
        mergeIntoProfile(activeProfile, targetName, sourceProfile.workspace)
        store.profiles = store.profiles.filter((profile) => profile.id !== sourceProfile.id)
        store.activeProfileId = activeProfile.id
      } else {
        store.activeProfileId = sourceProfile.id
      }

      return { store, changed: true }
    }
  }

  return { store, changed: false }
}

function reconcileLegacyWorkspace(store: LocalWorkspaceProfilesStore, legacyWorkspace: LocalWorkspace) {
  if (!hasWorkspaceData(legacyWorkspace) && !legacyWorkspace.profile.username.trim()) {
    return { store, changed: false, consumed: true }
  }

  const activeProfile = activeProfileRecord(store)
  const activeIndex = store.profiles.findIndex((profile) => profile.id === activeProfile.id)
  const legacyNameKey = normalizeProfileNameKey(legacyWorkspace.profile.username)
  const matchingProfile = legacyNameKey
    ? store.profiles.find((profile, index) => normalizeProfileNameKey(profileDisplayName(profile, index)) === legacyNameKey)
    : undefined

  if (matchingProfile) {
    const matchingIndex = store.profiles.findIndex((profile) => profile.id === matchingProfile.id)
    mergeIntoProfile(
      matchingProfile,
      legacyWorkspace.profile.username.trim() || profileDisplayName(matchingProfile, Math.max(matchingIndex, 0)),
      legacyWorkspace,
    )
    store.activeProfileId = matchingProfile.id
    return { store, changed: true, consumed: true }
  }

  if (store.profiles.every((profile) => !hasProfileData(profile)) || !hasProfileData(activeProfile)) {
    const targetName =
      activeProfile.workspace.profile.username.trim() ||
      (activeIndex >= 0 && hasNamedProfile(activeProfile, activeIndex)
        ? profileDisplayName(activeProfile, activeIndex)
        : legacyWorkspace.profile.username.trim() || profileDisplayName(activeProfile, Math.max(activeIndex, 0)))

    mergeIntoProfile(activeProfile, targetName, legacyWorkspace)
    store.activeProfileId = activeProfile.id
    return { store, changed: true, consumed: true }
  }

  return { store, changed: false, consumed: false }
}

function workspaceFingerprint(workspace: LocalWorkspace) {
  const routineIds = workspace.routines.map((routine) => routine.id).sort().join(',')
  const completionIds = workspace.completions
    .map((completion) => `${completion.date}:${completion.regimenId}:${completion.taskId}`)
    .sort()
    .join(',')

  return `${normalizeProfileNameKey(workspace.profile.username)}|${routineIds}|${completionIds}`
}

function pushRecoveryWorkspace(
  candidates: LocalWorkspace[],
  seen: Set<string>,
  workspace: LocalWorkspace,
) {
  if (!hasWorkspaceData(workspace) && !workspace.profile.username.trim()) {
    return
  }

  const fingerprint = workspaceFingerprint(workspace)

  if (seen.has(fingerprint)) {
    return
  }

  seen.add(fingerprint)
  candidates.push(workspace)
}

function collectRecoveryWorkspaces(value: unknown, seen = new Set<string>(), depth = 0): LocalWorkspace[] {
  if (depth > 2) {
    return []
  }

  const record = asRecord(value)

  if (!record) {
    return []
  }

  const candidates: LocalWorkspace[] = []
  pushRecoveryWorkspace(candidates, seen, sanitizeWorkspace(value))

  if (Array.isArray(record.profiles)) {
    const store = sanitizeProfilesStore(value)

    for (const profile of store.profiles) {
      pushRecoveryWorkspace(candidates, seen, profile.workspace)
    }
  }

  for (const field of ['workspace', 'data', 'value', 'payload', 'state']) {
    if (record[field] !== undefined) {
      candidates.push(...collectRecoveryWorkspaces(record[field], seen, depth + 1))
    }
  }

  return candidates
}

function normalizeTask(value: unknown): TaskRecord {
  const record = asRecord(value)
  const createdAt = normalizeTimestamp(record?.createdAt)

  return {
    id: asString(record?.id, createId()),
    title: asString(record?.title).trim(),
    description: asNullableString(record?.description),
    priority: asString(record?.priority, 'MEDIUM').trim() || 'MEDIUM',
    status: asString(record?.status, 'TODO').trim() || 'TODO',
    recurrenceType: asNullableString(record?.recurrenceType),
    recurrenceDays: asNullableString(record?.recurrenceDays),
    dueDate: asNullableString(record?.dueDate),
    dueLabel: asNullableString(record?.dueLabel),
    dueBucket: asNullableString(record?.dueBucket),
    completedAt: asNullableString(record?.completedAt),
    referenceUrl: asNullableString(record?.referenceUrl),
    referenceLabel: asNullableString(record?.referenceLabel),
    referenceType: asNullableString(record?.referenceType),
    createdAt,
    updatedAt: normalizeTimestamp(record?.updatedAt, createdAt),
  }
}

function normalizeRegimen(value: unknown, routineId: string): RegimenRecord | null {
  const record = asRecord(value)
  const createdAt = normalizeTimestamp(record?.createdAt)
  const tasks = asArray(record?.tasks)
    .map((task) => normalizeTask(task))
    .filter((task) => task.title.trim().length > 0)

  const title = asString(record?.title).trim()

  if (!title) {
    return null
  }

  return {
    id: asString(record?.id, createId()),
    title,
    description: asNullableString(record?.description),
    cadence: asString(record?.cadence, 'CUSTOM').trim() || 'CUSTOM',
    colorTint: asNullableString(record?.colorTint),
    recurrenceType: asNullableString(record?.recurrenceType),
    recurrenceDays: asNullableString(record?.recurrenceDays),
    recurrenceTimes: asNullableString(record?.recurrenceTimes),
    createdAt,
    updatedAt: normalizeTimestamp(record?.updatedAt, createdAt),
    routineId,
    tasks,
  }
}

function normalizeRoutine(value: unknown): RoutineRecord | null {
  const record = asRecord(value)
  const id = asString(record?.id, createId())
  const createdAt = normalizeTimestamp(record?.createdAt)
  const regimens = asArray(record?.regimens)
    .map((regimen) => normalizeRegimen(regimen, id))
    .filter((regimen): regimen is RegimenRecord => Boolean(regimen))

  const title = asString(record?.title).trim()

  if (!title) {
    return null
  }

  return {
    id,
    title,
    description: asNullableString(record?.description),
    category: asString(record?.category, 'CUSTOM').trim() || 'CUSTOM',
    isActive: asBoolean(record?.isActive, true),
    createdAt,
    updatedAt: normalizeTimestamp(record?.updatedAt, createdAt),
    regimens,
  }
}

function normalizeCompletion(value: unknown, workspace: LocalWorkspace): CompletionRecord | null {
  const record = asRecord(value)
  const date = normalizeIsoDate(record?.date)
  const regimenId = asString(record?.regimenId).trim()
  const taskId = asString(record?.taskId).trim()

  if (!date || !regimenId || !taskId) {
    return null
  }

  const task = findTask(workspace.routines, regimenId, taskId)

  if (!task) {
    return null
  }

  return {
    date,
    regimenId,
    taskId,
    completedAt: normalizeTimestamp(record?.completedAt),
  }
}

function sanitizeWorkspace(value: unknown): LocalWorkspace {
  const record = asRecord(value)
  const workspace = defaultWorkspace()
  const routines = asArray(record?.routines)
    .map((routine) => normalizeRoutine(routine))
    .filter((routine): routine is RoutineRecord => Boolean(routine))

  workspace.profile.username = asString(asRecord(record?.profile)?.username).trim()
  workspace.routines = routines
  workspace.completions = asArray(record?.completions)
    .map((completion) => normalizeCompletion(completion, { ...workspace, routines }))
    .filter((completion): completion is CompletionRecord => Boolean(completion))

  syncAllTaskCompletionState(workspace)
  return workspace
}

function sanitizeProfileRecord(value: unknown, index: number): LocalProfileRecord | null {
  const record = asRecord(value)
  const workspace = sanitizeWorkspace(record?.workspace)
  const createdAt = normalizeTimestamp(record?.createdAt)

  return {
    id: asString(record?.id, createId()),
    name: asString(record?.name).trim() || workspace.profile.username.trim() || `Workspace ${index + 1}`,
    createdAt,
    updatedAt: normalizeTimestamp(record?.updatedAt, createdAt),
    workspace,
  }
}

function sanitizeProfilesStore(value: unknown): LocalWorkspaceProfilesStore {
  const record = asRecord(value)
  const profiles = asArray(record?.profiles)
    .map((profile, index) => sanitizeProfileRecord(profile, index))
    .filter((profile): profile is LocalProfileRecord => Boolean(profile))

  if (profiles.length === 0) {
    return defaultProfilesStore()
  }

  const activeProfileId = asString(record?.activeProfileId)

  return {
    version: 1,
    activeProfileId: profiles.some((profile) => profile.id === activeProfileId)
      ? activeProfileId
      : profiles[0].id,
    profiles,
  }
}

function writeProfilesStore(store: LocalWorkspaceProfilesStore, reason: string) {
  if (typeof window === 'undefined') {
    return store
  }

  window.localStorage.setItem(LOCAL_WORKSPACE_STORAGE_KEY, JSON.stringify(store))
  window.localStorage.removeItem(LEGACY_LOCAL_WORKSPACE_STORAGE_KEY)
  emitWorkspaceChange(reason)
  return store
}

function readProfilesStore(): LocalWorkspaceProfilesStore {
  if (typeof window === 'undefined') {
    return defaultProfilesStore()
  }

  const raw = window.localStorage.getItem(LOCAL_WORKSPACE_STORAGE_KEY)

  if (raw) {
    try {
      let store = sanitizeProfilesStore(JSON.parse(raw))
      let changed = false
      const legacyRaw = window.localStorage.getItem(LEGACY_LOCAL_WORKSPACE_STORAGE_KEY)

      if (legacyRaw) {
        try {
          const legacyWorkspace = sanitizeWorkspace(JSON.parse(legacyRaw))
          const reconciled = reconcileLegacyWorkspace(store, legacyWorkspace)

          store = reconciled.store
          changed = changed || reconciled.changed

          if (reconciled.consumed) {
            window.localStorage.removeItem(LEGACY_LOCAL_WORKSPACE_STORAGE_KEY)
          }
        } catch {
          window.localStorage.removeItem(LEGACY_LOCAL_WORKSPACE_STORAGE_KEY)
        }
      }

      const healed = healProfilesStore(store)
      store = healed.store
      changed = changed || healed.changed

      if (changed) {
        window.localStorage.setItem(LOCAL_WORKSPACE_STORAGE_KEY, JSON.stringify(store))
      }

      return store
    } catch {
      return defaultProfilesStore()
    }
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_LOCAL_WORKSPACE_STORAGE_KEY)

  if (!legacyRaw) {
    return defaultProfilesStore()
  }

  try {
    const migratedWorkspace = sanitizeWorkspace(JSON.parse(legacyRaw))
    const migratedProfile = createProfileRecord(
      migratedWorkspace.profile.username.trim() || 'Workspace 1',
      migratedWorkspace,
    )
    const migratedStore = {
      version: 1,
      activeProfileId: migratedProfile.id,
      profiles: [migratedProfile],
    } satisfies LocalWorkspaceProfilesStore

    window.localStorage.setItem(LOCAL_WORKSPACE_STORAGE_KEY, JSON.stringify(migratedStore))
    window.localStorage.removeItem(LEGACY_LOCAL_WORKSPACE_STORAGE_KEY)
    return migratedStore
  } catch {
    return defaultProfilesStore()
  }
}

function activeProfileRecord(store: LocalWorkspaceProfilesStore) {
  return store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0]
}

function emitWorkspaceChange(reason: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(LOCAL_WORKSPACE_CHANGE_EVENT, {
      detail: { reason },
    }),
  )
}

function saveWorkspace(workspace: LocalWorkspace, reason: string) {
  if (typeof window === 'undefined') {
    return workspace
  }

  const store = readProfilesStore()
  const activeProfile = activeProfileRecord(store)
  const nextWorkspace = sanitizeWorkspace(workspace)

  activeProfile.workspace = nextWorkspace
  activeProfile.updatedAt = nowIso()

  if (nextWorkspace.profile.username.trim()) {
    activeProfile.name = nextWorkspace.profile.username.trim()
  } else {
    const profileIndex = store.profiles.findIndex((profile) => profile.id === activeProfile.id)
    activeProfile.name = profileDisplayName(activeProfile, Math.max(profileIndex, 0))
  }

  writeProfilesStore(store, reason)
  return activeProfile.workspace
}

export function readLocalWorkspace(): LocalWorkspace {
  if (typeof window === 'undefined') {
    return defaultWorkspace()
  }

  return activeProfileRecord(readProfilesStore()).workspace
}

export function replaceLocalWorkspace(nextWorkspace: LocalWorkspace, reason = 'workspace-replaced') {
  return saveWorkspace(sanitizeWorkspace(nextWorkspace), reason)
}

export function subscribeToLocalWorkspaceChanges(listener: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const handleCustom = () => listener()
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === LOCAL_WORKSPACE_STORAGE_KEY ||
      event.key === LEGACY_LOCAL_WORKSPACE_STORAGE_KEY
    ) {
      listener()
    }
  }

  window.addEventListener(LOCAL_WORKSPACE_CHANGE_EVENT, handleCustom)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(LOCAL_WORKSPACE_CHANGE_EVENT, handleCustom)
    window.removeEventListener('storage', handleStorage)
  }
}

export function listLocalProfiles(): LocalProfileSummary[] {
  const store = readProfilesStore()

  return store.profiles.map((profile, index) => ({
    id: profile.id,
    name: profileDisplayName(profile, index),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    isActive: profile.id === store.activeProfileId,
  }))
}

export function createLocalProfile(name?: string) {
  const store = readProfilesStore()
  const fallbackName = `Workspace ${store.profiles.length + 1}`
  const nextName = name?.trim() || fallbackName
  const activeProfile = activeProfileRecord(store)
  const activeIndex = store.profiles.findIndex((profile) => profile.id === activeProfile.id)

  if (
    store.profiles.length === 1 &&
    isPlaceholderProfile(activeProfile, Math.max(activeIndex, 0)) &&
    hasProfileData(activeProfile)
  ) {
    activeProfile.workspace.profile.username = nextName
    activeProfile.name = nextName
    activeProfile.updatedAt = nowIso()
    writeProfilesStore(store, 'profile-claimed')
    return activeProfile.workspace
  }

  const profile = createProfileRecord(nextName)

  profile.workspace.profile.username = nextName
  profile.name = nextName
  store.profiles.unshift(profile)
  store.activeProfileId = profile.id
  writeProfilesStore(store, 'profile-created')

  return profile.workspace
}

export function switchLocalProfile(profileId: string) {
  const store = readProfilesStore()
  const profile = store.profiles.find((item) => item.id === profileId)

  if (!profile) {
    throw new Error('Profile not found')
  }

  store.activeProfileId = profile.id
  writeProfilesStore(store, 'profile-switched')

  return profile.workspace
}

export function deleteLocalProfile(profileId: string) {
  const store = readProfilesStore()

  if (store.profiles.length <= 1) {
    throw new Error('At least one local profile must remain')
  }

  const existing = store.profiles.find((profile) => profile.id === profileId)

  if (!existing) {
    throw new Error('Profile not found')
  }

  store.profiles = store.profiles.filter((profile) => profile.id !== profileId)

  if (store.activeProfileId === profileId) {
    store.activeProfileId = store.profiles[0].id
  }

  writeProfilesStore(store, 'profile-deleted')
  return activeProfileRecord(store).workspace
}

export function setLocalUsername(username: string): SetLocalUsernameResult {
  const trimmed = username.trim()
  const store = readProfilesStore()
  const activeProfile = activeProfileRecord(store)

  activeProfile.workspace.profile.username = trimmed
  activeProfile.name = trimmed || activeProfile.name
  activeProfile.updatedAt = nowIso()

  const existingProfile = store.profiles.find((profile, index) => {
    if (profile.id === activeProfile.id) {
      return false
    }

    return normalizeProfileNameKey(profileDisplayName(profile, index)) === normalizeProfileNameKey(trimmed)
  })

  if (!existingProfile) {
    writeProfilesStore(store, 'profile-updated')
    return {
      workspace: activeProfile.workspace,
      profileName: trimmed,
      mergedIntoExisting: false,
    }
  }

  existingProfile.workspace = mergeWorkspaces(existingProfile.workspace, activeProfile.workspace, trimmed)
  existingProfile.name = trimmed
  existingProfile.updatedAt = nowIso()
  store.profiles = store.profiles.filter((profile) => profile.id !== activeProfile.id)
  store.activeProfileId = existingProfile.id
  writeProfilesStore(store, 'profile-merged')

  return {
    workspace: existingProfile.workspace,
    profileName: trimmed,
    mergedIntoExisting: true,
  }
}

export function exportLocalWorkspaceBackup() {
  return JSON.stringify(
    {
      app: 'Peridot',
      version: 1,
      exportedAt: nowIso(),
      workspace: readLocalWorkspace(),
    },
    null,
    2,
  )
}

export function importLocalWorkspaceBackup(raw: string) {
  const parsed = JSON.parse(raw) as BackupEnvelope
  const source = parsed?.workspace ?? {
    profile: parsed?.profile,
    routines: parsed?.routines,
    completions: parsed?.completions,
  }

  return replaceLocalWorkspace(sanitizeWorkspace(source), 'backup-imported')
}

export function importLocalWorkspaceBackupAsProfile(raw: string) {
  const parsed = JSON.parse(raw) as BackupEnvelope
  const source = parsed?.workspace ?? {
    profile: parsed?.profile,
    routines: parsed?.routines,
    completions: parsed?.completions,
  }
  const store = readProfilesStore()
  const workspace = sanitizeWorkspace(source)
  const profile = createProfileRecord(
    workspace.profile.username.trim() || `Workspace ${store.profiles.length + 1}`,
    workspace,
  )

  store.profiles.unshift(profile)
  store.activeProfileId = profile.id
  writeProfilesStore(store, 'backup-imported-as-profile')

  return profile.workspace
}

export function recoverLocalBrowserData(): BrowserRecoveryResult {
  if (typeof window === 'undefined') {
    return {
      status: 'not_found',
      recoveredWorkspaceCount: 0,
      recoveredRoutineCount: 0,
      sourceKeys: [],
      currentOrigin: '',
    }
  }

  const store = readProfilesStore()
  const existingFingerprints = new Set(store.profiles.map((profile) => workspaceFingerprint(profile.workspace)))
  const sourceKeys = new Set<string>()
  let recoveredWorkspaceCount = 0
  let recoveredRoutineCount = 0
  let changed = false

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)

    if (!key || key === LOCAL_WORKSPACE_STORAGE_KEY || key === LEGACY_LOCAL_WORKSPACE_STORAGE_KEY) {
      continue
    }

    const raw = window.localStorage.getItem(key)

    if (!raw) {
      continue
    }

    try {
      const candidates = collectRecoveryWorkspaces(JSON.parse(raw))

      for (const candidate of candidates) {
        if (!hasWorkspaceData(candidate)) {
          continue
        }

        const fingerprint = workspaceFingerprint(candidate)

        if (existingFingerprints.has(fingerprint)) {
          continue
        }

        const candidateNameKey = normalizeProfileNameKey(candidate.profile.username)
        const matchingProfile = candidateNameKey
          ? store.profiles.find((profile, profileIndex) => normalizeProfileNameKey(profileDisplayName(profile, profileIndex)) === candidateNameKey)
          : undefined

        if (matchingProfile) {
          const matchingIndex = store.profiles.findIndex((profile) => profile.id === matchingProfile.id)
          const matchingName = candidate.profile.username.trim() || profileDisplayName(matchingProfile, Math.max(matchingIndex, 0))
          mergeIntoProfile(matchingProfile, matchingName, candidate)
          store.activeProfileId = matchingProfile.id
        } else {
          const activeProfile = activeProfileRecord(store)
          const activeIndex = store.profiles.findIndex((profile) => profile.id === activeProfile.id)

          if (!hasProfileData(activeProfile)) {
            const targetName =
              activeProfile.workspace.profile.username.trim() ||
              (activeIndex >= 0 && hasNamedProfile(activeProfile, activeIndex)
                ? profileDisplayName(activeProfile, activeIndex)
                : candidate.profile.username.trim() || profileDisplayName(activeProfile, Math.max(activeIndex, 0)))

            mergeIntoProfile(activeProfile, targetName, candidate)
            store.activeProfileId = activeProfile.id
          } else {
            const recoveredName = candidate.profile.username.trim() || `Recovered ${store.profiles.length + 1}`
            const profile = createProfileRecord(recoveredName, candidate)
            profile.workspace.profile.username = candidate.profile.username.trim()
            profile.name = recoveredName
            store.profiles.unshift(profile)
            store.activeProfileId = profile.id
          }
        }

        existingFingerprints.add(fingerprint)
        sourceKeys.add(key)
        recoveredWorkspaceCount += 1
        recoveredRoutineCount += candidate.routines.length
        changed = true
      }
    } catch {
      continue
    }
  }

  if (changed) {
    writeProfilesStore(store, 'browser-data-recovered')
  }

  return {
    status: changed ? 'recovered' : 'not_found',
    recoveredWorkspaceCount,
    recoveredRoutineCount,
    sourceKeys: Array.from(sourceKeys),
    currentOrigin: window.location.origin,
  }
}

function buildCurrentStreak(dates: string[], today: string) {
  if (!dates.includes(today)) {
    return 0
  }

  const uniqueDates = new Set(dates)
  let streak = 0
  let cursor = new Date(`${today}T12:00:00`)

  while (uniqueDates.has(localIsoDate(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

export function getLocalAnalyticsSummary(workspace = readLocalWorkspace()): AnalyticsSummary {
  const today = new Date()
  const todayIso = localIsoDate(today)
  const seriesStartIso = localIsoDate(addDays(today, -6))
  const dailyTotals = new Map<string, number>()
  const flowDailyTotals = new Map<string, Set<string>>()
  const routineDailyTotals = new Map<string, Set<string>>()
  const regimenStats = new Map<string, { regimenId: string; regimenTitle: string; routineTitle: string; completedCount: number; lastCompletedAt: string | null }>()
  const regimenLookup = new Map<string, { regimenTitle: string; routineId: string; routineTitle: string }>()

  for (const routine of workspace.routines) {
    for (const regimen of routine.regimens) {
      regimenLookup.set(regimen.id, {
        regimenTitle: regimen.title,
        routineId: routine.id,
        routineTitle: routine.title,
      })
    }
  }

  for (const completion of workspace.completions) {
    dailyTotals.set(completion.date, (dailyTotals.get(completion.date) ?? 0) + 1)

    const labels = regimenLookup.get(completion.regimenId)
    if (!labels) {
      continue
    }

    if (!flowDailyTotals.has(completion.date)) {
      flowDailyTotals.set(completion.date, new Set())
    }
    flowDailyTotals.get(completion.date)?.add(completion.regimenId)

    if (!routineDailyTotals.has(completion.date)) {
      routineDailyTotals.set(completion.date, new Set())
    }
    routineDailyTotals.get(completion.date)?.add(labels.routineId)

    const current = regimenStats.get(completion.regimenId)

    if (!current) {
      regimenStats.set(completion.regimenId, {
        regimenId: completion.regimenId,
        regimenTitle: labels.regimenTitle,
        routineTitle: labels.routineTitle,
        completedCount: 1,
        lastCompletedAt: completion.completedAt,
      })
      continue
    }

    current.completedCount += 1
    if (!current.lastCompletedAt || completion.completedAt > current.lastCompletedAt) {
      current.lastCompletedAt = completion.completedAt
    }
  }

  const series = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6)
    const dateIso = localIsoDate(date)
    return {
      date: dateIso,
      label: seriesLabelFormatter.format(date),
      total: dailyTotals.get(dateIso) ?? 0,
    }
  })
  const flowSeries = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6)
    const dateIso = localIsoDate(date)
    return {
      date: dateIso,
      label: seriesLabelFormatter.format(date),
      total: flowDailyTotals.get(dateIso)?.size ?? 0,
    }
  })
  const routineSeries = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6)
    const dateIso = localIsoDate(date)
    return {
      date: dateIso,
      label: seriesLabelFormatter.format(date),
      total: routineDailyTotals.get(dateIso)?.size ?? 0,
    }
  })

  const streakDates = Array.from(new Set(workspace.completions.map((completion) => completion.date))).sort((left, right) => right.localeCompare(left))
  const topRegimens = Array.from(regimenStats.values())
    .sort((left, right) => {
      if (right.completedCount !== left.completedCount) {
        return right.completedCount - left.completedCount
      }

      return (right.lastCompletedAt || '').localeCompare(left.lastCompletedAt || '')
    })
    .slice(0, 5)

  return {
    totals: {
      totalCompleted: workspace.completions.length,
      completedToday: workspace.completions.filter((completion) => completion.date === todayIso).length,
      completedThisWeek: workspace.completions.filter((completion) => completion.date >= seriesStartIso).length,
      activeDays: new Set(workspace.completions.map((completion) => completion.date)).size,
      currentStreak: buildCurrentStreak(streakDates, todayIso),
    },
    series,
    flowSeries,
    routineSeries,
    topRegimens,
  }
}

export function getLocalCompletionsForDate(date: string, workspace = readLocalWorkspace()): CompletionItem[] {
  return workspace.completions
    .filter((completion) => completion.date === date)
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
    .map((completion) => ({
      regimenId: completion.regimenId,
      taskId: completion.taskId,
      completedAt: completion.completedAt,
    }))
}

function findTask(routines: RoutineRecord[], regimenId: string, taskId: string) {
  for (const routine of routines) {
    for (const regimen of routine.regimens) {
      if (regimen.id !== regimenId) {
        continue
      }

      const task = regimen.tasks.find((item) => item.id === taskId)

      if (task) {
        return task
      }
    }
  }

  return null
}

function syncTaskCompletionState(workspace: LocalWorkspace, taskId: string) {
  const latest = workspace.completions
    .filter((completion) => completion.taskId === taskId)
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0]

  for (const routine of workspace.routines) {
    for (const regimen of routine.regimens) {
      for (const task of regimen.tasks) {
        if (task.id === taskId) {
          task.completedAt = latest?.completedAt ?? null
          task.updatedAt = nowIso()
        }
      }
    }
  }
}

function syncAllTaskCompletionState(workspace: LocalWorkspace) {
  const taskIds = new Set<string>()

  for (const routine of workspace.routines) {
    for (const regimen of routine.regimens) {
      for (const task of regimen.tasks) {
        taskIds.add(task.id)
      }
    }
  }

  for (const taskId of taskIds) {
    syncTaskCompletionState(workspace, taskId)
  }
}

export function saveLocalTaskCompletion(input: CompletionInput) {
  const date = normalizeIsoDate(input.date)

  if (!date) {
    return null
  }

  const workspace = readLocalWorkspace()
  const task = findTask(workspace.routines, input.regimenId.trim(), input.taskId.trim())

  if (!task) {
    return null
  }

  const completedAt = nowIso()
  const completionIndex = workspace.completions.findIndex(
    (completion) =>
      completion.date === date &&
      completion.taskId === input.taskId &&
      completion.regimenId === input.regimenId,
  )

  if (input.completed) {
    const nextCompletion = {
      date,
      regimenId: input.regimenId,
      taskId: input.taskId,
      completedAt,
    }

    if (completionIndex >= 0) {
      workspace.completions[completionIndex] = nextCompletion
    } else {
      workspace.completions.push(nextCompletion)
    }
  } else if (completionIndex >= 0) {
    workspace.completions.splice(completionIndex, 1)
  }

  syncTaskCompletionState(workspace, input.taskId)
  saveWorkspace(workspace, 'completion-updated')

  return {
    completed: input.completed,
    completedAt: input.completed ? completedAt : null,
  }
}

function collectRoutineIds(routine: RoutineRecord) {
  return {
    regimenIds: new Set(routine.regimens.map((regimen) => regimen.id)),
    taskIds: new Set(routine.regimens.flatMap((regimen) => regimen.tasks.map((task) => task.id))),
  }
}

function filterCompletionsForRoutine(workspace: LocalWorkspace, routine: RoutineRecord) {
  const { regimenIds, taskIds } = collectRoutineIds(routine)
  workspace.completions = workspace.completions.filter(
    (completion) => !regimenIds.has(completion.regimenId) && !taskIds.has(completion.taskId),
  )
}

function buildRoutineFromInput(input: RoutineInput, existing?: RoutineRecord): RoutineRecord {
  const timestamp = nowIso()
  const routineId = existing?.id ?? createId()
  const regimens =
    input.regimens
      ?.map((regimen) => {
        const title = regimen.title?.trim()

        if (!title) {
          return null
        }

        const tasks = (
          regimen.tasks?.map((task) => {
            const taskTitle = task.title?.trim()

            if (!taskTitle) {
              return null
            }

            return {
              id: createId(),
              title: taskTitle,
              description: task.description?.trim() || null,
              priority: task.priority?.trim() || 'MEDIUM',
              status: task.status?.trim() || 'TODO',
              recurrenceType: null,
              recurrenceDays: null,
              dueDate: task.dueDate || null,
              dueLabel: task.dueLabel?.trim() || null,
              dueBucket: task.dueBucket?.trim() || null,
              completedAt: null,
              referenceUrl: task.referenceUrl?.trim() || null,
              referenceLabel: task.referenceLabel?.trim() || null,
              referenceType: task.referenceType?.trim() || null,
              createdAt: timestamp,
              updatedAt: timestamp,
            } satisfies TaskRecord
          }) ?? []
        ).filter(Boolean) as TaskRecord[]

        if (tasks.length === 0) {
          return null
        }

        return {
          id: createId(),
          title,
          description: regimen.description?.trim() || null,
          cadence: regimen.cadence?.trim() || 'CUSTOM',
          colorTint: regimen.colorTint?.trim() || null,
          recurrenceType: regimen.recurrenceType?.trim() || null,
          recurrenceDays: regimen.recurrenceDays?.map((day) => day.trim()).filter(Boolean).join(',') || null,
          recurrenceTimes: regimen.recurrenceTimes
            ? JSON.stringify(
                Object.fromEntries(
                  Object.entries(regimen.recurrenceTimes)
                    .map(([day, time]) => [day.trim(), time.trim()])
                    .filter(([, time]) => Boolean(time)),
                ),
              )
            : null,
          createdAt: timestamp,
          updatedAt: timestamp,
          routineId,
          tasks,
        } satisfies RegimenRecord
      })
      .filter((regimen): regimen is RegimenRecord => Boolean(regimen)) ?? []

  return {
    id: routineId,
    title: input.name?.trim() || 'Untitled Routine',
    description: input.description?.trim() || null,
    category: input.category?.trim() || 'CUSTOM',
    isActive: input.isActive ?? true,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    regimens,
  }
}

export function upsertLocalRoutine(input: RoutineInput, routineId?: string) {
  if (!input.name?.trim()) {
    throw new Error('Name is required')
  }

  const workspace = readLocalWorkspace()
  const existingIndex = routineId
    ? workspace.routines.findIndex((routine) => routine.id === routineId)
    : -1
  const existing = existingIndex >= 0 ? workspace.routines[existingIndex] : undefined
  const nextRoutine = buildRoutineFromInput(input, existing)

  if (existing) {
    filterCompletionsForRoutine(workspace, existing)
    workspace.routines[existingIndex] = nextRoutine
  } else {
    workspace.routines.unshift(nextRoutine)
  }

  saveWorkspace(workspace, existing ? 'routine-updated' : 'routine-created')
  return nextRoutine
}

export function deleteLocalRoutine(routineId: string) {
  const workspace = readLocalWorkspace()
  const existing = workspace.routines.find((routine) => routine.id === routineId)

  if (!existing) {
    throw new Error('Routine not found')
  }

  filterCompletionsForRoutine(workspace, existing)
  workspace.routines = workspace.routines.filter((routine) => routine.id !== routineId)
  saveWorkspace(workspace, 'routine-deleted')
}
