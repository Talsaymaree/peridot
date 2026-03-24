'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, CheckSquare, Layers3, Search, SlidersHorizontal } from 'lucide-react'
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
  const topCategories = useMemo(
    () => routines.slice(0, 2).map((routine) => ({
      id: routine.id,
      title: routine.title,
      flowCount: routine.regimens.length,
      taskCount: routine.regimens.reduce((sum, regimen) => sum + regimen.tasks.length, 0),
    })),
    [routines],
  )

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-mock-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame">
          <section className="peridot-mock-card overflow-hidden rounded-[1.1rem] px-5 py-6 sm:px-7 sm:py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[2rem] font-semibold leading-none text-white sm:text-[2.35rem]">Hi {displayName}</h2>
                <p className="mt-2 text-sm text-[#ff9e84]">{remainingTasksToday} tasks pending</p>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
                <Layers3 className="h-5 w-5 text-white/75" />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="flex h-12 flex-1 items-center gap-3 rounded-full border border-white/8 bg-white/[0.04] px-4 text-white/38">
                <Search className="h-4 w-4" />
                <span className="text-sm">Search</span>
              </div>
              <Button type="button" className="peridot-mock-button h-12 w-12 rounded-full p-0">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-8">
              <div className="text-2xl font-semibold text-white">Categories</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {topCategories.map((category) => (
                  <div key={category.id} className="peridot-mock-subcard rounded-[0.95rem] p-5">
                    <div className="text-xl font-semibold text-white">{category.title}</div>
                    <div className="mt-2 text-sm text-white/55">{String(category.flowCount).padStart(2, '0')} flows</div>
                    <div className="mt-6 flex items-end justify-between">
                      <div className="h-20 w-20 rounded-[0.75rem] bg-[linear-gradient(180deg,rgba(207,234,122,0.25),rgba(255,125,103,0.1))]" />
                      <div className="text-sm text-white/58">{category.taskCount} tasks</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="text-2xl font-semibold text-white">Ongoing Task</div>
              <a href="/routines" className="text-sm font-medium text-[#ff9e84]">See all</a>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
              <div className="space-y-4">
                {todayRegimens.slice(0, 3).map((regimen) => {
                  const completeCount = regimen.taskCount - regimen.remainingTaskCount
                  const completion = regimen.taskCount > 0 ? Math.round((completeCount / regimen.taskCount) * 100) : 0

                  return (
                    <div key={regimen.id} className="peridot-mock-subcard rounded-[0.95rem] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xl font-semibold text-white">{regimen.title}</div>
                          <div className="mt-2 text-sm text-white/55">{regimen.routineTitle}</div>
                        </div>
                        <div className="rounded-full bg-[#ff816d] px-3 py-1 text-xs font-semibold text-white">
                          {regimen.remainingTaskCount} left
                        </div>
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex -space-x-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2d3441] bg-[#cfea7a] text-[11px] font-semibold text-[#223011]">P</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2d3441] bg-[#ffb38f] text-[11px] font-semibold text-[#40251d]">R</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2d3441] bg-[#8fd4ff] text-[11px] font-semibold text-[#1e3445]">T</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/58">
                            <Calendar className="h-4 w-4" />
                            {regimen.taskCount} total tasks
                          </div>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#cfea7a]/30 text-sm font-semibold text-[#cfea7a]">
                          {completion}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 content-start sm:grid-cols-2 xl:grid-cols-1">
                <div className="peridot-mock-subcard rounded-[0.95rem] p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Active Routines</span>
                    <Layers3 className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : routines.length}</div>
                </div>
                <div className="peridot-mock-subcard rounded-[0.95rem] p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Flows Today</span>
                    <Calendar className="h-4 w-4 text-lime-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : todayRegimens.length}</div>
                </div>
                <div className="peridot-mock-subcard rounded-[0.95rem] p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Tasks Remaining Today</span>
                    <CheckSquare className="h-4 w-4 text-teal-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : remainingTasksToday}</div>
                </div>
                <div className="peridot-mock-subcard rounded-[0.95rem] p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Completed Today</span>
                    <CheckSquare className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : completedToday}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="peridot-mock-card rounded-[1.1rem] p-6 sm:p-7">
              <div className="mb-5">
                <div className="peridot-section-label text-xs text-white/45">Today</div>
                <h3 className="peridot-panel-heading mt-2 text-2xl font-semibold text-white">Scheduled flows</h3>
                <p className="peridot-copy mt-3 max-w-xl text-sm text-white/58">
                  The highest-signal queue for today, without opening the full builder.
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
                    <div key={regimen.id} className="peridot-mock-subcard rounded-[0.95rem] px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="peridot-section-label text-xs text-white/45">{regimen.routineTitle}</div>
                          <h4 className="peridot-panel-heading mt-3 text-lg font-semibold leading-[1.18] text-white">{regimen.title}</h4>
                        </div>
                        <div className="rounded-full bg-[#ff816d] px-3 py-1 text-xs uppercase tracking-[0.16em] text-white">
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
                <div className="peridot-mock-card rounded-[1.1rem] p-6">
                  <div className="peridot-section-label text-xs text-white/45">Momentum</div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="peridot-mock-subcard rounded-[0.95rem] p-5">
                      <div className="peridot-panel-value text-3xl font-semibold text-white">{isLoading ? '...' : currentStreak}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/58">Current completion streak in days.</p>
                    </div>
                    <div className="peridot-mock-subcard rounded-[0.95rem] p-5">
                      <div className="peridot-panel-value text-3xl font-semibold text-white">{isLoading ? '...' : totalCompleted}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/58">Tasks completed and saved to analytics.</p>
                    </div>
                  </div>
                </div>

                <div className="peridot-mock-card rounded-[1.1rem] p-6">
                  <a href="/routines" className="flex items-center justify-between rounded-[0.95rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-white transition hover:bg-white/[0.08]">
                    <span>Refine routines when you&apos;re ready</span>
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
