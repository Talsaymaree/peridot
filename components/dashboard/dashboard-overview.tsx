'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getRegimenTintMeta, tintRgba } from '@/lib/regimen-tints'
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
  colorTint: string | null
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
        const [workspace, analyticsResult, completions] = await Promise.all([
          fetchWorkspace(),
          fetchAnalytics(),
          fetchCompletions(todayIso),
        ])

        setUsername(workspace.profile.username)
        setRoutines(workspace.routines)
        setCompletedTaskKeys(
          Object.fromEntries(completions.map((item) => [`${item.regimenId}:${item.taskId}`, true])),
        )
        setAnalytics(analyticsResult)
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
  const activeRoutineCount = useMemo(() => routines.filter((routine) => routine.regimens.length > 0).length, [routines])
  const totalRegimens = useMemo(() => routines.reduce((sum, routine) => sum + routine.regimens.length, 0), [routines])
  const todayRegimens = useMemo(
    () =>
      routines.flatMap((routine) =>
        routine.regimens.filter(runsToday).map((regimen) => {
          const remainingTaskCount = regimen.tasks.filter((task) => completedTaskKeys[`${regimen.id}:${task.id}`] !== true).length
          return {
            id: regimen.id,
            title: regimen.title,
            routineTitle: routine.title,
            colorTint: regimen.colorTint,
            taskCount: regimen.tasks.length,
            remainingTaskCount,
          }
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
      tone: 'rgba(32, 42, 18, 0.92)',
    },
    {
      label: 'Flows Today',
      value: todayRegimens.length,
      detail: totalTasksToday === 1 ? '1 task scheduled' : `${totalTasksToday} tasks scheduled`,
      ratio: clampRatio(todayRegimens.length / Math.max(totalRegimens || 1, 1)),
      tone: 'rgba(45, 56, 24, 0.92)',
    },
    {
      label: 'Remaining',
      value: remainingTasksToday,
      detail: remainingTasksToday === 0 ? 'All clear' : 'still open',
      ratio: remainingTasksToday === 0 ? 0 : clampRatio(remainingShare),
      tone: 'rgba(58, 66, 28, 0.92)',
    },
    {
      label: 'Completed',
      value: completedToday,
      detail: totalTasksToday === 0 ? 'No tasks today' : remainingTasksToday === 0 ? 'Day closed clean' : `${remainingTasksToday} still open`,
      ratio: clampRatio(completedShare),
      tone: 'rgba(72, 82, 34, 0.92)',
    },
  ]

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame peridot-overview-grid">
          <section className="peridot-panel peridot-tactical-card mb-8 overflow-hidden">
            <div className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="max-w-2xl">
                <h2 className="peridot-title-wrap peridot-display text-3xl font-semibold tracking-tight text-white sm:text-[3.5rem]">Welcome back, {displayName}.</h2>
              </div>

              <section className="peridot-stat-board">
                <div className="peridot-stat-rule" />
                <div className="peridot-summary-grid mt-5">
                  {summaryStats.map((stat) => {
                    return (
                      <div
                        key={stat.label}
                        className="peridot-compact-card rounded-[1rem] border"
                        style={{
                          borderColor: 'rgba(159, 204, 59, 0.18)',
                          background:
                            'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(232,247,161,0.12)), linear-gradient(135deg, rgba(255,255,255,0.16), rgba(207,234,122,0.08))',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 pr-2">
                            <div className="peridot-meta text-[10px] text-[#7d8d4d]">{stat.label}</div>
                            <div className="peridot-display mt-3 text-[2.3rem] leading-none text-[#1d2710]">
                              {isLoading ? '...' : stat.value}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(31, 42, 16, 0.12)' }}>
                          <div
                            className="h-2.5 rounded-full"
                            style={{
                              width: `${Math.max(8, Math.round(stat.ratio * 100))}%`,
                              background: `linear-gradient(90deg, ${stat.tone}, rgba(159, 204, 59, 0.86))`,
                            }}
                          />
                        </div>
                        <div className="mt-3 px-1 text-[11px] uppercase tracking-[0.16em] text-[#6d7f3d]">{stat.detail}</div>
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
                <div className="grid gap-3 sm:grid-cols-2">
                  {todayRegimens.map((regimen) => {
                    const tint = getRegimenTintMeta(regimen.colorTint).value
                    const scheduleHref = `/calendar?date=${isoDate(new Date())}&regimen=${regimen.id}`

                    return (
                      <Link
                        key={regimen.id}
                        href={scheduleHref}
                        className="peridot-cinematic group block overflow-hidden rounded-[1.15rem] border p-3"
                        style={{
                          borderColor: tintRgba(tint, 0.44),
                          background: `linear-gradient(180deg, ${tintRgba(tint, 0.82)}, ${tintRgba(tint, 0.66)})`,
                          boxShadow: `inset 0 0 0 1px ${tintRgba(tint, 0.12)}, 0 14px 28px ${tintRgba(tint, 0.16)}`,
                        }}
                      >
                        <div className="rounded-[0.95rem] bg-white/[0.08] px-3 py-3.5">
                          <div className="min-w-0">
                            <div className="peridot-meta px-1 text-[10px] text-[#2f4419]">Scheduled now</div>
                            <div className="peridot-display mt-2 break-words px-1 pr-2 text-[0.88rem] leading-[1.18] text-[#17200e] transition group-hover:translate-x-0.5 sm:text-[0.95rem]">
                              {regimen.title}
                            </div>
                            <div className="peridot-meta mt-3 break-words px-1 pr-2 text-[10px] leading-[1.45] text-[#39531e]">{regimen.routineTitle}</div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-2 px-1">
                            <div className="rounded-[0.8rem] border px-3 py-2.5" style={{ borderColor: tintRgba(tint, 0.24), backgroundColor: 'rgba(255,255,255,0.18)' }}>
                              <div className="peridot-meta text-[10px] text-[#4a621f]">Tasks</div>
                              <div className="peridot-display mt-2 text-lg leading-none text-[#17200e]">{regimen.taskCount}</div>
                            </div>
                            <div className="rounded-[0.8rem] border px-3 py-2.5" style={{ borderColor: tintRgba(tint, 0.24), backgroundColor: 'rgba(255,255,255,0.18)' }}>
                              <div className="peridot-meta text-[10px] text-[#4a621f]">Left</div>
                              <div className="peridot-display mt-2 text-lg leading-none text-[#17200e]">{regimen.remainingTaskCount}</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button asChild className="peridot-display h-9 rounded-xl border border-emerald-300/25 bg-emerald-300 px-3 text-[0.8rem] font-semibold text-emerald-950 hover:bg-emerald-200 sm:h-10 sm:px-4 sm:text-sm">
                  <a href="/routines">Open Routines</a>
                </Button>
                <Button variant="ghost" asChild className="peridot-display h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-[0.8rem] text-white hover:bg-white/10 sm:h-10 sm:px-4 sm:text-sm">
                  <a href="/calendar">Open Calendar</a>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
