'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'
import {
  fetchCompletions,
  fetchWorkspace,
  saveTaskCompletion,
  subscribeToWorkspaceChanges,
} from '@/lib/workspace-client'
import type { CompletionItem, RoutineRecord, TaskRecord } from '@/lib/workspace-types'

type ScheduleTask = TaskRecord

type ScheduleEntry = {
  id: string
  regimenId: string
  routineId: string
  routineTitle: string
  title: string
  detail: string
  tasks: ScheduleTask[]
  startTime: string
  sortMinutes: number
}

type SelectedTaskRef = {
  entryId: string
  taskId: string | null
}

const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseIsoDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null

  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

function buildMonthGrid(date: Date) {
  const start = monthStart(date)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
  const leading = start.getDay()
  const trailing = 6 - end.getDay()
  const cells: Date[] = []

  for (let index = leading; index > 0; index -= 1) {
    cells.push(addDays(start, -index))
  }

  for (let day = 1; day <= end.getDate(); day += 1) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), day))
  }

  for (let index = 1; index <= trailing; index += 1) {
    cells.push(addDays(end, index))
  }

  return cells
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function cleanRichText(value: string | null | undefined) {
  if (!value) return ''
  return value
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function descriptionLines(value: string | null | undefined) {
  return cleanRichText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseRecurrenceTimes(value: string | null) {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed ? parsed as Record<string, string> : {}
  } catch {
    return {}
  }
}

function regimenRunsOnDate(regimen: RoutineRecord['regimens'][number], date: Date) {
  const recurrenceType = regimen.recurrenceType || 'NONE'
  const recurrenceDays = regimen.recurrenceDays?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
  const weekday = weekdayMap[date.getDay()]
  const dateIso = isoDate(date)

  if (recurrenceType === 'ONCE') return recurrenceDays.includes(dateIso)
  if (recurrenceType === 'MONTHLY') return date.getDate() === 1
  if (recurrenceDays.length > 0) return recurrenceDays.includes(weekday)
  return recurrenceType === 'NONE'
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

function timeSortValue(value: string) {
  const [hoursText, minutesText] = value.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText ?? '0')
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 540
  return hours * 60 + minutes
}

function buildEntries(routines: RoutineRecord[], date: Date) {
  const weekday = weekdayMap[date.getDay()]
  const dateIso = isoDate(date)

  return routines
    .flatMap((routine) =>
      routine.regimens.flatMap((regimen) => {
        if (!regimenRunsOnDate(regimen, date)) return []

        const recurrenceTimes = parseRecurrenceTimes(regimen.recurrenceTimes)
        const startTime = recurrenceTimes[dateIso] || recurrenceTimes[weekday] || Object.values(recurrenceTimes)[0] || '09:00'

        return [
          {
            id: `${routine.id}-${regimen.id}-${isoDate(date)}`,
            regimenId: regimen.id,
            routineId: routine.id,
            routineTitle: cleanRichText(routine.title),
            title: cleanRichText(regimen.title),
            detail: cleanRichText(regimen.description) || cleanRichText(routine.description) || '',
            tasks: regimen.tasks.map((task) => ({
              ...task,
              title: cleanRichText(task.title),
              description: cleanRichText(task.description),
            })),
            startTime,
            sortMinutes: timeSortValue(startTime),
          },
        ]
      }),
    )
    .sort((left, right) => {
      if (left.sortMinutes !== right.sortMinutes) {
        return left.sortMinutes - right.sortMinutes
      }
      return left.title.localeCompare(right.title)
    })
}

function completionKey(dateIso: string, regimenId: string, taskId: string) {
  return `${dateIso}:${regimenId}:${taskId}`
}

function applyCompletionItems(current: Record<string, boolean>, dateIso: string, items: CompletionItem[]) {
  const next = { ...current }

  for (const key of Object.keys(next)) {
    if (key.startsWith(`${dateIso}:`)) {
      delete next[key]
    }
  }

  for (const item of items) {
    next[completionKey(dateIso, item.regimenId, item.taskId)] = true
  }

  return next
}

function formatBracketDate(date: Date) {
  return dayFormatter.format(date).toUpperCase()
}

function getMediaType(url: string | null | undefined) {
  if (!url) return null
  const lower = url.toLowerCase()

  if (
    lower.includes('youtube.com/watch') ||
    lower.includes('youtu.be/') ||
    lower.includes('youtube.com/embed/') ||
    lower.includes('youtube.com/shorts/')
  ) {
    return 'youtube'
  }

  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/.test(lower)) {
    return 'image'
  }

  return 'link'
}

