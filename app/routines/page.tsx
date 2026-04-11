'use client'

import { type ReactNode, type RefObject, Suspense, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Copy, ExternalLink, Image as ImageIcon, Link2, Pencil, PlayCircle, Plus, Trash2, X } from 'lucide-react'
import { DEFAULT_REGIMEN_TINT, getRegimenTint } from '@/lib/regimen-tints'
import {
  createRoutine,
  fetchWorkspace,
  removeRoutine,
  subscribeToWorkspaceChanges,
  updateRoutine,
} from '@/lib/workspace-client'
import type { RoutineInput } from '@/lib/workspace-types'

type Task = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueLabel: string | null
  referenceUrl: string | null
  referenceLabel: string | null
}

type Regimen = {
  id: string
  title: string
  description: string | null
  cadence: string
  colorTint: string | null
  recurrenceType: string | null
  recurrenceDays: string | null
  recurrenceTimes: string | null
  tasks: Task[]
}

type Routine = {
  id: string
  title: string
  description: string | null
  category: string
  isActive: boolean
  regimens: Regimen[]
}

type TaskDraft = {
  title: string
  description: string
  priority: string
  status: string
  dueLabel: string
  referenceUrl: string
  referenceLabel: string
}

type RegimenDraft = {
  title: string
  description: string
  cadence: string
  colorTint: string
  recurrenceType: string
  recurrenceDays: string[]
  recurrenceTimes: Record<string, string>
  tasks: TaskDraft[]
}

type RoutineDraft = {
  name: string
  description: string
  category: string
  regimens: RegimenDraft[]
}

