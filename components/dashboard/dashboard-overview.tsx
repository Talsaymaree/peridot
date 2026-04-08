'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchCompletions,
  fetchWorkspace,
  subscribeToWorkspaceChanges,
} from '@/lib/workspace-client'

type Task = {
  id: string
  title: string
}

type Regimen = {
  id: string
  title: string
  recurrenceType: string | null
  recurrenceDays: string | null
  recurrenceTimes: string | null
  tasks: Task[]
}

type Routine = {
  id: string
  title: string
  regimens: Regimen[]
}

type FlowPreview = {
  id: string
  regimenId: string
  title: string
  startTime: string
  sortMinutes: number
  complete: boolean
}

type TodayTaskIndicator = {
  id: string
  taskId: string
  regimenId: string
  title: string
  sortMinutes: number
  sequence: number
  completed: boolean
}

const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const navLinks = [
  { label: 'BOARD', href: '/tasks' },
  { label: 'ROUTINES', href: '/routines' },
  { label: 'CALENDAR', href: '/calendar' },
  { label: 'ANALYTICS', href: '/analytics' },
  { label: 'SETTINGS', href: '/settings' },
]

function cleanLabel(value: string | null | undefined) {
  if (!value) return ''

  return value
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s*[-*]+\s*/gm, '')
    .trim()
}

