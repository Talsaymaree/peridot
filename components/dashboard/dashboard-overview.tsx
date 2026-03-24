'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, CheckSquare, Layers3 } from 'lucide-react'
import {
  fetchAnalytics,
  fetchCompletions,
  fetchWorkspace,
  subscribeToWorkspaceChanges,
} from '@/lib/workspace-client'
import type { AnalyticsSummary } from '@/lib/workspace-types'

type Task = {
  id: string
}

type Regimen = {
  id: string
  title: string
  recurrenceType: string | null
  recurrenceDays: string | null
  tasks: Task[]
}

type Routine = {
  id: string
  title: string
  regimens: Regimen[]
}

const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function runsToday(regimen: Regimen) {
  const today = weekdayMap[new Date().getDay()]
  const days = regimen.recurrenceDays?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
  if (days.length === 0) return regimen.recurrenceType === 'NONE' || !regimen.recurrenceType
  return days.includes(today)
}

export function DashboardOverview() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [completedTaskKeys, setCompletedTaskKeys] = useState<Record<string, boolean>>({})
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true)
      setError(null)

      try {
        const todayIso = isoDate(new Date())
        const [workspace, analytics, completions] = await Promise.all([
          fetchWorkspace(),
          fetchAnalytics(),
          fetchCompletions(todayIso),
        ])

        setUsername(workspace.profile.username)
        setRoutines(workspace.routines)
        setCompletedTaskKeys(
          Object.fromEntries(completions.map((item) => [`${item.regimenId}:${item.taskId}`, true])),
        )
        setAnalytics(analytics)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load routines')
      } finally {
        setIsLoading(false)
      }
    }

    void loadDashboard()

    return subscribeToWorkspaceChanges(() => {
      void loadDashboard()
    })
  }, [])

  const displayName = username || 'there'
  const completedToday = useMemo(() => Object.keys(completedTaskKeys).length, [completedTaskKeys])
  const totalCompleted = analytics?.totals.totalCompleted ?? 0
  const currentStreak = analytics?.totals.currentStreak ?? 0
  const todayRegimens = useMemo(
    () =>
      routines.flatMap((routine) =>
        routine.regimens.filter(runsToday).map((regimen) => {
          const remainingTaskCount = regimen.tasks.filter((task) => completedTaskKeys[`${regimen.id}:${task.id}`] !== true).length
          return { id: regimen.id, title: regimen.title, routineTitle: routine.title, taskCount: regimen.tasks.length, remainingTaskCount }
        }),
      ),
    [completedTaskKeys, routines],
  )
  const remainingTasksToday = useMemo(() => todayRegimens.reduce((sum, regimen) => sum + regimen.remainingTaskCount, 0), [todayRegimens])

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame">
          <section className="peridot-panel mb-8 overflow-hidden">
            <div className="grid gap-5 px-6 py-7 sm:px-8 sm:py-8 xl:grid-cols-[1.3fr_0.9fr]">
              <div className="max-w-3xl">
                <div className="peridot-eyebrow text-xs text-emerald-200/55">Peridot</div>
                <h2 className="peridot-title-wrap mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Welcome back, {displayName}.</h2>
                <p className="peridot-copy mt-4 max-w-2xl text-sm text-white/62 sm:text-base">
                  Keep your routines, flows, and task references in one place so you can follow the steps without guessing.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="h-11 rounded-2xl border border-emerald-300/25 bg-emerald-300 px-5 font-semibold text-emerald-950 hover:bg-emerald-200">
                    <a href="/routines">Open Routines</a>
                  </Button>
                  <Button variant="ghost" asChild className="h-11 rounded-2xl border border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">
                    <a href="/calendar">Open Calendar</a>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Routines</span>
                    <Layers3 className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : routines.length}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Flows Today</span>
                    <Calendar className="h-4 w-4 text-lime-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : todayRegimens.length}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Tasks Remaining Today</span>
                    <CheckSquare className="h-4 w-4 text-teal-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : remainingTasksToday}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Completed Today</span>
                    <CheckSquare className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : completedToday}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="peridot-panel p-6 sm:p-7">
              <div className="mb-5">
                <div className="peridot-section-label text-xs text-white/45">Today</div>
                <h3 className="peridot-panel-heading mt-2 text-2xl font-semibold text-white">Scheduled flows</h3>
              </div>

              {isLoading ? (
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">Loading your workspace...</div>
              ) : error ? (
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">{error}</div>
              ) : todayRegimens.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
                  No flows are scheduled for today yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayRegimens.map((regimen) => (
                    <div key={regimen.id} className="peridot-panel-soft px-5 py-5 sm:px-6">
                      <div className="peridot-section-label text-xs text-white/45">{regimen.routineTitle}</div>
                      <h4 className="peridot-panel-heading mt-3 text-lg font-semibold leading-[1.18] text-white">{regimen.title}</h4>
                      <p className="peridot-copy mt-3 text-sm text-white/58">{regimen.remainingTaskCount} remaining of {regimen.taskCount} task{regimen.taskCount === 1 ? '' : 's'} in this flow.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

              <div className="space-y-4">
                <div className="peridot-panel p-6">
                  <div className="peridot-section-label text-xs text-white/45">Momentum</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="peridot-soft-inset">
                      <div className="peridot-panel-value text-3xl font-semibold text-white">{isLoading ? '...' : currentStreak}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/58">Current completion streak in days.</p>
                    </div>
                    <div className="peridot-soft-inset">
                      <div className="peridot-panel-value text-3xl font-semibold text-white">{isLoading ? '...' : totalCompleted}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/58">Tasks completed and saved to analytics.</p>
                    </div>
                  </div>
                </div>

                <div className="peridot-panel p-6">
                  <a href="/routines" className="flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-white transition hover:bg-white/10">
                    <span>Go to routine builder</span>
                    <ArrowRight className="h-4 w-4 text-white/55" />
                  </a>
                </div>
              </div>
          </section>
        </div>
      </div>
    </div>
  )
}