const categories = ['WORKOUT', 'LEARNING', 'PRODUCTIVITY', 'HABITS', 'CUSTOM']
const recurrenceOptions = ['NONE', 'WEEKLY', 'SEMI_WEEKLY', 'MONTHLY']
const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const formatLabel = (value: string) => value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const formatWeekday = (day: string) => ({ MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' }[day] || day)
const parseRecurrenceTimes = (value: string | null) => {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed ? parsed as Record<string, string> : {}
  } catch {
    return {}
  }
}
const emptyTask = (): TaskDraft => ({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueLabel: '', referenceUrl: '', referenceLabel: '' })
const emptyRegimen = (): RegimenDraft => ({ title: '', description: '', cadence: 'CUSTOM', colorTint: DEFAULT_REGIMEN_TINT, recurrenceType: 'NONE', recurrenceDays: [], recurrenceTimes: {}, tasks: [emptyTask()] })
const emptyRoutine = (): RoutineDraft => ({ name: '', description: '', category: 'CUSTOM', regimens: [emptyRegimen()] })
const countTasks = (regimens: Regimen[]) => regimens.reduce((sum, regimen) => sum + regimen.tasks.length, 0)
const parseRecurrenceDays = (days: string | null) => days?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
const countFilledDraftTasks = (tasks: TaskDraft[]) => tasks.filter((task) => task.title.trim()).length
const getDraftRegimenTitle = (regimen: RegimenDraft, index: number) => regimen.title.trim() || `Untitled flow ${index + 1}`
const cadenceFromRepeat = (repeat: string) => repeat === 'NONE' ? 'CUSTOM' : repeat
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const getDraftRegimenDaySummary = (regimen: RegimenDraft) => {
  if (regimen.recurrenceDays.length === 0) return 'Pick the days this flow should appear.'
  const days = regimen.recurrenceDays.map(formatWeekday)
  return days.length <= 3 ? days.join(', ') : `${days.slice(0, 3).join(', ')} +${days.length - 3}`
}

function timeLabel(value: string) {
  const [hoursText, minutesText] = value.split(':')
  const hours = Number(hoursText)
  const minutes = minutesText || '00'

  if (Number.isNaN(hours)) return value
  if (hours === 0) return `12:${minutes} AM`
  if (hours < 12) return `${hours}:${minutes} AM`
  if (hours === 12) return `12:${minutes} PM`
  return `${hours - 12}:${minutes} PM`
}

function tagAngle(width: number) {
  return -(Math.atan2(48, width) * 180) / Math.PI
}

function BuilderFlowPreview({
  regimen,
  regimenIndex,
  activeTaskIndex,
  onSelectTask,
  previewTaskCount,
  isEditingFlow,
  onSelectFlow,
  showDays,
}: {
  regimen: RegimenDraft
  regimenIndex: number
  activeTaskIndex: number
  onSelectTask: (index: number) => void
  previewTaskCount?: number
  isEditingFlow?: boolean
  onSelectFlow?: () => void
  showDays?: boolean
}) {
  const routineTitle = getDraftRegimenTitle(regimen, regimenIndex)
  const taskTitles = regimen.tasks.map((task, index) => task.title.trim() || `Task ${index + 1}`).slice(0, previewTaskCount ?? regimen.tasks.length)
  const longestWidth = Math.max(
    clamp(150 + routineTitle.length * 7, 170, 340),
    ...taskTitles.map((title) => clamp(138 + title.length * 6, 160, 340)),
    170,
  )
  const recurrenceDays = regimen.recurrenceDays.length > 0 ? regimen.recurrenceDays : Object.keys(regimen.recurrenceTimes)
  const previewDay = recurrenceDays[0]
  const previewTime = previewDay ? regimen.recurrenceTimes[previewDay] || '09:00' : '09:00'
  const daySummary = recurrenceDays.length > 0
    ? recurrenceDays.map(formatWeekday).join(' ')
    : 'Custom'
  const routineTextX = longestWidth / 2
  const angle = tagAngle(longestWidth)
  const timeLineWidth = 118
  const routineY = 62
  const taskStartY = 126
  const taskStep = 62
  const verticalX = 118 + longestWidth - 14
  const verticalEndY = taskStartY + Math.max(taskTitles.length - 1, 0) * taskStep + 34
  const viewWidth = 118 + longestWidth + 28
  const viewHeight = Math.max(248, taskStartY + Math.max(taskTitles.length - 1, 0) * taskStep + 122)

  return (
    <div className="peridot-routines-builder-preview-shell" style={{ width: `${viewWidth}px` }}>
      <svg className="peridot-live-cluster-svg" viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
        <text x="6" y="118" className="peridot-live-time-value peridot-live-time-label">{timeLabel(previewTime)}</text>
        <rect x="0" y="126" width={timeLineWidth} height="3" fill="#66ff99" />
        {showDays ? (
          <text x="0" y="148" className="peridot-routines-day-label">{daySummary}</text>
        ) : null}
        <line x1={verticalX} y1="88" x2={verticalX} y2={verticalEndY} stroke="#66ff99" strokeWidth="3" />

        <g
          transform={`translate(118 ${routineY})`}
          className={onSelectFlow ? 'peridot-live-cluster-hit' : undefined}
          role={onSelectFlow ? 'button' : undefined}
          tabIndex={onSelectFlow ? 0 : undefined}
          onClick={onSelectFlow}
          onKeyDown={onSelectFlow ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelectFlow()
            }
          } : undefined}
        >
          <polygon
            points={`0,48 ${longestWidth},0 ${longestWidth},32 0,80`}
            className={isEditingFlow ? 'peridot-live-tag is-routine is-editing' : 'peridot-live-tag is-routine'}
          />
          <text
            x={routineTextX}
            y="40"
            className="peridot-static-cluster-routine"
            transform={`rotate(${angle} ${routineTextX} 40)`}
          >
            {routineTitle}
          </text>
        </g>

        {taskTitles.map((title, index) => (
          <g
            key={`builder-preview-task-${index}`}
            transform={`translate(118 ${taskStartY + index * taskStep})`}
            className="peridot-live-cluster-hit"
            role="button"
            tabIndex={0}
            onClick={() => onSelectTask(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectTask(index)
              }
            }}
          >
            <polygon
              points={`0,48 ${longestWidth},0 ${longestWidth},32 0,80`}
              className={index === activeTaskIndex ? 'peridot-live-tag is-editing' : 'peridot-live-tag'}
            />
            <text
              x={routineTextX}
              y="40"
              className="peridot-static-cluster-task"
              transform={`rotate(${angle} ${routineTextX} 40)`}
            >
              {title}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

function routineToDraft(routine: Routine): RoutineDraft {
  return {
    name: routine.title,
    description: routine.description || '',
    category: routine.category,
    regimens: routine.regimens.length > 0
      ? routine.regimens.map((regimen) => ({
          title: regimen.title,
          description: regimen.description || '',
          cadence: regimen.cadence,
          colorTint: getRegimenTint(regimen.colorTint),
          recurrenceType: regimen.recurrenceType || 'NONE',
          recurrenceDays: parseRecurrenceDays(regimen.recurrenceDays),
          recurrenceTimes: parseRecurrenceTimes(regimen.recurrenceTimes),
          tasks: regimen.tasks.length > 0
            ? regimen.tasks.map((task) => ({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                status: task.status,
                dueLabel: task.dueLabel || '',
                referenceUrl: task.referenceUrl || '',
                referenceLabel: task.referenceLabel || '',
              }))
            : [emptyTask()],
        }))
      : [emptyRegimen()],
  }
}

function regimenToDraft(regimen: Regimen): RegimenDraft {
  return {
    title: regimen.title,
    description: regimen.description || '',
    cadence: regimen.cadence,
    colorTint: getRegimenTint(regimen.colorTint),
    recurrenceType: regimen.recurrenceType || 'NONE',
    recurrenceDays: parseRecurrenceDays(regimen.recurrenceDays),
    recurrenceTimes: parseRecurrenceTimes(regimen.recurrenceTimes),
    tasks: regimen.tasks.length > 0
      ? regimen.tasks.map((task) => ({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          dueLabel: task.dueLabel || '',
          referenceUrl: task.referenceUrl || '',
          referenceLabel: task.referenceLabel || '',
        }))
      : [emptyTask()],
  }
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.split('/').filter(Boolean)[0] ? `https://www.youtube.com/embed/${parsed.pathname.split('/').filter(Boolean)[0]}` : null
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean)[1]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

function ReferencePreview({ url, label }: { url: string | null, label: string | null }) {
  if (!url) return null
  const embed = getYouTubeEmbedUrl(url)
  const title = label || 'Task reference'
  if (embed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#33b7db]/10 bg-black/30 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex items-center gap-2 border-b border-[#33b7db]/10 px-4 py-3 text-sm text-[#ffdf33]/70">
          <PlayCircle className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="peridot-embed-frame w-full overflow-hidden bg-black">
          <iframe
            src={`${embed}?rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }
  if (/\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(url)) {
    return <div className="overflow-hidden rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/5"><div className="flex items-center gap-2 border-b border-[#33b7db]/10 px-4 py-3 text-sm text-[#ffdf33]/70"><ImageIcon className="h-4 w-4" /><span>{title}</span></div><img src={url} alt={title} className="h-64 w-full object-cover" /></div>
  }
  return <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-[#33b7db]/10 bg-[#33b7db]/5 px-4 py-4 text-[#ffdf33]"><div className="flex items-center gap-3"><Link2 className="h-5 w-5 text-[#ffdf33]/70" /><div><div className="font-medium">{title}</div><div className="text-sm text-[#ffdf33]/60">{url}</div></div></div><ExternalLink className="h-4 w-4 text-[#ffdf33]/60" /></a>
}

function duplicateRegimenDraft(regimen: RegimenDraft): RegimenDraft {
  return {
    ...regimen,
    title: regimen.title ? `${regimen.title} Copy` : regimen.title,
    recurrenceDays: [...regimen.recurrenceDays],
    recurrenceTimes: { ...regimen.recurrenceTimes },
    tasks: regimen.tasks.map((task) => ({ ...task })),
  }
}

type CommandDeckAction = {
  label: string
  icon: ReactNode
  onClick: () => void
  disabled?: boolean
  variantClassName: string
}

function PeridotCommandDeck({
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
  const cyanGlowId = `${deckId}-peridot-routine-cyan-glow`
  const redGlowId = `${deckId}-peridot-routine-red-glow`

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
            <filter id={redGlowId} x="-40%" y="-40%" width="180%" height="180%">
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

function RoutineCommandDeck({
  onEdit,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
  className,
}: {
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  isDuplicating: boolean
  isDeleting: boolean
  className?: string
}) {
  return (
    <PeridotCommandDeck
      ariaLabel="Routine actions"
      hubLabel="Routine"
      className={className}
      topAction={{
        label: 'Edit',
        icon: <Pencil className="h-4 w-4" />,
        onClick: onEdit,
        variantClassName: 'is-edit',
      }}
      leftAction={{
        label: isDeleting ? 'Deleting' : 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        onClick: onDelete,
        disabled: isDeleting || isDuplicating,
        variantClassName: 'is-delete',
      }}
      rightAction={{
        label: isDuplicating ? 'Duplicating' : 'Duplicate',
        icon: <Copy className="h-4 w-4" />,
        onClick: onDuplicate,
        disabled: isDuplicating || isDeleting,
        variantClassName: 'is-duplicate',
      }}
    />
  )
}

function RoutinesPageContent() {
  const searchParams = useSearchParams()
  const requestedBuilder = searchParams.get('builder') === '1'
  const requestedRoutineId = searchParams.get('routine')
  const requestedRegimenId = searchParams.get('regimen')
  const requestedTaskId = searchParams.get('task')
  const builderInlineDetailPanelRef = useRef<HTMLElement | null>(null)
  const liveInlineDetailPanelRef = useRef<HTMLElement | null>(null)
  const hasHandledInlineScrollRef = useRef(false)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null)
  const [formData, setFormData] = useState<RoutineDraft>(emptyRoutine())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null)
  const [activeRegimenIndex, setActiveRegimenIndex] = useState(0)
  const [activeTaskIndex, setActiveTaskIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null)
  const [duplicatingRoutineId, setDuplicatingRoutineId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const visibleRoutines = useMemo(() => routines, [routines])

  useEffect(() => {
    void loadWorkspace()
  }, [])

  async function loadWorkspace() {
    setIsLoading(true)
    setError(null)
    try {
      const workspace = await fetchWorkspace()
      setRoutines(workspace.routines)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load routines')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return subscribeToWorkspaceChanges(() => {
      void loadWorkspace()
    })
  }, [])

  useEffect(() => {
    if (showCreateForm) return
    if (editingRoutineId) return
    const firstRoutine = visibleRoutines[0]
    const firstRegimen = firstRoutine?.regimens[0]
    if (!firstRoutine || !firstRegimen) return
    setSelectedRoutineId(firstRoutine.id)
    setEditingRoutineId(firstRoutine.id)
    setFormData(routineToDraft(firstRoutine))
    setActiveRegimenIndex(0)
    setActiveTaskIndex(-1)
  }, [editingRoutineId, showCreateForm, visibleRoutines])

  useEffect(() => {
    if (showCreateForm) return
    if (visibleRoutines.length === 0) {
      setSelectedRoutineId(null)
      return
    }
    setSelectedRoutineId((current) => current && visibleRoutines.some((routine) => routine.id === current) ? current : visibleRoutines[0].id)
  }, [showCreateForm, visibleRoutines])

  useEffect(() => {
    if (!showCreateForm) return
    setActiveRegimenIndex((current) => {
      if (formData.regimens.length === 0) return 0
      return Math.min(current, formData.regimens.length - 1)
    })
  }, [formData.regimens.length, showCreateForm])

  useEffect(() => {
    if (!showCreateForm) return
    const regimen = formData.regimens[activeRegimenIndex]
    if (!regimen) {
      setActiveTaskIndex(0)
      return
    }
    setActiveTaskIndex((current) => regimen.tasks.length === 0 ? 0 : Math.min(current, regimen.tasks.length - 1))
  }, [activeRegimenIndex, formData.regimens, showCreateForm])

  const totalRegimens = useMemo(() => routines.reduce((sum, routine) => sum + routine.regimens.length, 0), [routines])
  const totalTasks = useMemo(() => routines.reduce((sum, routine) => sum + countTasks(routine.regimens), 0), [routines])
  const selectedRegimen = formData.regimens[activeRegimenIndex] ?? null
  const selectedTask = selectedRegimen?.tasks[activeTaskIndex] ?? null
  const selectedPreviewTime = useMemo(() => {
    if (!selectedRegimen) return '09:00'
    const recurrenceDays = selectedRegimen.recurrenceDays.length > 0 ? selectedRegimen.recurrenceDays : Object.keys(selectedRegimen.recurrenceTimes)
    const firstDay = recurrenceDays[0]
    return firstDay ? selectedRegimen.recurrenceTimes[firstDay] || '09:00' : '09:00'
  }, [selectedRegimen])

  useEffect(() => {
    const hasSelectedRegimen = activeRegimenIndex < formData.regimens.length
    if (!hasSelectedRegimen || typeof window === 'undefined') return
    if (!window.matchMedia('(max-width: 1023px)').matches) return

    if (!hasHandledInlineScrollRef.current) {
      hasHandledInlineScrollRef.current = true
      return
    }

    const detailPanel = showCreateForm ? builderInlineDetailPanelRef.current : liveInlineDetailPanelRef.current
    if (!detailPanel) return

    const animationFrame = window.requestAnimationFrame(() => {
      detailPanel.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [activeRegimenIndex, activeTaskIndex, editingRoutineId, formData.regimens.length, showCreateForm])
  useEffect(() => {
    if (!requestedBuilder || !requestedRoutineId) return

    const requestedRoutine = routines.find((routine) => routine.id === requestedRoutineId)
    if (!requestedRoutine) return

    const regimenIndex = requestedRegimenId
      ? requestedRoutine.regimens.findIndex((regimen) => regimen.id === requestedRegimenId)
      : 0
    const safeRegimenIndex = regimenIndex >= 0 ? regimenIndex : 0
    const regimen = requestedRoutine.regimens[safeRegimenIndex] ?? null
    const taskIndex = requestedTaskId && regimen
      ? regimen.tasks.findIndex((task) => task.id === requestedTaskId)
      : -1

    setSelectedRoutineId(requestedRoutine.id)
    setEditingRoutineId(requestedRoutine.id)
    setFormData(routineToDraft(requestedRoutine))
    setActiveRegimenIndex(safeRegimenIndex)
    setActiveTaskIndex(taskIndex >= 0 ? taskIndex : -1)
    setShowCreateForm(true)
  }, [requestedBuilder, requestedRegimenId, requestedRoutineId, requestedTaskId, routines])
  const activeRoutine = useMemo(() => {
    if (!selectedRoutineId) return visibleRoutines[0] ?? null
    return visibleRoutines.find((routine) => routine.id === selectedRoutineId) ?? visibleRoutines[0] ?? null
  }, [selectedRoutineId, visibleRoutines])
  const updateRegimen = (index: number, patch: Partial<RegimenDraft>) => setFormData((current) => ({ ...current, regimens: current.regimens.map((regimen, i) => i === index ? { ...regimen, ...patch } : regimen) }))
  const updateTask = (regimenIndex: number, taskIndex: number, patch: Partial<TaskDraft>) => setFormData((current) => ({ ...current, regimens: current.regimens.map((regimen, i) => i === regimenIndex ? { ...regimen, tasks: regimen.tasks.map((task, j) => j === taskIndex ? { ...task, ...patch } : task) } : regimen) }))
  const toggleRegimenDay = (regimenIndex: number, day: string) => {
    const regimen = formData.regimens[regimenIndex]
    const selected = regimen.recurrenceDays.includes(day)
    updateRegimen(regimenIndex, {
      recurrenceDays: selected ? regimen.recurrenceDays.filter((current) => current !== day) : [...regimen.recurrenceDays, day],
      recurrenceTimes: selected
        ? Object.fromEntries(Object.entries(regimen.recurrenceTimes).filter(([currentDay]) => currentDay !== day))
        : { ...regimen.recurrenceTimes, [day]: regimen.recurrenceTimes[day] || '09:00' },
    })
  }
  const updateRegimenTime = (regimenIndex: number, day: string, time: string) => updateRegimen(regimenIndex, { recurrenceTimes: { ...formData.regimens[regimenIndex].recurrenceTimes, [day]: time } })

  function closeBuilder() {
    setShowCreateForm(false)
    setEditingRoutineId(null)
    setFormData(emptyRoutine())
    setActiveRegimenIndex(0)
    setActiveTaskIndex(0)
  }

  function openCreateRoutine() {
    setEditingRoutineId(null)
    setFormData(emptyRoutine())
    setActiveRegimenIndex(0)
    setActiveTaskIndex(-1)
    setShowCreateForm(true)
  }

  function openEditRoutine(routine: Routine) {
    setEditingRoutineId(routine.id)
    setSelectedRoutineId(routine.id)
    setFormData(routineToDraft(routine))
    setActiveRegimenIndex(0)
    setActiveTaskIndex(-1)
    setShowCreateForm(true)
  }

  function selectRoutine(routine: Routine) {
    setSelectedRoutineId(routine.id)
    setEditingRoutineId(routine.id)
    setFormData(routineToDraft(routine))
    setActiveRegimenIndex(0)
    setActiveTaskIndex(-1)
    setShowCreateForm(false)
  }

  function selectFlowCell(routine: Routine, regimenIndex: number) {
    setSelectedRoutineId(routine.id)
    setEditingRoutineId(routine.id)
    setFormData(routineToDraft(routine))
    setActiveRegimenIndex(regimenIndex)
    setActiveTaskIndex(-1)
    setShowCreateForm(false)
  }

  function selectFlowTask(routine: Routine, regimenIndex: number, taskIndex: number) {
    setSelectedRoutineId(routine.id)
    setEditingRoutineId(routine.id)
    setFormData(routineToDraft(routine))
    setActiveRegimenIndex(regimenIndex)
    setActiveTaskIndex(taskIndex)
    setShowCreateForm(false)
  }

  function selectRegimen(index: number) {
    setActiveRegimenIndex(index)
    setActiveTaskIndex(-1)
  }

  function addRegimen() {
    setFormData((current) => ({ ...current, regimens: [...current.regimens, emptyRegimen()] }))
    setActiveRegimenIndex(formData.regimens.length)
    setActiveTaskIndex(-1)
  }

  function duplicateRegimenAt(index: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.flatMap((item, i) => i === index ? [item, duplicateRegimenDraft(item)] : [item]),
    }))
    setActiveRegimenIndex(index + 1)
    setActiveTaskIndex(-1)
  }

  function removeRegimenAt(index: number) {
    setFormData((current) => ({ ...current, regimens: current.regimens.filter((_, i) => i !== index) }))
    setActiveRegimenIndex((current) => {
      if (current > index) return current - 1
      if (current === index) return Math.max(0, current - 1)
      return current
    })
    setActiveTaskIndex(0)
  }

  function addTaskToRegimen(regimenIndex: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.map((item, i) => i === regimenIndex ? { ...item, tasks: [...item.tasks, emptyTask()] } : item),
    }))
    setActiveRegimenIndex(regimenIndex)
    setActiveTaskIndex(formData.regimens[regimenIndex]?.tasks.length ?? 0)
  }

  function removeTaskFromRegimen(regimenIndex: number, taskIndex: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.map((item, i) => i === regimenIndex ? { ...item, tasks: item.tasks.filter((_, j) => j !== taskIndex) } : item),
    }))
    if (regimenIndex === activeRegimenIndex) {
      setActiveTaskIndex((current) => {
        if (current > taskIndex) return current - 1
        if (current === taskIndex) return Math.max(0, current - 1)
        return current
      })
    }
  }

  function duplicateTaskInRegimen(regimenIndex: number, taskIndex: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.map((item, i) => (
        i === regimenIndex
          ? {
              ...item,
              tasks: item.tasks.flatMap((task, j) => (
                j === taskIndex
                  ? [task, { ...task, title: task.title ? `${task.title} Copy` : task.title }]
                  : [task]
              )),
            }
          : item
      )),
    }))
    setActiveRegimenIndex(regimenIndex)
    setActiveTaskIndex(taskIndex + 1)
  }

  async function deleteRoutine(routineId: string) {
    const routine = routines.find((item) => item.id === routineId)
    const confirmed = window.confirm(
      `Are you sure you want to delete "${routine?.title || 'this routine'}"? This will remove all flows and tasks inside it.`,
    )
    if (!confirmed) return

    setDeletingRoutineId(routineId)
    try {
      await removeRoutine(routineId)
      setRoutines((current) => current.filter((routine) => routine.id !== routineId))
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : 'Failed to delete routine')
    } finally {
      setDeletingRoutineId(null)
    }
  }

  async function duplicateRoutine(routine: Routine) {
    setDuplicatingRoutineId(routine.id)
    try {
      const created = await createRoutine({
        ...routineToDraft(routine),
        name: `${routine.title} Copy`,
      })
      setRoutines((current) => [created, ...current])
    } catch (duplicateError) {
      alert(duplicateError instanceof Error ? duplicateError.message : 'Failed to duplicate routine')
    } finally {
      setDuplicatingRoutineId(null)
    }
  }

  async function saveInlineRoutine() {
    if (!editingRoutineId) return
    setIsSubmitting(true)
    const payload: RoutineInput = {
      ...formData,
      regimens: formData.regimens
        .map((regimen) => ({ ...regimen, tasks: regimen.tasks.filter((task) => task.title.trim()) }))
        .filter((regimen) => regimen.title.trim() && regimen.tasks.length > 0),
    }
    try {
      const updated = await updateRoutine(editingRoutineId, payload)
      setRoutines((current) => current.map((routine) => routine.id === editingRoutineId ? updated : routine))
      setFormData(routineToDraft(updated))
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : 'Failed to save routine')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitRoutine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const payload: RoutineInput = {
      ...formData,
      regimens: formData.regimens
        .map((regimen) => ({ ...regimen, tasks: regimen.tasks.filter((task) => task.title.trim()) }))
        .filter((regimen) => regimen.title.trim() && regimen.tasks.length > 0),
    }
    try {
      const data = editingRoutineId
        ? await updateRoutine(editingRoutineId, payload)
        : await createRoutine(payload)
      setRoutines((current) => editingRoutineId ? current.map((routine) => routine.id === editingRoutineId ? data : routine) : [data, ...current])
      closeBuilder()
    } catch (submitError) {
      alert(submitError instanceof Error ? submitError.message : `Failed to ${editingRoutineId ? 'update' : 'create'} routine`)
    } finally {
      setIsSubmitting(false)
    }
  }

  function renderBuilderDetailPanel(className: string, detailPanelRef?: RefObject<HTMLElement | null>) {
    if (!selectedRegimen) {
      return (
        <aside ref={detailPanelRef} className={className}>
          <div className="peridot-routines-editor-empty">
            Select a flow cell to shape that part of the routine.
          </div>
        </aside>
      )
    }

    return (
      <aside ref={detailPanelRef} className={className}>
        <div className="peridot-routines-editor-meta">{selectedTask ? 'TASK DETAIL' : 'FLOW DETAIL'}</div>
        <div className="peridot-live-detail-content">
          <div className="peridot-live-detail-header">
            <div>
              <div className="peridot-live-detail-time">{timeLabel(selectedPreviewTime)}</div>
              <h2 className="peridot-live-detail-title">
                {selectedTask
                  ? (selectedTask.title.trim() || `Task ${activeTaskIndex + 1}`)
                  : (selectedRegimen.title.trim() || `Flow ${activeRegimenIndex + 1}`)}
              </h2>
              {!selectedTask ? (
                <div className="peridot-live-detail-routine">
                  {formData.name.trim() || 'Untitled routine'}
                </div>
              ) : null}
            </div>
          </div>

          {!selectedTask ? (
            <div className="peridot-routines-editor-section">
              <div className="peridot-routines-editor-label">Flow</div>
              <p className="peridot-routines-builder-edit-note">Select a task tag to edit it, or use Add Task to add another task inside this flow.</p>
              <div className="peridot-routines-builder-command-shell">
                <PeridotCommandDeck
                  ariaLabel="Flow actions"
                  hubLabel="Flow"
                  className="peridot-routines-builder-command-deck"
                  topAction={{
                    label: 'Add',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: addRegimen,
                    variantClassName: 'is-add',
                  }}
                  leftAction={{
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => removeRegimenAt(activeRegimenIndex),
                    disabled: formData.regimens.length <= 1,
                    variantClassName: 'is-delete',
                  }}
                  rightAction={{
                    label: 'Duplicate',
                    icon: <Copy className="h-4 w-4" />,
                    onClick: () => duplicateRegimenAt(activeRegimenIndex),
                    variantClassName: 'is-duplicate',
                  }}
                />
              </div>
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Flow Title</label>
              <Input value={selectedRegimen.title} onChange={(event) => updateRegimen(activeRegimenIndex, { title: event.target.value })} className="peridot-control h-11" />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Flow Description</label>
              <Textarea value={selectedRegimen.description} onChange={(event) => updateRegimen(activeRegimenIndex, { description: event.target.value })} className="peridot-control min-h-[110px]" rows={3} />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Repeat</label>
              <select value={selectedRegimen.recurrenceType} onChange={(event) => updateRegimen(activeRegimenIndex, { recurrenceType: event.target.value, cadence: cadenceFromRepeat(event.target.value) })} className="peridot-control h-11 w-full px-3 outline-none">
                {recurrenceOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
              </select>
              <label className="mb-3 mt-5 block text-sm font-medium text-[#ffdf33]/90">Days Of Week</label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => {
                  const selected = selectedRegimen.recurrenceDays.includes(day)
                  return <button key={day} type="button" onClick={() => toggleRegimenDay(activeRegimenIndex, day)} className={`px-3 py-2 text-sm ${selected ? 'peridot-chip-active' : 'peridot-chip'}`}>{formatWeekday(day)}</button>
                })}
              </div>
              {selectedRegimen.recurrenceDays.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {selectedRegimen.recurrenceDays.map((day) => (
                    <div key={day}>
                      <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">{formatWeekday(day)}</label>
                      <Input type="time" value={selectedRegimen.recurrenceTimes[day] || '09:00'} onChange={(event) => updateRegimenTime(activeRegimenIndex, day, event.target.value)} className="peridot-control h-11" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="peridot-routines-editor-section">
              <div className="peridot-routines-editor-label">Task {activeTaskIndex + 1}</div>
              <p className="peridot-routines-builder-edit-note">{selectedTask.title.trim() || 'Give this task a title, notes, and reference media.'}</p>
              <div className="peridot-routines-builder-command-shell">
                <PeridotCommandDeck
                  ariaLabel="Task actions"
                  hubLabel="Task"
                  className="peridot-routines-builder-command-deck"
                  topAction={{
                    label: 'Add',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => addTaskToRegimen(activeRegimenIndex),
                    variantClassName: 'is-add',
                  }}
                  leftAction={{
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => removeTaskFromRegimen(activeRegimenIndex, activeTaskIndex),
                    disabled: selectedRegimen.tasks.length <= 1,
                    variantClassName: 'is-delete',
                  }}
                  rightAction={{
                    label: 'Duplicate',
                    icon: <Copy className="h-4 w-4" />,
                    onClick: () => duplicateTaskInRegimen(activeRegimenIndex, activeTaskIndex),
                    variantClassName: 'is-duplicate',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveTaskIndex(-1)}
                className="peridot-live-inline-button mt-4"
              >
                Back To Flow
              </button>
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Task Title</label>
              <Input value={selectedTask.title} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { title: event.target.value })} className="peridot-control h-11" />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Task Description</label>
              <Textarea value={selectedTask.description} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { description: event.target.value })} className="peridot-control min-h-[120px]" rows={4} />
              <div className="peridot-routines-editor-section">
                <div className="peridot-routines-editor-label">Reference Media</div>
                <p className="peridot-routines-builder-edit-note">Paste a YouTube, image, or supporting link for this task.</p>
                <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Reference URL</label>
                <Input value={selectedTask.referenceUrl} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { referenceUrl: event.target.value })} className="peridot-control h-11" />
                <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Reference Label</label>
                <Input value={selectedTask.referenceLabel} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { referenceLabel: event.target.value })} className="peridot-control h-11" />
                {selectedTask.referenceUrl.trim() ? <div className="mt-5"><ReferencePreview url={selectedTask.referenceUrl} label={selectedTask.referenceLabel} /></div> : null}
              </div>
            </div>
          )}
        </div>
      </aside>
    )
  }

  function renderLiveDetailPanel(className: string, detailPanelRef?: RefObject<HTMLElement | null>) {
    if (!(selectedRegimen && editingRoutineId)) {
      return (
        <aside ref={detailPanelRef} className={className}>
          <div className="peridot-routines-editor-empty">
            Select a flow cell to edit that routine and its selected task here.
          </div>
        </aside>
      )
    }

    return (
      <aside ref={detailPanelRef} className={className}>
        <div className="peridot-routines-editor-meta">{selectedTask ? 'TASK DETAIL' : 'FLOW DETAIL'}</div>
        <div className="peridot-live-detail-content">
          <div className="peridot-live-detail-header">
            <div>
              <div className="peridot-live-detail-time">{timeLabel(selectedPreviewTime)}</div>
              <h2 className="peridot-live-detail-title">
                {selectedTask
                  ? (selectedTask.title.trim() || `Task ${activeTaskIndex + 1}`)
                  : (selectedRegimen.title.trim() || `Flow ${activeRegimenIndex + 1}`)}
              </h2>
              {!selectedTask ? (
                <div className="peridot-live-detail-routine">
                  {formData.name || 'Untitled routine'}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="peridot-live-complete-button"
              onClick={() => void saveInlineRoutine()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Flow'}
            </button>
          </div>

          {!selectedTask ? (
            <div className="peridot-routines-editor-section">
              <div className="peridot-routines-editor-label">Flow</div>
              <p className="peridot-routines-builder-edit-note">Click a task tag in the selected flow on the left to edit that task.</p>
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Flow Title</label>
              <Input value={selectedRegimen.title} onChange={(event) => updateRegimen(activeRegimenIndex, { title: event.target.value })} className="peridot-control h-11" />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Flow Description</label>
              <Textarea value={selectedRegimen.description} onChange={(event) => updateRegimen(activeRegimenIndex, { description: event.target.value })} className="peridot-control min-h-[110px]" rows={3} />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Repeat</label>
              <select value={selectedRegimen.recurrenceType} onChange={(event) => updateRegimen(activeRegimenIndex, { recurrenceType: event.target.value, cadence: cadenceFromRepeat(event.target.value) })} className="peridot-control h-11 w-full px-3 outline-none">
                {recurrenceOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
              </select>
              <label className="mb-3 mt-5 block text-sm font-medium text-[#ffdf33]/90">Days Of Week</label>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => {
                  const selected = selectedRegimen.recurrenceDays.includes(day)
                  return <button key={day} type="button" onClick={() => toggleRegimenDay(activeRegimenIndex, day)} className={`px-3 py-2 text-sm ${selected ? 'peridot-chip-active' : 'peridot-chip'}`}>{formatWeekday(day)}</button>
                })}
              </div>
              {selectedRegimen.recurrenceDays.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {selectedRegimen.recurrenceDays.map((day) => (
                    <div key={day}>
                      <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">{formatWeekday(day)}</label>
                      <Input type="time" value={selectedRegimen.recurrenceTimes[day] || '09:00'} onChange={(event) => updateRegimenTime(activeRegimenIndex, day, event.target.value)} className="peridot-control h-11" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="peridot-routines-editor-section">
              <div className="peridot-routines-editor-label">Task {activeTaskIndex + 1}</div>
              <button
                type="button"
                onClick={() => setActiveTaskIndex(-1)}
                className="peridot-live-inline-button mt-4"
              >
                Back To Flow
              </button>
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Task Title</label>
              <Input value={selectedTask.title} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { title: event.target.value })} className="peridot-control h-11" />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Task Description</label>
              <Textarea value={selectedTask.description} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { description: event.target.value })} className="peridot-control min-h-[120px]" rows={4} />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Reference URL</label>
              <Input value={selectedTask.referenceUrl} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { referenceUrl: event.target.value })} className="peridot-control h-11" />
              <label className="mb-2 mt-5 block text-sm font-medium text-[#ffdf33]/90">Reference Label</label>
              <Input value={selectedTask.referenceLabel} onChange={(event) => updateTask(activeRegimenIndex, activeTaskIndex, { referenceLabel: event.target.value })} className="peridot-control h-11" />
              {selectedTask.referenceUrl.trim() ? <div className="mt-5"><ReferencePreview url={selectedTask.referenceUrl} label={selectedTask.referenceLabel} /></div> : null}
            </div>
          )}

          <div className="peridot-routines-editor-deck">
            {selectedTask ? (
              <PeridotCommandDeck
                ariaLabel="Task actions"
                hubLabel="Task"
                className="peridot-routine-command-deck--detail"
                topAction={{
                  label: 'Add',
                  icon: <Plus className="h-4 w-4" />,
                  onClick: () => addTaskToRegimen(activeRegimenIndex),
                  variantClassName: 'is-add',
                }}
                leftAction={{
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => removeTaskFromRegimen(activeRegimenIndex, activeTaskIndex),
                  disabled: selectedRegimen.tasks.length <= 1,
                  variantClassName: 'is-delete',
                }}
                rightAction={{
                  label: 'Duplicate',
                  icon: <Copy className="h-4 w-4" />,
                  onClick: () => duplicateTaskInRegimen(activeRegimenIndex, activeTaskIndex),
                  variantClassName: 'is-duplicate',
                }}
              />
            ) : (
              <PeridotCommandDeck
                ariaLabel="Flow actions"
                hubLabel="Flow"
                className="peridot-routine-command-deck--detail"
                topAction={{
                  label: 'Add',
                  icon: <Plus className="h-4 w-4" />,
                  onClick: addRegimen,
                  variantClassName: 'is-add',
                }}
                leftAction={{
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => removeRegimenAt(activeRegimenIndex),
                  disabled: formData.regimens.length <= 1,
                  variantClassName: 'is-delete',
                }}
                rightAction={{
                  label: 'Duplicate',
                  icon: <Copy className="h-4 w-4" />,
                  onClick: () => duplicateRegimenAt(activeRegimenIndex),
                  variantClassName: 'is-duplicate',
                }}
              />
            )}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <PeridotPageChrome>
      <div className="peridot-app-page peridot-shell peridot-analytics-page peridot-routines-page peridot-page-gutter overflow-x-hidden py-6 sm:py-8">
        <div className="peridot-stage-shell flex flex-col">
        <section className="peridot-routines-topline">
          <div className="peridot-eyebrow text-[11px] text-[#ffdf33]/42">Routines</div>
          <div className="mt-4 flex flex-col gap-2 text-[#ffdf33] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="peridot-routines-topline-label">[ALL ROUTINES]</div>
            </div>
            {!showCreateForm ? (
              <button type="button" onClick={openCreateRoutine} className="peridot-routines-topline-action">
                + Add Routine ++++++++++
              </button>
            ) : null}
          </div>
        </section>
        {showCreateForm ? (
          <section className="order-3 peridot-panel mb-8 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[rgba(102,255,153,0.14)] bg-[#040504] px-4 py-5 text-[#ffdf33] sm:px-8 sm:py-6">
              <div>
                <div className="peridot-eyebrow text-xs text-[#66ff99]">Builder</div>
                <h3 className="mt-1 text-xl font-semibold text-[#ffdf33] sm:text-2xl">{editingRoutineId ? 'Edit Routine' : 'Create Routine'}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66ff99]">Start with the routine details, then move flow by flow instead of editing one long page.</p>
              </div>
              <Button type="button" variant="ghost" onClick={closeBuilder} className="zune-button h-10 px-3 !text-[#ffdf33] hover:!text-[#ffdf33] [&_svg]:!text-[#ffdf33]"><X className="h-4 w-4 !text-[#ffdf33]" /></Button>
            </div>
            <form onSubmit={submitRoutine} className="space-y-8">
              <div className="grid gap-5 px-4 pt-5 sm:px-8 sm:pt-8 md:grid-cols-2">
                <div className="md:col-span-2 peridot-panel-soft p-5 sm:p-6">
                  <div className="mb-5">
                    <div className="peridot-section-label text-xs text-[#66ff99]">Routine</div>
                    <div className="mt-1 text-lg font-semibold text-[#ffdf33]">Core Identity</div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Routine Name</label>
                      <Input value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} className="peridot-control h-11" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Routine Description</label>
                      <Textarea value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} className="peridot-control min-h-[120px]" rows={4} />
                    </div>
                    <div className="max-w-sm">
                      <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Category</label>
                      <select value={formData.category} onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))} className="peridot-control h-11 w-full px-3 outline-none">{categories.map((category) => <option key={category} value={category}>{formatLabel(category)}</option>)}</select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-4 pb-5 sm:px-8 sm:pb-8">
                <div>
                  <div>
                    <h3 className="peridot-routines-flows-toggle is-active">Flows</h3>
                    <p className="mt-1 text-sm leading-6 text-[#ffdf33]/60">The builder now follows the same canvas layout as your routines. Select a flow or task tag below, then edit the matching detail above the preview.</p>
                  </div>
                </div>
                <div className="peridot-routines-live-shell peridot-routines-live-shell--builder">
                  <section className="peridot-routines-canvas">
                    <div className="peridot-routines-editor-meta">ROUTINE PREVIEW</div>
                    <div className="peridot-routines-canvas-title">{formData.name.trim() || 'Untitled routine'}</div>
                    {renderBuilderDetailPanel(
                      'peridot-routines-editor peridot-routines-editor--builder',
                      builderInlineDetailPanelRef,
                    )}
                    <div className="peridot-routines-flow-grid">
                      {formData.regimens
                        .map((regimen, regimenIndex) => ({ regimen, regimenIndex }))
                        .sort((a, b) => {
                          if (a.regimenIndex === activeRegimenIndex) return -1
                          if (b.regimenIndex === activeRegimenIndex) return 1
                          return a.regimenIndex - b.regimenIndex
                        })
                        .map(({ regimen, regimenIndex }) => {
                          const isSelected = regimenIndex === activeRegimenIndex

                          return (
                            <div
                              key={`builder-flow-${regimenIndex}`}
                              className={`peridot-routines-flow-cell${isSelected ? ' is-selected' : ''}`}
                            >
                              <BuilderFlowPreview
                                regimen={regimen}
                                regimenIndex={regimenIndex}
                                activeTaskIndex={isSelected ? activeTaskIndex : -1}
                                onSelectTask={(taskIndex) => {
                                  setActiveRegimenIndex(regimenIndex)
                                  setActiveTaskIndex(taskIndex)
                                }}
                                onSelectFlow={() => selectRegimen(regimenIndex)}
                                isEditingFlow={isSelected && activeTaskIndex < 0}
                                showDays
                              />
                            </div>
                          )
                        })}
                    </div>
                  </section>
                </div>
                {false ? formData.regimens.map((regimen, regimenIndex) => {
                  const isActiveFlow = regimenIndex === activeRegimenIndex
                  const titledTasks = countFilledDraftTasks(regimen.tasks)
                  const activeTask = regimen.tasks[activeTaskIndex] ?? null

                  return (
                  <div
                    key={regimenIndex}
                    className={`peridot-panel overflow-hidden p-5 transition-colors sm:p-6 peridot-routines-builder-flow${isActiveFlow ? ' is-active' : ''}`}
                  >
                    <div className="-mx-5 -mt-5 mb-5 border-b border-[rgba(102,255,153,0.12)] px-5 py-4 sm:-mx-6 sm:-mt-6 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <button type="button" onClick={() => selectRegimen(regimenIndex)} className="min-w-0 flex-1 text-left">
                        <div className="peridot-eyebrow text-[11px] text-[#66ff99]">Flow {regimenIndex + 1}</div>
                        <div className="mt-3 min-w-0">
                          <h4 className="text-lg font-semibold text-[#ffdf33]">{getDraftRegimenTitle(regimen, regimenIndex)}</h4>
                          <p className="mt-2 text-sm text-[#ffdf33]/55">{isActiveFlow ? 'Build this flow in the preview and edit the selected task beside it.' : getDraftRegimenDaySummary(regimen)}</p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#ffdf33]/38">{formatLabel(regimen.cadence)} · {titledTasks}/{regimen.tasks.length} titled</p>
                        </div>
                      </button>
                      <div className="grid grid-cols-2 gap-2 sm:w-[13.5rem]">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateRegimenAt(regimenIndex)}
                          className="peridot-routines-builder-action h-10 w-full px-3 !text-[#ffdf33] [&_svg]:!text-[#ffdf33]"
                        >
                          <Copy className="mr-2 h-4 w-4 !text-[#ffdf33]" />
                          Duplicate
                        </Button>
                        {formData.regimens.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => removeRegimenAt(regimenIndex)} className="peridot-routines-builder-action h-10 w-full px-3 !text-[#ffdf33] [&_svg]:!text-[#ffdf33]"><X className="mr-2 h-4 w-4 !text-[#ffdf33]" />Remove</Button> : <div />}
                      </div>
                    </div>
                    </div>
                    {isActiveFlow ? (<>
                    <div className="grid gap-6 xl:grid-cols-[minmax(18rem,28rem)_minmax(0,1fr)]">
                      <div className="peridot-routines-builder-edit">
                        <div className="peridot-routines-builder-edit-label">Build</div>
                        <div className="peridot-routines-builder-preview">
                          <BuilderFlowPreview
                            regimen={regimen}
                            regimenIndex={regimenIndex}
                            activeTaskIndex={activeTaskIndex}
                            onSelectTask={setActiveTaskIndex}
                          />
                        </div>
                        <p className="peridot-routines-builder-edit-note">Click a task tag in the preview to edit it. Add tasks to extend the stack.</p>
                        <Button type="button" variant="ghost" size="sm" onClick={() => addTaskToRegimen(regimenIndex)} className="peridot-routines-builder-action mt-4 h-10 px-4 !text-[#ffdf33] [&_svg]:!text-[#ffdf33]"><Plus className="mr-2 h-4 w-4 !text-[#ffdf33]" />Add Task</Button>
                      </div>
                      <div className="space-y-6">
                        <div className="peridot-routines-builder-edit">
                          <div className="peridot-routines-builder-edit-label">Flow Fields</div>
                          <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Flow Title</label><Input value={regimen.title} onChange={(event) => updateRegimen(regimenIndex, { title: event.target.value })} className="peridot-control h-11" /></div>
                            <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Flow Description</label><Textarea value={regimen.description} onChange={(event) => updateRegimen(regimenIndex, { description: event.target.value })} className="peridot-control min-h-[110px]" rows={3} /></div>
                            <div><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Repeat</label><select value={regimen.recurrenceType} onChange={(event) => updateRegimen(regimenIndex, { recurrenceType: event.target.value, cadence: cadenceFromRepeat(event.target.value) })} className="peridot-control h-11 w-full px-3 outline-none">{recurrenceOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></div>
                            <div className="md:col-span-2">
                              <label className="mb-3 block text-sm font-medium text-[#ffdf33]/90">Days Of Week</label>
                              <div className="flex flex-wrap gap-2">{weekdays.map((day) => { const selected = regimen.recurrenceDays.includes(day); return <button key={day} type="button" onClick={() => toggleRegimenDay(regimenIndex, day)} className={`px-3 py-2 text-sm ${selected ? 'peridot-chip-active' : 'peridot-chip'}`}>{formatWeekday(day)}</button> })}</div>
                            </div>
                          </div>
                        </div>
                        {regimen.recurrenceDays.length > 0 ? (
                          <div className="peridot-routines-builder-edit">
                            <div className="peridot-routines-builder-edit-label">Schedule</div>
                            <p className="peridot-routines-builder-edit-note">Set the time for each selected day. The calendar will place this flow there automatically.</p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                              {regimen.recurrenceDays.map((day) => (
                                <div key={day}>
                                  <label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">{formatWeekday(day)}</label>
                                  <Input type="time" value={regimen.recurrenceTimes[day] || '09:00'} onChange={(event) => updateRegimenTime(regimenIndex, day, event.target.value)} className="peridot-control h-11" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {activeTask ? (
                          <div className="peridot-routines-builder-edit">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="peridot-routines-builder-edit-label">Task {activeTaskIndex + 1}</div>
                                <p className="mt-2 text-sm text-[#ffdf33]/55">{activeTask.title.trim() || 'Give this task a title, notes, and reference media.'}</p>
                              </div>
                              {regimen.tasks.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => removeTaskFromRegimen(regimenIndex, activeTaskIndex)} className="peridot-routines-builder-action h-10 px-4 !text-[#ffdf33] [&_svg]:!text-[#ffdf33]"><X className="mr-2 h-4 w-4 !text-[#ffdf33]" />Remove Task</Button> : null}
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                              <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Task Title</label><Input value={activeTask.title} onChange={(event) => updateTask(regimenIndex, activeTaskIndex, { title: event.target.value })} className="peridot-control h-11" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Task Description</label><Textarea value={activeTask.description} onChange={(event) => updateTask(regimenIndex, activeTaskIndex, { description: event.target.value })} className="peridot-control min-h-[120px]" rows={4} /></div>
                              <div className="md:col-span-2 peridot-routines-builder-edit"><div className="peridot-routines-builder-edit-label">Reference Media</div><p className="peridot-routines-builder-edit-note">Paste a YouTube, image, or supporting link for this task.</p><div className="mt-4 grid gap-5 md:grid-cols-2"><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Reference URL</label><Input value={activeTask.referenceUrl} onChange={(event) => updateTask(regimenIndex, activeTaskIndex, { referenceUrl: event.target.value })} className="peridot-control h-11" /></div><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-[#ffdf33]/90">Reference Label</label><Input value={activeTask.referenceLabel} onChange={(event) => updateTask(regimenIndex, activeTaskIndex, { referenceLabel: event.target.value })} className="peridot-control h-11" /></div></div>{activeTask.referenceUrl.trim() ? <div className="mt-5"><ReferencePreview url={activeTask.referenceUrl} label={activeTask.referenceLabel} /></div> : null}</div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    </>) : null}
                  </div>
                  )
                }) : null}
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-[rgba(102,255,153,0.14)] px-4 py-4 sm:flex-row sm:justify-end sm:px-8"><Button type="button" variant="ghost" onClick={closeBuilder} className="zune-button h-11 px-4 !text-[#ffdf33] hover:!text-[#ffdf33] [&_svg]:!text-[#ffdf33]">Cancel</Button><Button type="submit" disabled={isSubmitting} className="peridot-accent-button h-11 px-4 font-semibold">{isSubmitting ? (editingRoutineId ? 'Saving...' : 'Creating...') : (editingRoutineId ? 'Save Routine' : 'Create Routine')}</Button></div>
            </form>
          </section>
        ) : null}
        {!showCreateForm ? (
        <>
        <div className="order-4">
        {isLoading ? (
          <div className="peridot-panel p-12 text-center text-[#ffdf33]/65">
            Loading routines...
          </div>
        ) : error ? (
          <div className="peridot-panel p-12 text-center">
            <p className="mb-6 text-[#ffdf33]/65">{error}</p>
            <Button onClick={() => void loadWorkspace()} className="peridot-routines-builder-action h-11 px-5 text-[#ffdf33]">
              Try Again
            </Button>
          </div>
        ) : visibleRoutines.length === 0 ? (
          <div className="peridot-panel p-12 text-center">
            <p className="mb-6 text-[#ffdf33]/65">Create your first routine, then shape the flows directly with the preview builder.</p>
            <Button onClick={openCreateRoutine} className="peridot-accent-button h-11 px-5 font-semibold">
              <Plus className="mr-2 h-5 w-5" />
              Create Routine
            </Button>
          </div>
        ) : (
          <div className="peridot-routines-live-shell">
            <section className="peridot-routines-canvas">
              <div className="peridot-routines-routine-strip">
                {visibleRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    type="button"
                    onClick={() => selectRoutine(routine)}
                    className={`peridot-routines-routine-button${activeRoutine?.id === routine.id ? ' is-selected' : ''}`}
                  >
                    [{routine.title}]
                  </button>
                ))}
              </div>
              {activeRoutine ? (
                <>
                  <div className="peridot-routines-canvas-header">
                    <div className="peridot-routines-canvas-header-main">
                      <div className="peridot-routines-canvas-title">
                        {(editingRoutineId === activeRoutine.id ? formData.name : activeRoutine.title) || activeRoutine.title}
                      </div>
                      <RoutineCommandDeck
                        className="peridot-routine-command-deck--header"
                        onEdit={() => openEditRoutine(activeRoutine)}
                        onDuplicate={() => void duplicateRoutine(activeRoutine)}
                        onDelete={() => void deleteRoutine(activeRoutine.id)}
                        isDuplicating={duplicatingRoutineId === activeRoutine.id}
                        isDeleting={deletingRoutineId === activeRoutine.id}
                      />
                    </div>
                  </div>
                </>
              ) : null}
              <div className="peridot-routines-flow-grid">
                {activeRoutine ? (
                  (editingRoutineId === activeRoutine.id ? formData.regimens : routineToDraft(activeRoutine).regimens)
                    .map((regimen, regimenIndex) => ({ regimen, regimenIndex }))
                    .sort((a, b) => {
                      if (a.regimenIndex === activeRegimenIndex) return -1
                      if (b.regimenIndex === activeRegimenIndex) return 1
                      return a.regimenIndex - b.regimenIndex
                    })
                    .map(({ regimen, regimenIndex }) => {
                  const isSelected = editingRoutineId === activeRoutine.id && activeRegimenIndex === regimenIndex
                  return (
                    <div
                      key={`${activeRoutine.id}-${regimenIndex}`}
                      className={`peridot-routines-flow-cell${isSelected ? ' is-selected' : ''}`}
                    >
                      {isSelected ? renderLiveDetailPanel(
                        'peridot-routines-editor peridot-routines-editor--inline',
                        liveInlineDetailPanelRef,
                      ) : null}
                      <BuilderFlowPreview
                        regimen={regimen}
                        regimenIndex={regimenIndex}
                        activeTaskIndex={isSelected ? activeTaskIndex : -1}
                        onSelectTask={(taskIndex) => selectFlowTask(activeRoutine, regimenIndex, taskIndex)}
                        onSelectFlow={() => selectFlowCell(activeRoutine, regimenIndex)}
                        isEditingFlow={isSelected && activeTaskIndex < 0}
                        showDays
                      />
                    </div>
                  )
                })) : null}
              </div>
            </section>

            {renderLiveDetailPanel('peridot-routines-editor peridot-routines-editor--desktop')}
          </div>
        )}
        </div>
        </>
        ) : null}
        </div>
      </div>
    </PeridotPageChrome>
  )
}

export default function RoutinesPage() {
  return (
    <Suspense fallback={null}>
      <RoutinesPageContent />
    </Suspense>
  )
}


