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
  weekdayBreakdown: Array<{
    day: string
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

export type WorkspaceSnapshot = {
  profile: {
    username: string
  }
  routines: RoutineRecord[]
}

export type WorkspaceProfileSummary = {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
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
