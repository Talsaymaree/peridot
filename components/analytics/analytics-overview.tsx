'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarCheck2, Flame, Layers3 } from 'lucide-react'

type AnalyticsSummary = {
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
  topRegimens: Array<{
    regimenId: string
    regimenTitle: string
    routineTitle: string
    completedCount: number
    lastCompletedAt: string | null
  }>
}

const completedFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadAnalytics() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/analytics', { cache: 'no-store' })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load analytics')
        }

        if (active) {
          setAnalytics(data)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load analytics')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadAnalytics()
    return () => { active = false }
  }, [])

  const peakSeriesValue = useMemo(
    () => Math.max(1, ...(analytics?.series.map((item) => item.total) ?? [0])),
    [analytics],
  )

  return (
    <div className="lg:pl-80">
      <div className="peridot-shell min-h-screen px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        <div className="mx-auto max-w-[1380px] space-y-6">
          <section className="peridot-panel overflow-hidden">
            <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 xl:grid-cols-[1.25fr_0.95fr]">
              <div className="max-w-3xl">
                <div className="peridot-eyebrow text-xs text-emerald-200/55">Analytics</div>
                <h2 className="peridot-title-wrap mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Completion history that actually sticks.
                </h2>
                <p className="peridot-copy mt-4 max-w-2xl text-sm text-white/62 sm:text-base">
                  Every task you finish from the calendar is now stored, tallied, and rolled into your activity trends.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/45">Completed Today</span>
                    <CalendarCheck2 className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="text-3xl font-semibold text-white">{isLoading ? '...' : analytics?.totals.completedToday ?? 0}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/45">Current Streak</span>
                    <Flame className="h-4 w-4 text-lime-200/80" />
                  </div>
                  <div className="text-3xl font-semibold text-white">{isLoading ? '...' : analytics?.totals.currentStreak ?? 0}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/45">This Week</span>
                    <Activity className="h-4 w-4 text-teal-200/80" />
                  </div>
                  <div className="text-3xl font-semibold text-white">{isLoading ? '...' : analytics?.totals.completedThisWeek ?? 0}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/45">All-Time Completed</span>
                    <Layers3 className="h-4 w-4 text-cyan-200/80" />
                  </div>
                  <div className="text-3xl font-semibold text-white">{isLoading ? '...' : analytics?.totals.totalCompleted ?? 0}</div>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
              {error}
            </div>
          ) : (
            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="peridot-panel p-6 sm:p-7">
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Past 7 Days</div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Completion trend</h3>
                </div>

                {isLoading ? (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
                    Loading analytics...
                  </div>
                ) : analytics && analytics.series.some((item) => item.total > 0) ? (
                  <div className="grid gap-4 sm:grid-cols-7">
                    {analytics.series.map((item) => (
                      <div key={item.date} className="peridot-panel-soft flex min-h-[18rem] flex-col justify-end gap-3 px-4 py-5">
                        <div className="mb-4 flex-1 rounded-[1.75rem] bg-white/[0.04] p-2.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-t from-emerald-300/90 via-lime-200/85 to-cyan-200/70 transition-[height]"
                            style={{ height: `${Math.max((item.total / peakSeriesValue) * 100, item.total > 0 ? 12 : 0)}%` }}
                          />
                        </div>
                        <div className="text-2xl font-semibold text-white">{item.total}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.16em] text-white/45">{item.label}</div>
                        <div className="mt-1 text-xs text-white/35">{completedFormatter.format(new Date(`${item.date}T12:00:00`))}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
                    Mark a few tasks complete in the calendar and your weekly trend will show up here.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="peridot-panel p-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Consistency</div>
                  <div className="mt-4 text-3xl font-semibold text-white">{isLoading ? '...' : analytics?.totals.activeDays ?? 0}</div>
                  <p className="mt-2 text-sm text-white/58">Days with at least one completed task saved in analytics.</p>
                </div>

                <div className="peridot-panel p-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/45">Top Flows</div>
                  <div className="mt-4 space-y-3">
                    {isLoading ? (
                      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">
                        Loading flow activity...
                      </div>
                    ) : analytics && analytics.topRegimens.length > 0 ? (
                      analytics.topRegimens.map((regimen) => (
                        <div key={regimen.regimenId} className="peridot-soft-inset">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-base font-semibold leading-[1.18] text-white">{regimen.regimenTitle}</div>
                              <div className="mt-1 text-sm text-white/50">{regimen.routineTitle}</div>
                            </div>
                            <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/75">
                              {regimen.completedCount}
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-white/38">
                            {regimen.lastCompletedAt
                              ? `Last completed ${completedFormatter.format(new Date(regimen.lastCompletedAt))}`
                              : 'No completion date yet'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">
                        Flow rankings will appear once you start completing tasks.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
