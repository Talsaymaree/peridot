'use client'

import type { FormEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
} from 'lucide-react'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  createInboxTask,
  createRoutine,
  fetchWorkspace,
  removeInboxTask,
  removeRoutine,
  saveTaskCompletion,
  subscribeToWorkspaceChanges,
  updateInboxTask,
  updateRoutine,
} from '@/lib/workspace-client'
import type { InboxTaskRecord, RoutineInput, RoutineRecord, TaskRecord } from '@/lib/workspace-types'

type QuickTaskMode = 'UNSCHEDULED' | 'ONCE' | 'REPEAT'

type ScheduledQuickTask = {
  routine: RoutineRecord
  regimen: RoutineRecord['regimens'][number]
  task: TaskRecord
  isOneTime: boolean
  completed: boolean
  scheduledDate: string | null
  scheduleTime: string
  repeatDays: string[]
}

type ArchiveHiveItem =
  | { kind: 'scheduled'; task: ScheduledQuickTask }
  | { kind: 'inbox'; task: InboxTaskRecord }

type SelectedBoardTask = {
  lane: 'open' | 'calendar' | 'archive'
  id: string
}

const weekdayOptions = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const todayIso = localIsoDate(new Date())

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseRecurrenceTimes(value: string | null) {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatTimeLabel(value: string) {
  const [hoursText, minutesText] = value.split(':')
  const hours = Number(hoursText)
  const minutes = minutesText || '00'

  if (Number.isNaN(hours)) return value
  if (hours === 0) return `12:${minutes} AM`
  if (hours < 12) return `${hours}:${minutes} AM`
  if (hours === 12) return `12:${minutes} PM`
  return `${hours - 12}:${minutes} PM`
}

function formatWeekday(day: string) {
  return day.slice(0, 1) + day.slice(1).toLowerCase()
}

function formatRepeatSummary(days: string[]) {
  if (days.length === 0) return 'Pick at least one day'
  if (days.length <= 3) return days.map(formatWeekday).join(', ')
  return `${days.slice(0, 3).map(formatWeekday).join(', ')} +${days.length - 3}`
}

function getScheduledTaskKey(task: ScheduledQuickTask) {
  return task.routine.id
}

function getArchiveHiveItemKey(item: ArchiveHiveItem) {
  return item.kind === 'scheduled' ? `scheduled:${getScheduledTaskKey(item.task)}` : `inbox:${item.task.id}`
}

function formatScheduledTaskMeta(task: ScheduledQuickTask) {
  return task.isOneTime
    ? `Scheduled ${task.scheduledDate ? formatDateLabel(task.scheduledDate) : 'for calendar'} at ${formatTimeLabel(task.scheduleTime)}`
    : `Repeats ${formatRepeatSummary(task.repeatDays)} at ${formatTimeLabel(task.scheduleTime)}`
}

function formatArchiveTaskMeta(item: ArchiveHiveItem) {
  const completedAt = item.kind === 'scheduled' ? item.task.task.completedAt : item.task.completedAt
  return completedAt ? `Completed ${formatDateTime(completedAt)}` : 'Completed'
}

function buildOffsetColumns<T>(items: T[]) {
  const buckets = {
    left: [] as T[],
    center: [] as T[],
    right: [] as T[],
  }
  const placementOrder: Array<keyof typeof buckets> = ['center', 'left', 'right']

  items.forEach((item, index) => {
    buckets[placementOrder[index % placementOrder.length]].push(item)
  })

  return [
    { key: 'left' as const, items: buckets.left },
    { key: 'center' as const, items: buckets.center },
    { key: 'right' as const, items: buckets.right },
  ]
}

function nextRepeatDate(days: string[]) {
  if (days.length === 0) return todayIso

  const weekdayOrder = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const start = new Date()

  for (let offset = 0; offset < 14; offset += 1) {
    const next = new Date(start)
    next.setDate(start.getDate() + offset)

    if (days.includes(weekdayOrder[next.getDay()])) {
      return localIsoDate(next)
    }
  }

  return todayIso
}

function buildScheduledQuickTasks(routines: RoutineRecord[]) {
  return routines
    .filter((routine) => routine.category === 'TASKBOARD')
    .flatMap((routine) => {
      const regimen = routine.regimens[0]
      const task = regimen?.tasks[0]

      if (!regimen || !task) return []

      const recurrenceType = regimen.recurrenceType || 'NONE'
      const recurrenceDays = regimen.recurrenceDays?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
      const recurrenceTimes = parseRecurrenceTimes(regimen.recurrenceTimes)
      const scheduledDate = recurrenceType === 'ONCE' ? recurrenceDays[0] ?? null : null
      const scheduleTime = scheduledDate
        ? recurrenceTimes[scheduledDate] || Object.values(recurrenceTimes)[0] || '09:00'
        : Object.values(recurrenceTimes)[0] || '09:00'

      return [{
        routine,
        regimen,
        task,
        isOneTime: recurrenceType === 'ONCE',
        completed: Boolean(task.completedAt),
        scheduledDate,
        scheduleTime,
        repeatDays: recurrenceType === 'ONCE' ? [] : recurrenceDays,
      }]
    })
    .sort((left, right) => {
      if (left.isOneTime && right.isOneTime) {
        return (left.scheduledDate || '').localeCompare(right.scheduledDate || '')
      }

      if (left.isOneTime !== right.isOneTime) {
        return left.isOneTime ? -1 : 1
      }

      return left.task.title.localeCompare(right.task.title)
    })
}

function buildRoutineInput(routine: RoutineRecord, categoryOverride?: string, normalizeOneTime = false): RoutineInput {
  return {
    name: routine.title,
    description: routine.description || undefined,
    category: categoryOverride ?? routine.category,
    isActive: routine.isActive,
    regimens: routine.regimens.map((regimen) => ({
      title: regimen.title,
      description: regimen.description || undefined,
      cadence: regimen.cadence,
      colorTint: regimen.colorTint || undefined,
      recurrenceType: normalizeOneTime && regimen.recurrenceType === 'ONCE' ? 'NONE' : regimen.recurrenceType || undefined,
      recurrenceDays: normalizeOneTime && regimen.recurrenceType === 'ONCE'
        ? []
        : regimen.recurrenceDays?.split(',').map((day) => day.trim()).filter(Boolean) ?? [],
      recurrenceTimes: normalizeOneTime && regimen.recurrenceType === 'ONCE' ? {} : parseRecurrenceTimes(regimen.recurrenceTimes),
      tasks: regimen.tasks.map((task) => ({
        title: task.title,
        description: task.description || undefined,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        dueLabel: task.dueLabel || undefined,
        dueBucket: task.dueBucket || undefined,
        referenceUrl: task.referenceUrl || undefined,
        referenceLabel: task.referenceLabel || undefined,
        referenceType: task.referenceType || undefined,
      })),
    })),
  }
}

function buildRoutineHref(routine: RoutineRecord) {
  const regimen = routine.regimens[0]
  const task = regimen?.tasks[0]
  const params = new URLSearchParams({
    builder: '1',
    routine: routine.id,
  })

  if (regimen) params.set('regimen', regimen.id)
  if (task) params.set('task', task.id)

  return `/routines?${params.toString()}`
}

function buildCalendarHref(task: ScheduledQuickTask) {
  const date = task.isOneTime && task.scheduledDate ? task.scheduledDate : nextRepeatDate(task.repeatDays)
  return `/calendar?date=${encodeURIComponent(date)}&regimen=${encodeURIComponent(task.regimen.id)}&task=${encodeURIComponent(task.task.id)}`
}

type CommandDeckAction = {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  variantClassName: string
}

function TaskCommandDeck({
  ariaLabel,
  hubLabel,
  topAction,
  leftAction,
  rightAction,
  className,
}: {
  ariaLabel: string
  hubLabel: string
  topAction: CommandDeckAction
  leftAction: CommandDeckAction
  rightAction: CommandDeckAction
  className?: string
}) {
  const actions = [
    { ...topAction, positionClassName: 'peridot-routine-command--top' },
    { ...leftAction, positionClassName: 'peridot-routine-command--left' },
    { ...rightAction, positionClassName: 'peridot-routine-command--right' },
  ]
  const deckId = useId().replace(/:/g, '')
  const cyanGlowId = `${deckId}-tboard-cyan-glow`

  return (
    <div className={`peridot-routine-command-deck${className ? ` ${className}` : ''}`} role="group" aria-label={ariaLabel}>
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
            <span className="peridot-routine-command-badge">{action.icon}</span>
          </button>
        ))}

        <div className="peridot-routine-command-hub" aria-hidden="true">
          <span>{hubLabel}</span>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const router = useRouter()
  const [routines, setRoutines] = useState<RoutineRecord[]>([])
  const [inboxTasks, setInboxTasks] = useState<InboxTaskRecord[]>([])
  const [selectedTask, setSelectedTask] = useState<SelectedBoardTask | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<QuickTaskMode>('UNSCHEDULED')
  const [scheduledDate, setScheduledDate] = useState(todayIso)
  const [scheduledTime, setScheduledTime] = useState('09:00')
  const [repeatDays, setRepeatDays] = useState<string[]>(['MON'])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBoard() {
      setIsLoading(true)
      setError(null)

      try {
        const workspace = await fetchWorkspace()
        setInboxTasks(workspace.inboxTasks)
        setRoutines(workspace.routines)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load task board.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBoard()

    return subscribeToWorkspaceChanges((reason) => {
      if (
        reason === 'inbox-task-created' ||
        reason === 'inbox-task-updated' ||
        reason === 'inbox-task-deleted' ||
        reason === 'routine-created' ||
        reason === 'routine-updated' ||
        reason === 'routine-deleted' ||
        reason === 'completion-updated' ||
        reason === 'workspace-imported' ||
        reason === 'profile-selected'
      ) {
        void loadBoard()
      }
    })
  }, [])

  const pendingInboxTasks = useMemo(() => inboxTasks.filter((task) => !task.completedAt), [inboxTasks])
  const completedInboxTasks = useMemo(() => inboxTasks.filter((task) => Boolean(task.completedAt)), [inboxTasks])
  const scheduledQuickTasks = useMemo(() => buildScheduledQuickTasks(routines), [routines])
  const activeScheduledTasks = useMemo(
    () => scheduledQuickTasks.filter((task) => !(task.isOneTime && task.completed)),
    [scheduledQuickTasks],
  )
  const completedScheduledTasks = useMemo(
    () => scheduledQuickTasks.filter((task) => task.isOneTime && task.completed),
    [scheduledQuickTasks],
  )
  const completedCount = completedInboxTasks.length + completedScheduledTasks.length
  const hivePressure = pendingInboxTasks.length + activeScheduledTasks.length
  const commandModeLabel = mode === 'UNSCHEDULED'
    ? 'OPEN TASK'
    : mode === 'ONCE'
      ? 'DATED TASK'
      : 'REPEATED TASK'
  const archiveHiveItems = useMemo<ArchiveHiveItem[]>(
    () => [
      ...completedScheduledTasks.map((task) => ({ kind: 'scheduled' as const, task })),
      ...completedInboxTasks.map((task) => ({ kind: 'inbox' as const, task })),
    ],
    [completedScheduledTasks, completedInboxTasks],
  )
  const hiveLoadCells = [
    { kicker: 'Open Board Tasks', value: String(pendingInboxTasks.length), copy: 'Unscheduled tasks waiting for action.' },
    { kicker: 'Calendar Board Tasks', value: String(activeScheduledTasks.length), copy: 'Tasks already placed on the calendar.' },
    { kicker: 'Archived Board Tasks', value: String(completedCount), copy: 'Completed tasks moved out of active boards.' },
  ]
  const taskSetupCells = [
    { kicker: 'Task Mode', value: commandModeLabel, copy: 'How this task will be created.' },
    { kicker: 'Active Load', value: String(hivePressure), copy: 'Open and scheduled tasks in motion.' },
    { kicker: 'Target Board', value: mode === 'UNSCHEDULED' ? 'Open Board Tasks' : 'Calendar Board Tasks', copy: 'Where this task will appear next.' },
  ]
  const selectedOpenTask = useMemo(
    () => selectedTask?.lane === 'open'
      ? pendingInboxTasks.find((task) => task.id === selectedTask.id) ?? null
      : null,
    [pendingInboxTasks, selectedTask],
  )
  const selectedCalendarTask = useMemo(
    () => selectedTask?.lane === 'calendar'
      ? activeScheduledTasks.find((task) => getScheduledTaskKey(task) === selectedTask.id) ?? null
      : null,
    [activeScheduledTasks, selectedTask],
  )
  const selectedArchiveTask = useMemo(
    () => selectedTask?.lane === 'archive'
      ? archiveHiveItems.find((item) => getArchiveHiveItemKey(item) === selectedTask.id) ?? null
      : null,
    [archiveHiveItems, selectedTask],
  )
  const openTaskColumns = buildOffsetColumns(pendingInboxTasks)
  const calendarTaskColumns = buildOffsetColumns(activeScheduledTasks)
  const archiveTaskColumns = buildOffsetColumns(archiveHiveItems)

  useEffect(() => {
    if (!selectedTask) return

    if (selectedTask.lane === 'open' && pendingInboxTasks.some((task) => task.id === selectedTask.id)) {
      return
    }

    if (selectedTask.lane === 'calendar' && activeScheduledTasks.some((task) => getScheduledTaskKey(task) === selectedTask.id)) {
      return
    }

    if (selectedTask.lane === 'archive' && archiveHiveItems.some((item) => getArchiveHiveItemKey(item) === selectedTask.id)) {
      return
    }

    setSelectedTask(null)
  }, [activeScheduledTasks, archiveHiveItems, pendingInboxTasks, selectedTask])

  function toggleTaskSelection(nextSelection: SelectedBoardTask) {
    setSelectedTask((current) => (
      current?.lane === nextSelection.lane && current.id === nextSelection.id
        ? null
        : nextSelection
    ))
  }

  function resetComposer() {
    setTitle('')
    setDescription('')
    setMode('UNSCHEDULED')
    setScheduledDate(todayIso)
    setScheduledTime('09:00')
    setRepeatDays(['MON'])
  }

  function toggleRepeatDay(day: string) {
    setRepeatDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]))
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      setError('Task title is required.')
      return
    }

    if (mode === 'ONCE' && !scheduledDate) {
      setError('Pick a date for the scheduled task.')
      return
    }

    if (mode === 'REPEAT' && repeatDays.length === 0) {
      setError('Pick at least one day for a repeating task.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      if (mode === 'UNSCHEDULED') {
        await createInboxTask({
          title: trimmedTitle,
          description: trimmedDescription || undefined,
        })
      } else {
        const recurrenceType = mode === 'ONCE' ? 'ONCE' : repeatDays.length > 1 ? 'SEMI_WEEKLY' : 'WEEKLY'
        const recurrenceDays = mode === 'ONCE' ? [scheduledDate] : repeatDays
        const recurrenceTimes = mode === 'ONCE'
          ? { [scheduledDate]: scheduledTime }
          : Object.fromEntries(repeatDays.map((day) => [day, scheduledTime]))

        await createRoutine({
          name: trimmedTitle,
          description: trimmedDescription || undefined,
          category: 'TASKBOARD',
          regimens: [{
            title: trimmedTitle,
            description: trimmedDescription || undefined,
            cadence: mode === 'ONCE' ? 'ONE_TIME' : 'CUSTOM',
            recurrenceType,
            recurrenceDays,
            recurrenceTimes,
            tasks: [{
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              priority: 'MEDIUM',
              status: 'TODO',
            }],
          }],
        })
      }

      resetComposer()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save task.')
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleInboxTask(task: InboxTaskRecord) {
    setBusyKey(`inbox-toggle-${task.id}`)
    setError(null)

    try {
      await updateInboxTask(task.id, { completed: !task.completedAt })
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update task.')
    } finally {
      setBusyKey(null)
    }
  }

  async function deleteInbox(taskId: string) {
    setBusyKey(`inbox-delete-${taskId}`)
    setError(null)

    try {
      await removeInboxTask(taskId)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete task.')
    } finally {
      setBusyKey(null)
    }
  }

  async function deleteScheduledTask(task: ScheduledQuickTask) {
    setBusyKey(`scheduled-delete-${task.routine.id}`)
    setError(null)

    try {
      await removeRoutine(task.routine.id)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete scheduled task.')
    } finally {
      setBusyKey(null)
    }
  }

  async function toggleScheduledCompletion(task: ScheduledQuickTask, completed: boolean) {
    if (!task.scheduledDate) return

    setBusyKey(`scheduled-toggle-${task.task.id}`)
    setError(null)

    try {
      await saveTaskCompletion({
        date: task.scheduledDate,
        regimenId: task.regimen.id,
        taskId: task.task.id,
        completed,
      })
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : 'Failed to update scheduled task.')
    } finally {
      setBusyKey(null)
    }
  }

  async function convertInboxTask(task: InboxTaskRecord) {
    setBusyKey(`convert-inbox-${task.id}`)
    setError(null)

    try {
      const routine = await createRoutine({
        name: task.title,
        description: task.description || undefined,
        category: 'CUSTOM',
        regimens: [{
          title: task.title,
          description: task.description || undefined,
          cadence: 'CUSTOM',
          recurrenceType: 'NONE',
          tasks: [{
            title: task.title,
            description: task.description || undefined,
            priority: 'MEDIUM',
            status: 'TODO',
          }],
        }],
      })

      await removeInboxTask(task.id)
      router.push(buildRoutineHref(routine))
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : 'Failed to convert task into a routine.')
    } finally {
      setBusyKey(null)
    }
  }

  async function convertScheduledTask(task: ScheduledQuickTask) {
    setBusyKey(`convert-scheduled-${task.routine.id}`)
    setError(null)

    try {
      const updated = await updateRoutine(task.routine.id, buildRoutineInput(task.routine, 'CUSTOM', true))
      router.push(buildRoutineHref(updated))
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : 'Failed to move quick task into routines.')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <PeridotPageChrome>
      <div className="peridot-app-page peridot-shell peridot-analytics-page peridot-tboard-page peridot-calendar-match-page">
        <div className="peridot-calendar-match-frame">
          <div className="peridot-tboard-page-shell">
            <section className="peridot-tboard-header peridot-calendar-match-header">
              <div className="peridot-settings-kicker peridot-calendar-match-header-kicker">BOARD</div>
              <div className="peridot-settings-description peridot-tboard-meta peridot-calendar-match-header-copy">Capture tasks fast. Promote to routine.</div>

              <div className="peridot-tboard-hive-rails">
                <div className="peridot-tboard-hive-rail">
                  <div className="peridot-tboard-hive-rail-label">Board Task Load</div>
                  <div className="peridot-analytics-stat-grid">
                    {hiveLoadCells.map((cell) => (
                      <div key={cell.kicker} className="peridot-analytics-stat-cell">
                        <div className="peridot-analytics-stat-kicker">{cell.kicker}</div>
                        <div className="peridot-analytics-stat-value">{cell.value}</div>
                        <p className="peridot-analytics-stat-copy">{cell.copy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="peridot-tboard-command-band">
                  {error ? <div className="peridot-danger-note px-4 py-3 text-sm">{error}</div> : null}

                  <form onSubmit={handleCreateTask} className="peridot-tboard-command-center peridot-tboard-command-center--header p-5 sm:p-6">
                    <div className="mb-5 flex justify-end">
                      <div className="peridot-accent-pill px-3 py-2 text-[10px] uppercase tracking-[0.18em]">
                        {commandModeLabel}
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Task Title</label>
                        <Input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Write the task exactly how you want to see it"
                          className="peridot-control h-12"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Notes</label>
                        <Textarea
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          placeholder="Optional context, link notes, or reminders"
                          className="peridot-control min-h-[120px]"
                          rows={4}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="mb-3 block text-sm font-medium text-[#ffdf33]/90">Task Type</div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'UNSCHEDULED', label: 'Open Task' },
                            { id: 'ONCE', label: 'Dated Task' },
                            { id: 'REPEAT', label: 'Repeated Task' },
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setMode(option.id as QuickTaskMode)}
                              className={`peridot-routines-builder-chip ${mode === option.id ? '' : 'is-ghost'}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {mode === 'ONCE' ? (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Date</label>
                            <Input
                              type="date"
                              value={scheduledDate}
                              onChange={(event) => setScheduledDate(event.target.value)}
                              className="peridot-control h-11"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Time</label>
                            <Input
                              type="time"
                              value={scheduledTime}
                              onChange={(event) => setScheduledTime(event.target.value)}
                              className="peridot-control h-11"
                            />
                          </div>
                        </>
                      ) : null}

                      {mode === 'REPEAT' ? (
                        <>
                          <div className="md:col-span-2">
                            <label className="mb-3 block text-sm font-medium text-[#ffdf33]/90">Repeat Days</label>
                            <div className="flex flex-wrap gap-2">
                              {weekdayOptions.map((day) => {
                                const selected = repeatDays.includes(day)
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleRepeatDay(day)}
                                    className={`px-3 py-2 text-sm ${selected ? 'peridot-chip-active' : 'peridot-chip'}`}
                                  >
                                    {formatWeekday(day)}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div className="max-w-sm">
                            <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Time</label>
                            <Input
                              type="time"
                              value={scheduledTime}
                              onChange={(event) => setScheduledTime(event.target.value)}
                              className="peridot-control h-11"
                            />
                          </div>
                        </>
                      ) : null}
                    </div>

                    <div className="mt-5 flex justify-end border-t border-[rgba(102,255,153,0.14)] pt-5">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="peridot-accent-button h-12 px-5 font-semibold uppercase tracking-[0.16em]"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Create Task
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="peridot-tboard-hive-rail is-right">
                  <div className="peridot-tboard-hive-rail-label">Task Setup</div>
                  <div className="peridot-analytics-stat-grid">
                    {taskSetupCells.map((cell) => (
                      <div key={cell.kicker} className="peridot-analytics-stat-cell">
                        <div className="peridot-analytics-stat-kicker">{cell.kicker}</div>
                        <div className="peridot-analytics-stat-value">{cell.value}</div>
                        <p className="peridot-analytics-stat-copy">{cell.copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="peridot-tboard-control-shell">

              <section className="peridot-tboard-surface">
                <div className="peridot-tboard-layout grid gap-6 px-5 pb-5 pt-0 sm:px-7 sm:pb-7 sm:pt-0">
                  <div className="peridot-tboard-hive-zone peridot-tboard-live-column">
                  <div className="peridot-tboard-hive-panel peridot-tboard-hive-panel--open px-0 pb-4 pt-0 sm:px-0 sm:pb-5 sm:pt-0">
                    {isLoading ? (
                      <div className="peridot-panel-deep px-4 py-6 text-center text-sm text-[#ffdf33]/55">Loading open board tasks...</div>
                    ) : pendingInboxTasks.length === 0 ? (
                      <div className="peridot-panel-deep border-dashed px-4 py-8 text-center text-sm text-[#ffdf33]/50">
                        Your open board tasks are clear.
                      </div>
                    ) : (
                      <div className="peridot-tboard-open-stage">
                        {selectedOpenTask ? (
                          <div className="peridot-tboard-open-command-shell">
                            <TaskCommandDeck
                              ariaLabel={`Task commands for ${selectedOpenTask.title}`}
                              hubLabel="Task"
                              className="peridot-routine-command-deck--detail peridot-tboard-open-command-deck"
                              topAction={{
                                label: 'Complete',
                                icon: busyKey === `inbox-toggle-${selectedOpenTask.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />,
                                onClick: () => void toggleInboxTask(selectedOpenTask),
                                disabled: busyKey !== null,
                                variantClassName: 'is-edit',
                              }}
                              leftAction={{
                                label: 'Promote',
                                icon: busyKey === `convert-inbox-${selectedOpenTask.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />,
                                onClick: () => void convertInboxTask(selectedOpenTask),
                                disabled: busyKey !== null,
                                variantClassName: 'is-duplicate',
                              }}
                              rightAction={{
                                label: 'Delete',
                                icon: busyKey === `inbox-delete-${selectedOpenTask.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />,
                                onClick: () => void deleteInbox(selectedOpenTask.id),
                                disabled: busyKey !== null,
                                variantClassName: 'is-delete',
                              }}
                            />
                            <div className="peridot-tboard-open-command-caption">{selectedOpenTask.title}</div>
                            <div className="peridot-tboard-open-command-meta">Added {formatDateTime(selectedOpenTask.createdAt)}</div>
                          </div>
                        ) : null}

                        <div className="peridot-tboard-open-grid">
                          {openTaskColumns.map((column) => (
                            <div key={`open-column-${column.key}`} className={`peridot-tboard-open-column peridot-tboard-open-column--${column.key}`}>
                              {column.items.map((task) => {
                                const isSelected = selectedTask?.lane === 'open' && selectedTask.id === task.id

                                return (
                                  <button
                                    key={task.id}
                                    type="button"
                                    onClick={() => toggleTaskSelection({ lane: 'open', id: task.id })}
                                    aria-pressed={isSelected}
                                    className={`peridot-analytics-stat-cell peridot-tboard-open-card${isSelected ? ' is-selected' : ''}`}
                                  >
                                    <div className="peridot-tboard-open-body">
                                      <div className="peridot-analytics-stat-kicker">Open Board Task</div>
                                      <div className="peridot-analytics-stat-value peridot-tboard-open-title">{task.title}</div>
                                      {task.description ? <div className="peridot-analytics-stat-copy peridot-tboard-open-copy">{task.description}</div> : null}
                                      <div className="peridot-analytics-stat-copy peridot-tboard-open-meta">Added {formatDateTime(task.createdAt)}</div>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                <div className="peridot-tboard-hive-panel peridot-tboard-hive-panel--calendar px-0 pb-4 pt-0 sm:px-0 sm:pb-5 sm:pt-0">
                  {isLoading ? (
                    <div className="peridot-panel-deep px-4 py-6 text-center text-sm text-[#ffdf33]/55">Loading calendar board tasks...</div>
                  ) : activeScheduledTasks.length === 0 ? (
                    <div className="peridot-panel-deep border-dashed px-4 py-8 text-center text-sm text-[#ffdf33]/50">
                      No tasks are sitting in calendar board tasks right now.
                    </div>
                  ) : (
                    <div className="peridot-tboard-open-stage">
                      {selectedCalendarTask ? (
                        <div className="peridot-tboard-open-command-shell">
                          <TaskCommandDeck
                            ariaLabel={`Task commands for ${selectedCalendarTask.task.title}`}
                            hubLabel="Task"
                            className="peridot-routine-command-deck--detail peridot-tboard-open-command-deck"
                            topAction={{
                              label: selectedCalendarTask.isOneTime ? 'Complete' : 'Review',
                              icon: selectedCalendarTask.isOneTime
                                ? (busyKey === `scheduled-toggle-${selectedCalendarTask.task.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Check className="h-4 w-4" />)
                                : <CalendarDays className="h-4 w-4" />,
                              onClick: () => {
                                if (selectedCalendarTask.isOneTime) {
                                  void toggleScheduledCompletion(selectedCalendarTask, true)
                                  return
                                }

                                router.push(buildCalendarHref(selectedCalendarTask))
                              },
                              disabled: busyKey !== null,
                              variantClassName: 'is-edit',
                            }}
                            leftAction={{
                              label: 'Promote',
                              icon: busyKey === `convert-scheduled-${selectedCalendarTask.routine.id}`
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Plus className="h-4 w-4" />,
                              onClick: () => void convertScheduledTask(selectedCalendarTask),
                              disabled: busyKey !== null,
                              variantClassName: 'is-duplicate',
                            }}
                            rightAction={{
                              label: 'Delete',
                              icon: busyKey === `scheduled-delete-${selectedCalendarTask.routine.id}`
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Trash2 className="h-4 w-4" />,
                              onClick: () => void deleteScheduledTask(selectedCalendarTask),
                              disabled: busyKey !== null,
                              variantClassName: 'is-delete',
                            }}
                          />
                          <div className="peridot-tboard-open-command-caption">{selectedCalendarTask.task.title}</div>
                          <div className="peridot-tboard-open-command-meta">{formatScheduledTaskMeta(selectedCalendarTask)}</div>
                        </div>
                      ) : null}

                      <div className="peridot-tboard-open-grid">
                        {calendarTaskColumns.map((column) => (
                          <div key={`calendar-column-${column.key}`} className={`peridot-tboard-open-column peridot-tboard-open-column--${column.key}`}>
                            {column.items.map((task) => {
                              const taskId = getScheduledTaskKey(task)
                              const isSelected = selectedTask?.lane === 'calendar' && selectedTask.id === taskId

                              return (
                                <button
                                  key={taskId}
                                  type="button"
                                  onClick={() => toggleTaskSelection({ lane: 'calendar', id: taskId })}
                                  aria-pressed={isSelected}
                                  className={`peridot-analytics-stat-cell peridot-tboard-open-card peridot-tboard-open-card--archive${isSelected ? ' is-selected' : ''}`}
                                >
                                  <div className="peridot-tboard-open-body">
                                    <div className="peridot-analytics-stat-kicker">{task.isOneTime ? 'Calendar Board Task' : 'Repeat Loop Task'}</div>
                                    <div className="peridot-analytics-stat-value peridot-tboard-open-title">{task.task.title}</div>
                                    <div className="peridot-analytics-stat-copy peridot-tboard-open-meta">{formatScheduledTaskMeta(task)}</div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="peridot-tboard-hive-panel peridot-tboard-hive-panel--archive px-0 pb-4 pt-0 sm:px-0 sm:pb-5 sm:pt-0">
                  {completedCount === 0 ? (
                    <div className="peridot-panel-deep border-dashed px-4 py-6 text-center text-sm text-[#ffdf33]/45">
                      No archived board tasks yet.
                    </div>
                  ) : (
                    <div className="peridot-tboard-open-stage">
                      {selectedArchiveTask ? (
                        <div className="peridot-tboard-open-command-shell">
                          <TaskCommandDeck
                            ariaLabel={`Task commands for ${selectedArchiveTask.kind === 'scheduled' ? selectedArchiveTask.task.task.title : selectedArchiveTask.task.title}`}
                            hubLabel="Task"
                            className="peridot-routine-command-deck--detail peridot-tboard-open-command-deck"
                            topAction={{
                              label: 'Restore',
                              icon: selectedArchiveTask.kind === 'scheduled'
                                ? (busyKey === `scheduled-toggle-${selectedArchiveTask.task.task.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <RefreshCcw className="h-4 w-4" />)
                                : (busyKey === `inbox-toggle-${selectedArchiveTask.task.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <RefreshCcw className="h-4 w-4" />),
                              onClick: () => {
                                if (selectedArchiveTask.kind === 'scheduled') {
                                  void toggleScheduledCompletion(selectedArchiveTask.task, false)
                                  return
                                }

                                void toggleInboxTask(selectedArchiveTask.task)
                              },
                              disabled: busyKey !== null,
                              variantClassName: 'is-edit',
                            }}
                            leftAction={{
                              label: 'Promote',
                              icon: selectedArchiveTask.kind === 'scheduled'
                                ? (busyKey === `convert-scheduled-${selectedArchiveTask.task.routine.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Plus className="h-4 w-4" />)
                                : (busyKey === `convert-inbox-${selectedArchiveTask.task.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Plus className="h-4 w-4" />),
                              onClick: () => {
                                if (selectedArchiveTask.kind === 'scheduled') {
                                  void convertScheduledTask(selectedArchiveTask.task)
                                  return
                                }

                                void convertInboxTask(selectedArchiveTask.task)
                              },
                              disabled: busyKey !== null,
                              variantClassName: 'is-duplicate',
                            }}
                            rightAction={{
                              label: 'Delete',
                              icon: selectedArchiveTask.kind === 'scheduled'
                                ? (busyKey === `scheduled-delete-${selectedArchiveTask.task.routine.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />)
                                : (busyKey === `inbox-delete-${selectedArchiveTask.task.id}`
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Trash2 className="h-4 w-4" />),
                              onClick: () => {
                                if (selectedArchiveTask.kind === 'scheduled') {
                                  void deleteScheduledTask(selectedArchiveTask.task)
                                  return
                                }

                                void deleteInbox(selectedArchiveTask.task.id)
                              },
                              disabled: busyKey !== null,
                              variantClassName: 'is-delete',
                            }}
                          />
                          <div className="peridot-tboard-open-command-caption">
                            {selectedArchiveTask.kind === 'scheduled' ? selectedArchiveTask.task.task.title : selectedArchiveTask.task.title}
                          </div>
                          <div className="peridot-tboard-open-command-meta">{formatArchiveTaskMeta(selectedArchiveTask)}</div>
                        </div>
                      ) : null}

                      <div className="peridot-tboard-open-grid">
                        {archiveTaskColumns.map((column) => (
                          <div key={`archive-column-${column.key}`} className={`peridot-tboard-open-column peridot-tboard-open-column--${column.key}`}>
                            {column.items.map((item) => {
                              const taskId = getArchiveHiveItemKey(item)
                              const isSelected = selectedTask?.lane === 'archive' && selectedTask.id === taskId
                              const titleText = item.kind === 'scheduled' ? item.task.task.title : item.task.title

                              return (
                                <button
                                  key={taskId}
                                  type="button"
                                  onClick={() => toggleTaskSelection({ lane: 'archive', id: taskId })}
                                  aria-pressed={isSelected}
                                  className={`peridot-analytics-stat-cell peridot-tboard-open-card${isSelected ? ' is-selected' : ''}`}
                                >
                                  <div className="peridot-tboard-open-body">
                                    <div className="peridot-analytics-stat-kicker">Archived Board Task</div>
                                    <div className="peridot-analytics-stat-value peridot-tboard-open-title is-struck">{titleText}</div>
                                    <div className="peridot-analytics-stat-copy peridot-tboard-open-meta">{formatArchiveTaskMeta(item)}</div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>
    </PeridotPageChrome>
  )
}