function getYoutubeVideoId(url: string) {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null
    }

    if (parsed.pathname.includes('/shorts/')) {
      return parsed.pathname.split('/shorts/')[1]?.split('/')[0] ?? null
    }

    if (parsed.searchParams.get('v')) {
      return parsed.searchParams.get('v')
    }

    if (parsed.pathname.includes('/embed/')) {
      return parsed.pathname.split('/embed/')[1]?.split('/')[0] ?? null
    }
  } catch {
    return null
  }

  return null
}

function getYoutubeEmbedUrl(url: string) {
  const id = getYoutubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

function TaskReference({ task }: { task: ScheduleTask }) {
  const mediaType = getMediaType(task.referenceUrl)

  if (!task.referenceUrl || !mediaType) return null

  if (mediaType === 'youtube') {
    const embedUrl = getYoutubeEmbedUrl(task.referenceUrl)
    if (!embedUrl) return null

    return (
      <div className="peridot-live-video-card">
        <div className="peridot-live-video-hud">
          <div className="peridot-live-video-kicker">REFERENCE VIDEO</div>
          <a
            href={task.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="peridot-live-video-link"
          >
            WATCH SOURCE
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div className="peridot-live-video-frame">
          <iframe
            src={`${embedUrl}?rel=0`}
            title={task.referenceLabel || task.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    )
  }

  if (mediaType === 'image') {
    return (
      <div className="peridot-live-reference-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={task.referenceUrl} alt={task.referenceLabel || task.title} className="peridot-live-reference-image" />
      </div>
    )
  }

  return (
    <a
      href={task.referenceUrl}
      target="_blank"
      rel="noreferrer"
      className="peridot-live-link-card"
    >
      <span>Open reference</span>
      <ExternalLink className="h-4 w-4" />
    </a>
  )
}

function tagAngle(width: number) {
  return -(Math.atan2(48, width) * 180) / Math.PI
}

function RoutineCluster({
  entry,
  isFlowSelected,
  selectedTaskId,
  completedTasks,
  onSelectFlow,
  onToggleFlow,
  onSelectTask,
  onToggleTask,
}: {
  entry: ScheduleEntry
  isFlowSelected: boolean
  selectedTaskId: string | null
  completedTasks: Record<string, boolean>
  onSelectFlow: (ref: SelectedTaskRef) => void
  onToggleFlow: (entry: ScheduleEntry, completed: boolean) => void
  onSelectTask: (ref: SelectedTaskRef) => void
  onToggleTask: (regimenId: string, taskId: string) => void
}) {
  const routineNaturalWidth = clamp(150 + entry.title.length * 7, 170, 340)
  const taskNaturalWidths = entry.tasks.map((task) => clamp(138 + task.title.length * 6, 160, 340))
  const sharedTagWidth = Math.max(routineNaturalWidth, ...taskNaturalWidths, 170)
  const widestTag = sharedTagWidth
  const timeLineWidth = 118
  const routineY = 62
  const taskStartY = 126
  const taskStep = 62
  const viewWidth = 118 + widestTag + 28
  const viewHeight = Math.max(248, taskStartY + Math.max(entry.tasks.length - 1, 0) * taskStep + 122)
  const routineTextX = sharedTagWidth / 2
  const routineAngle = tagAngle(sharedTagWidth)
  const verticalX = 118 + sharedTagWidth - 14
  const verticalStartY = 88
  const verticalEndY = taskStartY + Math.max(entry.tasks.length - 1, 0) * taskStep + 34
  const routineComplete = entry.tasks.length > 0 && entry.tasks.every((task) => completedTasks[task.id] === true)
  const routineClassName = [
    'peridot-live-tag',
    'is-routine',
    routineComplete ? 'is-complete' : '',
    isFlowSelected ? 'is-selected' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="peridot-live-cluster-shell" style={{ width: `${viewWidth}px` }}>
      <svg className="peridot-live-cluster-svg" viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
        <text x="6" y="118" className="peridot-live-time-value peridot-live-time-label">{timeLabel(entry.startTime)}</text>
        <rect x="0" y="126" width={timeLineWidth} height="3" fill="#66ff99" />
        <line x1={verticalX} y1={verticalStartY} x2={verticalX} y2={verticalEndY} stroke="#66ff99" strokeWidth="3" />

        <g
          transform={`translate(118 ${routineY})`}
          className="peridot-live-cluster-hit"
          role="button"
          tabIndex={0}
          onClick={() => onSelectFlow({ entryId: entry.id, taskId: null })}
          onDoubleClick={() => onToggleFlow(entry, !routineComplete)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelectFlow({ entryId: entry.id, taskId: null })
            }
          }}
        >
          <polygon
            points={`0,48 ${sharedTagWidth},0 ${sharedTagWidth},32 0,80`}
            className={routineClassName}
          />
          <text
            x={routineTextX}
            y="40"
            className={routineComplete ? 'peridot-static-cluster-routine is-complete' : 'peridot-static-cluster-routine'}
            transform={`rotate(${routineAngle} ${routineTextX} 40)`}
          >
            {entry.title}
          </text>
        </g>

        {entry.tasks.map((task, index) => {
          const taskWidth = sharedTagWidth
          const taskTextX = sharedTagWidth / 2
          const taskAngle = tagAngle(sharedTagWidth)
          const selected = selectedTaskId === task.id
          const completed = completedTasks[task.id] === true

          return (
            <g
              key={task.id}
              transform={`translate(118 ${taskStartY + index * taskStep})`}
              className="peridot-live-cluster-hit"
              role="button"
              tabIndex={0}
              onClick={() => onSelectTask({ entryId: entry.id, taskId: task.id })}
              onDoubleClick={() => onToggleTask(entry.regimenId, task.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectTask({ entryId: entry.id, taskId: task.id })
                }
              }}
            >
              <polygon
                points={`0,48 ${taskWidth},0 ${taskWidth},32 0,80`}
                className={completed ? 'peridot-live-tag is-complete' : selected ? 'peridot-live-tag is-selected' : 'peridot-live-tag'}
              />
              <text
                x={taskTextX}
                y="40"
                className={completed ? 'peridot-static-cluster-task is-complete' : 'peridot-static-cluster-task'}
                transform={`rotate(${taskAngle} ${taskTextX} 40)`}
              >
                {task.title}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function CalendarPageContent() {
  const searchParams = useSearchParams()
  const urlSelectionKey = searchParams.toString()
  const requestedDate = useMemo(() => parseIsoDate(searchParams.get('date')), [urlSelectionKey])
  const requestedRegimenId = useMemo(() => searchParams.get('regimen'), [urlSelectionKey])
  const requestedTaskId = useMemo(() => searchParams.get('task'), [urlSelectionKey])
  const [currentDate, setCurrentDate] = useState(() => requestedDate ?? new Date())
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(requestedDate ?? new Date()))
  const [routines, setRoutines] = useState<RoutineRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [selectedTaskRef, setSelectedTaskRef] = useState<SelectedTaskRef | null>(null)
  const [hasAppliedUrlSelection, setHasAppliedUrlSelection] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [hiddenRegimenIds, setHiddenRegimenIds] = useState<Record<string, boolean>>({})
  const inlineDetailPanelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    async function loadWorkspaceData() {
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

    void loadWorkspaceData()

    return subscribeToWorkspaceChanges((reason) => {
      if (reason === 'completion-updated') {
        return
      }

      void loadWorkspaceData()
    })
  }, [])

  useEffect(() => {
    const dateIso = isoDate(currentDate)

    async function loadCompletions() {
      setCompletionError(null)

      try {
        const items = await fetchCompletions(dateIso)
        setCompletedTasks((current) => applyCompletionItems(current, dateIso, items))
      } catch (loadError) {
        setCompletionError(loadError instanceof Error ? loadError.message : 'Failed to load task completions')
      }
    }

    void loadCompletions()

    return subscribeToWorkspaceChanges(() => {
      void loadCompletions()
    })
  }, [currentDate])

  useEffect(() => {
    setVisibleMonth(monthStart(currentDate))
  }, [currentDate])

  const currentIso = isoDate(currentDate)
  const todayIso = isoDate(new Date())
  const entries = useMemo(() => buildEntries(routines, currentDate), [routines, currentDate])
  const flowToggles = useMemo(
    () => entries.map((entry) => ({ regimenId: entry.regimenId, title: entry.title })),
    [entries],
  )
  const visibleEntries = useMemo(
    () => entries.filter((entry) => hiddenRegimenIds[entry.regimenId] !== true),
    [entries, hiddenRegimenIds],
  )
  const visibleMonthCells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth])
  const completionLookup = useMemo(() => {
    const lookup: Record<string, boolean> = {}

    for (const entry of entries) {
      for (const task of entry.tasks) {
        lookup[task.id] = completedTasks[completionKey(currentIso, entry.regimenId, task.id)] === true
      }
    }

    return lookup
  }, [completedTasks, currentIso, entries])

  useEffect(() => {
    setHasAppliedUrlSelection(false)
  }, [urlSelectionKey])

  useEffect(() => {
    if (hasAppliedUrlSelection) return

    if (requestedDate && currentIso !== isoDate(requestedDate)) {
      setCurrentDate(requestedDate)
      setVisibleMonth(monthStart(requestedDate))
      return
    }

    if (!requestedRegimenId && !requestedTaskId) {
      setHasAppliedUrlSelection(true)
      return
    }

    if (entries.length === 0) {
      if (!isLoading) {
        setHasAppliedUrlSelection(true)
      }
      return
    }

    const matchingEntry = entries.find((entry) => (
      (requestedRegimenId ? entry.regimenId === requestedRegimenId : true) &&
      (requestedTaskId ? entry.tasks.some((task) => task.id === requestedTaskId) : true)
    )) ?? null

    if (matchingEntry) {
      const matchingTask = requestedTaskId
        ? matchingEntry.tasks.find((task) => task.id === requestedTaskId) ?? null
        : null

      setSelectedTaskRef({
        entryId: matchingEntry.id,
        taskId: matchingTask?.id ?? null,
      })
    }

    setHasAppliedUrlSelection(true)
  }, [
    currentIso,
    entries,
    hasAppliedUrlSelection,
    isLoading,
    requestedDate,
    requestedRegimenId,
    requestedTaskId,
  ])

  useEffect(() => {
    if (visibleEntries.length === 0) {
      setSelectedTaskRef(null)
      return
    }

    if (!selectedTaskRef) {
      return
    }

    const selectedStillExists = visibleEntries.some((entry) => (
      entry.id === selectedTaskRef.entryId && (
        selectedTaskRef.taskId === null || entry.tasks.some((task) => task.id === selectedTaskRef.taskId)
      )
    ))

    if (!selectedStillExists) {
      setSelectedTaskRef(null)
    }
  }, [selectedTaskRef, visibleEntries])

  const selectedEntry = useMemo(
    () => visibleEntries.find((entry) => entry.id === selectedTaskRef?.entryId) ?? null,
    [selectedTaskRef, visibleEntries],
  )
  const selectedTask = useMemo(
    () => (selectedTaskRef?.taskId ? selectedEntry?.tasks.find((task) => task.id === selectedTaskRef.taskId) ?? null : null),
    [selectedEntry, selectedTaskRef],
  )

  useEffect(() => {
    if (!selectedTaskRef || typeof window === 'undefined') return
    if (!window.matchMedia('(max-width: 767px)').matches) return

    const detailPanel = inlineDetailPanelRef.current
    if (!detailPanel) return

    const animationFrame = window.requestAnimationFrame(() => {
      detailPanel.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [selectedTaskRef])

  async function setFlowCompletion(entry: ScheduleEntry, completed: boolean) {
    const keys = entry.tasks.map((task) => completionKey(currentIso, entry.regimenId, task.id))

    setCompletionError(null)
    setCompletedTasks((current) => {
      const next = { ...current }

      entry.tasks.forEach((task, index) => {
        const key = keys[index]
        if (completed) {
          next[key] = true
        } else {
          delete next[key]
        }
      })

      return next
    })

    try {
      await Promise.all(entry.tasks.map((task) => saveTaskCompletion({
        date: currentIso,
        regimenId: entry.regimenId,
        taskId: task.id,
        completed,
      })))
    } catch (saveError) {
      setCompletedTasks((current) => {
        const next = { ...current }

        entry.tasks.forEach((task, index) => {
          const key = keys[index]
          if (completed) {
            delete next[key]
          } else {
            next[key] = true
          }
        })

        return next
      })
      setCompletionError(saveError instanceof Error ? saveError.message : 'Failed to save task completion')
    }
  }

  async function toggleTaskCompletion(regimenId: string, taskId: string) {
    const key = completionKey(currentIso, regimenId, taskId)
    const nextCompleted = completedTasks[key] !== true

    setCompletionError(null)
    setCompletedTasks((current) => {
      const next = { ...current }

      if (nextCompleted) {
        next[key] = true
      } else {
        delete next[key]
      }

      return next
    })

    try {
      await saveTaskCompletion({
        date: currentIso,
        regimenId,
        taskId,
        completed: nextCompleted,
      })
    } catch (saveError) {
      setCompletedTasks((current) => {
        const next = { ...current }

        if (nextCompleted) {
          delete next[key]
        } else {
          next[key] = true
        }

        return next
      })
      setCompletionError(saveError instanceof Error ? saveError.message : 'Failed to save task completion')
    }
  }

  const selectedEntryCompleteCount = selectedEntry
    ? selectedEntry.tasks.filter((task) => completionLookup[task.id] === true).length
    : 0

  function renderDetailPanel(className: string) {
    const detailPanelRef = className.includes('peridot-live-detail-panel--inline') ? inlineDetailPanelRef : undefined

    return (
      <section ref={detailPanelRef} className={className}>
        <div className="peridot-live-detail-meta">{selectedTask ? 'TASK DETAIL' : selectedEntry ? 'FLOW DETAIL' : 'TASK DETAIL'}</div>

        {selectedEntry ? (
          <div className="peridot-live-detail-content">
            <div className="peridot-live-detail-header">
              <div>
                <div className="peridot-live-detail-time">{timeLabel(selectedEntry.startTime)}</div>
                <h2 className="peridot-live-detail-title">{selectedTask ? selectedTask.title : selectedEntry.title}</h2>
                {!selectedTask ? (
                  <div className="peridot-live-detail-routine">{selectedEntry.routineTitle}</div>
                ) : null}
              </div>

              <button
                type="button"
                className={`peridot-live-complete-button${selectedTask ? (completionLookup[selectedTask.id] ? ' is-complete' : '') : (selectedEntryCompleteCount === selectedEntry.tasks.length ? ' is-complete' : '')}`}
                onClick={() => (
                  selectedTask
                    ? toggleTaskCompletion(selectedEntry.regimenId, selectedTask.id)
                    : setFlowCompletion(selectedEntry, selectedEntryCompleteCount !== selectedEntry.tasks.length)
                )}
              >
                {selectedTask
                  ? (completionLookup[selectedTask.id] ? 'Completed' : 'Mark Complete')
                  : (selectedEntryCompleteCount === selectedEntry.tasks.length ? 'Completed' : 'Mark Complete')}
              </button>
            </div>

            {selectedTask ? <TaskReference task={selectedTask} /> : null}

            {!selectedTask && selectedEntry.detail ? (
              <p className="peridot-live-entry-description">{selectedEntry.detail}</p>
            ) : null}

            {selectedTask ? (
              descriptionLines(selectedTask.description).length > 0 ? (
                <div className="peridot-live-copy-block">
                  {descriptionLines(selectedTask.description).map((line, index) => (
                    <p key={`${selectedTask.id}-line-${index}`}>{line}</p>
                  ))}
                </div>
              ) : (
                <div className="peridot-live-copy-block is-empty">No task notes yet.</div>
              )
            ) : (
              <div className="peridot-live-copy-block">
                <p>{selectedEntry.tasks.length} tasks in this flow.</p>
                <p>{selectedEntryCompleteCount}/{selectedEntry.tasks.length} completed.</p>
              </div>
            )}

            <div className="peridot-live-detail-footer">
              {selectedEntryCompleteCount}/{selectedEntry.tasks.length} tasks completed
            </div>
          </div>
        ) : (
          <div className="peridot-live-detail-empty">Select a task to see notes and media here.</div>
        )}

        {completionError ? (
          <div className="peridot-live-error">{completionError}</div>
        ) : null}
      </section>
    )
  }

  function toggleFlowVisibility(regimenId: string) {
    setHiddenRegimenIds((current) => {
      const next = { ...current }

      if (next[regimenId]) {
        delete next[regimenId]
      } else {
        next[regimenId] = true
      }

      return next
    })
  }

  return (
    <PeridotPageChrome>
      <main className="peridot-static-calendar-page">
        <div className="peridot-static-calendar-frame">
          <div className="peridot-static-calendar-label">CALENDAR</div>

        <div className="peridot-static-calendar-ui">
          <button
            type="button"
            className="peridot-live-inline-button"
            onClick={() => setShowControls((current) => !current)}
          >
            [{formatBracketDate(currentDate)}]
          </button>
          <button
            type="button"
            className="peridot-live-inline-button"
            onClick={() => setShowControls((current) => !current)}
          >
            [{showControls ? 'HIDE MINI CAL' : 'SHOW MINI CAL'}]
          </button>
          <Link href="/routines" className="peridot-live-inline-link">
            + ADD ROUTINE +
          </Link>
        </div>

        {showControls ? (
          <div className="peridot-live-controls-panel">
            <div className="peridot-live-controls-header">
              <button
                type="button"
                className="peridot-live-control-icon"
                onClick={() => {
                  const today = new Date()
                  setCurrentDate(today)
                  setVisibleMonth(monthStart(today))
                }}
              >
                TODAY
              </button>
              <div className="peridot-live-controls-nav">
                <button
                  type="button"
                  className="peridot-live-control-icon"
                  onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="peridot-live-control-icon"
                  onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="peridot-live-controls-month">{monthFormatter.format(visibleMonth).toUpperCase()}</div>
            </div>

            <div className="peridot-live-calendar-mini">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
                <div key={`${label}-${index}`} className="peridot-live-mini-weekday">{label}</div>
              ))}

              {visibleMonthCells.map((date) => {
                const dateIso = isoDate(date)
                const isActive = dateIso === currentIso
                const isToday = dateIso === todayIso
                const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth()

                return (
                  <button
                    key={dateIso}
                    type="button"
                    onClick={() => {
                      setCurrentDate(date)
                      setShowControls(false)
                    }}
                    className={`peridot-live-mini-day${isActive ? ' is-active' : ''}${isToday ? ' is-today' : ''}${isOutsideMonth ? ' is-outside' : ''}`}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {flowToggles.length > 0 ? (
          <div className="peridot-live-flow-toggles">
            <div className="peridot-live-flow-toggles-label">Flows</div>
            <div className="peridot-live-flow-toggles-list">
              {flowToggles.map((flow) => {
                const isHidden = hiddenRegimenIds[flow.regimenId] === true

                return (
                  <button
                    key={flow.regimenId}
                    type="button"
                    onClick={() => toggleFlowVisibility(flow.regimenId)}
                    className={`peridot-live-flow-toggle${isHidden ? ' is-hidden' : ' is-active'}`}
                  >
                    [{flow.title || 'UNTITLED FLOW'}]
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="peridot-live-stage">
          {isLoading ? (
            <div className="peridot-live-status">Loading scheduled routines...</div>
          ) : error ? (
            <div className="peridot-live-status">{error}</div>
          ) : entries.length === 0 ? (
            <div className="peridot-live-status">No routines scheduled for this day yet.</div>
          ) : visibleEntries.length === 0 ? (
            <div className="peridot-live-status">All flows are hidden. Toggle one back on above.</div>
          ) : (
            <div className="peridot-live-cluster-board">
              {visibleEntries.map((entry) => (
                <Fragment key={entry.id}>
                  {selectedEntry?.id === entry.id ? renderDetailPanel('peridot-live-detail-panel peridot-live-detail-panel--inline') : null}
                  <RoutineCluster
                    entry={entry}
                    isFlowSelected={selectedTaskRef?.entryId === entry.id && selectedTaskRef.taskId === null}
                    selectedTaskId={selectedTaskRef?.entryId === entry.id ? selectedTaskRef.taskId : null}
                    completedTasks={completionLookup}
                    onSelectFlow={setSelectedTaskRef}
                    onToggleFlow={setFlowCompletion}
                    onSelectTask={setSelectedTaskRef}
                    onToggleTask={toggleTaskCompletion}
                  />
                </Fragment>
              ))}
            </div>
          )}

          {renderDetailPanel('peridot-live-detail-panel peridot-live-detail-panel--desktop')}
        </div>

        </div>
      </main>
    </PeridotPageChrome>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarPageContent />
    </Suspense>
  )
}

