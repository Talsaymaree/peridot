'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
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

function clampRatio(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
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
  const activeRoutineCount = useMemo(() => routines.filter((routine) => routine.regimens.length > 0).length, [routines])
  const totalRegimens = useMemo(() => routines.reduce((sum, routine) => sum + routine.regimens.length, 0), [routines])
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
  const totalTasksToday = useMemo(() => todayRegimens.reduce((sum, regimen) => sum + regimen.taskCount, 0), [todayRegimens])
  const completedShare = totalTasksToday > 0 ? completedToday / totalTasksToday : 0
  const remainingShare = totalTasksToday > 0 ? remainingTasksToday / totalTasksToday : 0
  const summaryStats = [
    {
      label: 'Active Routines',
      value: activeRoutineCount,
      detail: totalRegimens === 1 ? '1 flow built' : `${totalRegimens} flows built`,
      ratio: clampRatio(activeRoutineCount / Math.max(routines.length || 1, 1)),
    },
    {
      label: 'Flows Today',
      value: todayRegimens.length,
      detail: totalTasksToday === 1 ? '1 task scheduled' : `${totalTasksToday} tasks scheduled`,
      ratio: clampRatio(todayRegimens.length / Math.max(totalRegimens || 1, 1)),
    },
    {
      label: 'Remaining',
      value: remainingTasksToday,
      detail: remainingTasksToday === 0 ? 'All clear' : 'still open',
      ratio: remainingTasksToday === 0 ? 0 : clampRatio(remainingShare),
    },
    {
      label: 'Completed',
      value: completedToday,
      detail: totalTasksToday === 0 ? 'No tasks today' : remainingTasksToday === 0 ? 'Day closed clean' : `${remainingTasksToday} still open`,
      ratio: clampRatio(completedShare),
    },
  ]

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame peridot-overview-grid">
          <section className="peridot-panel peridot-tactical-card mb-8 overflow-hidden">
            <div className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="max-w-2xl">
                <div className="peridot-eyebrow peridot-meta text-xs text-emerald-200/55">Dashboard</div>
                <h2 className="peridot-title-wrap peridot-display mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[3.5rem]">Welcome back, {displayName}.</h2>
                <p className="peridot-copy mt-4 max-w-xl text-sm text-white/62 sm:text-base">
                  Today&apos;s view is trimmed down to what needs attention now, with the rest one tap away.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button asChild className="h-11 rounded-2xl border border-emerald-300/25 bg-emerald-300 px-5 font-semibold text-emerald-950 hover:bg-emerald-200">
                    <a href="/routines">Open Routines</a>
                  </Button>
                  <Button variant="ghost" asChild className="h-11 rounded-2xl border border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">
                    <a href="/calendar">Open Calendar</a>
                  </Button>
                </div>
              </div>

              <section className="peridot-stat-board">
                <div className="peridot-meta text-[11px] text-white/45">Team Information</div>
                <h3 className="peridot-display mt-2 text-[2rem] leading-none text-white">Statistics</h3>
                <div className="peridot-stat-rule mt-3" />
                <div className="mt-5 space-y-4">
                  {summaryStats.map((stat) => {
                    const percent = isLoading ? '...' : String(Math.round(stat.ratio * 100)).padStart(3, '0')
                    const width = isLoading ? 0 : Math.max(0, Math.min(100, Math.round(stat.ratio * 100)))
                    return (
                      <div key={stat.label} className="peridot-stat-line">
                        <div className="flex items-center justify-between gap-3">
                          <div className="peridot-meta text-[10px] text-white/35">{stat.detail}</div>
                          <div className="peridot-display text-sm leading-none text-white/65">{percent}</div>
                        </div>
                        <div className="peridot-stat-track mt-2">
                          <div className="peridot-stat-fill" style={{ width: `${width}%` }} />
                          <div className="peridot-stat-notch" style={{ left: `${width}%` }} />
                          <div className="peridot-stat-name peridot-display">{stat.label}</div>
                          <div className="peridot-stat-value-badge peridot-display">{isLoading ? '...' : stat.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="peridot-panel peridot-tactical-card p-6 sm:p-7">
              <div className="mb-5">
                <div className="peridot-section-label peridot-meta text-xs text-white/45">Today</div>
                <h3 className="peridot-panel-heading peridot-display mt-2 text-2xl font-semibold text-white">Scheduled flows</h3>
                <p className="peridot-copy mt-3 max-w-xl text-sm text-white/58">
                  Keep this list narrow and scannable. Open the builder only when you need to edit structure.
                </p>
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
                    <div key={regimen.id} className="peridot-panel-soft peridot-tactical-card peridot-cinematic px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="peridot-section-label peridot-meta text-xs text-white/45">{regimen.routineTitle}</div>
                          <h4 className="peridot-panel-heading peridot-display mt-3 text-lg font-semibold leading-[1.18] text-white">{regimen.title}</h4>
                        </div>
                        <div className="peridot-meta rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] text-white/72">
                          {regimen.remainingTaskCount} left
                        </div>
                      </div>
                      <p className="peridot-copy mt-3 text-sm text-white/58">{regimen.taskCount} total task{regimen.taskCount === 1 ? '' : 's'} in this flow.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

              <div className="space-y-4">
                <div className="peridot-panel peridot-tactical-card p-6">
                  <div className="peridot-section-label peridot-meta text-xs text-white/45">Momentum</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="peridot-soft-inset peridot-tactical-card">
                      <div className="peridot-panel-value peridot-display text-3xl font-semibold text-white">{isLoading ? '...' : currentStreak}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/58">Current completion streak in days.</p>
                    </div>
                    <div className="peridot-soft-inset peridot-tactical-card">
                      <div className="peridot-panel-value peridot-display text-3xl font-semibold text-white">{isLoading ? '...' : totalCompleted}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/58">Tasks completed and saved to analytics.</p>
                    </div>
                  </div>
                </div>

                <div className="peridot-panel peridot-tactical-card p-6">
                  <a href="/routines" className="peridot-cinematic flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 text-white transition hover:bg-white/10">
                    <span className="peridot-display text-[1.05rem] leading-none">Refine routines when you&apos;re ready</span>
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