function isoDate(date: Date) {
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

function regimenRunsToday(regimen: Regimen, date: Date) {
  const recurrenceType = regimen.recurrenceType || 'NONE'
  const recurrenceDays = regimen.recurrenceDays?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
  const weekday = weekdayMap[date.getDay()]

  if (recurrenceType === 'MONTHLY') return date.getDate() === 1
  if (recurrenceDays.length > 0) return recurrenceDays.includes(weekday)
  return recurrenceType === 'NONE'
}

function timeSortValue(value: string) {
  const [hoursText, minutesText] = value.split(':')
  const hours = Number(hoursText)
  const minutes = Number(minutesText ?? '0')

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 540
  return hours * 60 + minutes
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

function buildTodayFlows(routines: Routine[], date: Date, completedTaskKeys: Record<string, boolean>) {
  const weekday = weekdayMap[date.getDay()]

  return routines
    .flatMap((routine) =>
      routine.regimens.flatMap((regimen) => {
        if (!regimenRunsToday(regimen, date)) return []

        const recurrenceTimes = parseRecurrenceTimes(regimen.recurrenceTimes)
        const startTime = recurrenceTimes[weekday] || '09:00'
        const complete = regimen.tasks.length > 0 && regimen.tasks.every(
          (task) => completedTaskKeys[`${regimen.id}:${task.id}`] === true,
        )

        return [
          {
            id: `${routine.id}-${regimen.id}`,
            regimenId: regimen.id,
            title: cleanLabel(regimen.title) || cleanLabel(routine.title) || 'Routine Name',
            startTime,
            sortMinutes: timeSortValue(startTime),
            complete,
          },
        ]
      }),
    )
    .sort((left, right) => {
      if (left.sortMinutes !== right.sortMinutes) return left.sortMinutes - right.sortMinutes
      return left.title.localeCompare(right.title)
    })
}

function buildTodayTaskStats(routines: Routine[], date: Date, completedTaskKeys: Record<string, boolean>) {
  let total = 0
  let completed = 0

  for (const routine of routines) {
    for (const regimen of routine.regimens) {
      if (!regimenRunsToday(regimen, date)) continue

      total += regimen.tasks.length
      for (const task of regimen.tasks) {
        if (completedTaskKeys[`${regimen.id}:${task.id}`] === true) {
          completed += 1
        }
      }
    }
  }

  return {
    total,
    completed,
    open: Math.max(total - completed, 0),
  }
}

function buildTodayTaskIndicators(routines: Routine[], date: Date, completedTaskKeys: Record<string, boolean>) {
  const indicators: TodayTaskIndicator[] = []
  const weekday = weekdayMap[date.getDay()]
  let sequence = 0

  for (const routine of routines) {
    for (const regimen of routine.regimens) {
      if (!regimenRunsToday(regimen, date)) continue

      const recurrenceTimes = parseRecurrenceTimes(regimen.recurrenceTimes)
      const startTime = recurrenceTimes[weekday] || '09:00'

      for (const task of regimen.tasks) {
        indicators.push({
          id: `${regimen.id}:${task.id}`,
          taskId: task.id,
          regimenId: regimen.id,
          title: cleanLabel(task.title) || 'Untitled Task',
          sortMinutes: timeSortValue(startTime),
          sequence,
          completed: completedTaskKeys[`${regimen.id}:${task.id}`] === true,
        })
        sequence += 1
      }
    }
  }

  return indicators.sort((left, right) => {
    if (left.sortMinutes !== right.sortMinutes) return left.sortMinutes - right.sortMinutes
    return left.sequence - right.sequence
  })
}

function tagAngle(width: number) {
  return -(Math.atan2(48, width) * 180) / Math.PI
}

function FlowCluster({ flow }: { flow: FlowPreview }) {
  const tagWidth = Math.max(170, Math.min(340, 150 + flow.title.length * 7))
  const textX = tagWidth / 2
  const angle = tagAngle(tagWidth)
  const routineY = 62
  const timeLineWidth = 118
  const viewWidth = 118 + tagWidth + 28

  return (
    <Link
      href={`/calendar?date=${isoDate(new Date())}&regimen=${flow.regimenId}`}
      className="peridot-dashboard-cluster"
      style={{ width: `${viewWidth}px` }}
    >
      <svg className="peridot-dashboard-cluster-svg" viewBox={`0 0 ${viewWidth} 150`}>
        <text x="6" y="118" className="peridot-dashboard-time-label">{timeLabel(flow.startTime)}</text>
        <rect x="0" y="126" width={timeLineWidth} height="3" fill="#66ff99" />

        <g transform={`translate(118 ${routineY})`}>
          <polygon points={`0,48 ${tagWidth},0 ${tagWidth},32 0,80`} fill={flow.complete ? '#66ff99' : '#bd0000'} />
          <text
            x={textX}
            y="40"
            className={flow.complete ? 'peridot-dashboard-tag-text is-complete' : 'peridot-dashboard-tag-text'}
            transform={`rotate(${angle} ${textX} 40)`}
          >
            {flow.title.toUpperCase()}
          </text>
        </g>
      </svg>
    </Link>
  )
}

export function DashboardOverview() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [completedTaskKeys, setCompletedTaskKeys] = useState<Record<string, boolean>>({})
  const [username, setUsername] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const todayIso = isoDate(new Date())
        const [workspace, completions] = await Promise.all([
          fetchWorkspace(),
          fetchCompletions(todayIso),
        ])

        setUsername(workspace.profile.username)
        setRoutines(workspace.routines)
        setCompletedTaskKeys(
          Object.fromEntries(completions.map((item) => [`${item.regimenId}:${item.taskId}`, true])),
        )
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()

    return subscribeToWorkspaceChanges(() => {
      void loadDashboard()
    })
  }, [])

  const todayFlows = useMemo(
    () => buildTodayFlows(routines, new Date(), completedTaskKeys),
    [completedTaskKeys, routines],
  )
  const flowPreviews = todayFlows
  const displayName = (username || 'User Name').toUpperCase()
  const currentDateLabel = currentTime
    .toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    .toUpperCase()
  const activeFlowsToday = todayFlows.length
  const todayTaskStats = useMemo(
    () => buildTodayTaskStats(routines, new Date(), completedTaskKeys),
    [completedTaskKeys, routines],
  )
  const todayTaskIndicators = useMemo(
    () => buildTodayTaskIndicators(routines, new Date(), completedTaskKeys),
    [completedTaskKeys, routines],
  )
  const completedTasks = todayTaskStats.completed
  const allTodayTasksComplete = todayTaskStats.total > 0 && todayTaskStats.open === 0
  const todayIso = isoDate(new Date())

  return (
    <div className="peridot-dashboard-page">
      <div className="peridot-dashboard-frame">
        <div className="peridot-dashboard-main">
          <div className="peridot-dashboard-grid">
            <section className="peridot-dashboard-left">
              <div className="peridot-dashboard-identity">
                <div className="peridot-dashboard-identity-name">
                  {isLoading ? 'LOADING...' : displayName}
                </div>
                <div className="peridot-dashboard-identity-meta">{currentDateLabel}</div>
              </div>

              <nav className="peridot-dashboard-nav">
                {navLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="peridot-dashboard-nav-link">
                    [{item.label}]
                  </Link>
                ))}
              </nav>

              {error ? <div className="peridot-danger-note rounded-[0.55rem] px-4 py-3 text-sm">{error}</div> : null}
            </section>

            <section className="peridot-dashboard-right">
              <div className="peridot-dashboard-flows-title">FLOWS</div>

              <div className="peridot-dashboard-flows">
                {flowPreviews.length > 0 ? (
                  flowPreviews.map((flow) => <FlowCluster key={flow.id} flow={flow} />)
                ) : (
                  <div className="peridot-dashboard-empty">
                    {isLoading ? 'LOADING FLOWS...' : 'NO FLOWS SCHEDULED TODAY'}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="peridot-dashboard-metrics">
            <div className="peridot-dashboard-metric peridot-dashboard-metric--routines">
              <div className="peridot-dashboard-metric-meta">
                <Link href="/routines" className="peridot-dashboard-metric-label-link">
                  <div className="peridot-dashboard-metric-label">ACTIVE ROUTINES</div>
                </Link>
                <div className="peridot-dashboard-metric-count">ACTIVE TODAY {activeFlowsToday}</div>
              </div>
              <div className="peridot-dashboard-bars peridot-dashboard-bars--routines">
                {flowPreviews.length > 0 ? (
                  flowPreviews.map((flow) => (
                    <Link
                      key={flow.id}
                      href={`/calendar?date=${todayIso}&regimen=${flow.regimenId}`}
                      className={flow.complete
                        ? 'peridot-dashboard-bar is-green is-task-link'
                        : 'peridot-dashboard-bar is-red is-task-link'}
                      title={flow.title}
                    >
                      <span className="peridot-dashboard-bar-label">{flow.title.toUpperCase()}</span>
                    </Link>
                  ))
                ) : (
                  <div className="peridot-dashboard-empty peridot-dashboard-empty--metric">
                    {isLoading ? 'LOADING ROUTINES...' : 'NO ROUTINES SCHEDULED TODAY'}
                  </div>
                )}
              </div>
            </div>

            <div className="peridot-dashboard-metric peridot-dashboard-metric--tasks">
              <div className="peridot-dashboard-metric-meta">
                <Link href="/calendar" className="peridot-dashboard-metric-label-link">
                  <div className="peridot-dashboard-metric-label">TASKS</div>
                </Link>
                <div className={allTodayTasksComplete ? 'peridot-dashboard-alert is-complete' : 'peridot-dashboard-alert'}>
                  COMPLETED TODAY {completedTasks}
                </div>
              </div>
              <div className="peridot-dashboard-bars peridot-dashboard-bars--tasks">
                {todayTaskIndicators.length > 0 ? (
                  todayTaskIndicators.map((task) => (
                    <Link
                      key={task.id}
                      href={`/calendar?date=${todayIso}&regimen=${task.regimenId}&task=${task.taskId}`}
                      className={task.completed
                        ? 'peridot-dashboard-bar is-green is-task-link'
                        : 'peridot-dashboard-bar is-red is-blinking is-task-link'}
                      title={task.title}
                    >
                      <span className="peridot-dashboard-bar-label">{task.title.toUpperCase()}</span>
                    </Link>
                  ))
                ) : (
                  <div className="peridot-dashboard-empty peridot-dashboard-empty--metric">
                    {isLoading ? 'LOADING TASKS...' : 'NO TASKS SCHEDULED TODAY'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

