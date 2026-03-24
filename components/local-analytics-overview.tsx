'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarCheck2, Flame, Layers3, Sparkles } from 'lucide-react'
import { fetchAnalytics, subscribeToWorkspaceChanges } from '@/lib/workspace-client'
import type { AnalyticsSummary } from '@/lib/workspace-types'

const completedFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const chartLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const LINE_CHART_WIDTH = 760
const LINE_CHART_HEIGHT = 260
const LINE_CHART_PADDING = {
  top: 16,
  right: 18,
  bottom: 24,
  left: 18,
}

function formatAverage(value: number) {
  if (!Number.isFinite(value)) {
    return '0.0'
  }

  return value.toFixed(1)
}

function buildChartPath(
  series: AnalyticsSummary['series'],
  peakSeriesValue: number,
) {
  const innerWidth = LINE_CHART_WIDTH - LINE_CHART_PADDING.left - LINE_CHART_PADDING.right
  const innerHeight = LINE_CHART_HEIGHT - LINE_CHART_PADDING.top - LINE_CHART_PADDING.bottom

  const points = series.map((item, index) => {
    const x =
      LINE_CHART_PADDING.left +
      (series.length === 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth)
    const y =
      LINE_CHART_PADDING.top +
      innerHeight -
      (item.total / peakSeriesValue) * innerHeight

    return {
      ...item,
      x,
      y,
    }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const baselineY = LINE_CHART_PADDING.top + innerHeight
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const areaPath = `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3
    return {
      y: LINE_CHART_PADDING.top + ratio * innerHeight,
      value: Math.round((1 - ratio) * peakSeriesValue),
    }
  })

  return {
    areaPath,
    gridLines,
    linePath,
    points,
  }
}

export function LocalAnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true)
      setError(null)

      try {
        setAnalytics(await fetchAnalytics())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load analytics')
      } finally {
        setIsLoading(false)
      }
    }

    void loadAnalytics()
    return subscribeToWorkspaceChanges(() => {
      void loadAnalytics()
    })
  }, [])

  const recentSeries = analytics?.series ?? []
  const weekdayBreakdown = analytics?.weekdayBreakdown ?? []
  const topRegimens = analytics?.topRegimens ?? []
  const peakSeriesValue = useMemo(
    () => Math.max(1, ...recentSeries.map((item) => item.total)),
    [recentSeries],
  )
  const peakWeekdayValue = useMemo(
    () => Math.max(1, ...weekdayBreakdown.map((item) => item.total)),
    [weekdayBreakdown],
  )
  const peakRegimenValue = useMemo(
    () => Math.max(1, ...topRegimens.map((item) => item.completedCount)),
    [topRegimens],
  )
  const recentCompleted = useMemo(
    () => recentSeries.reduce((sum, item) => sum + item.total, 0),
    [recentSeries],
  )
  const recentActiveDays = useMemo(
    () => recentSeries.filter((item) => item.total > 0).length,
    [recentSeries],
  )
  const averagePerActiveDay = useMemo(() => {
    if (!analytics?.totals.activeDays) {
      return 0
    }

    return analytics.totals.totalCompleted / analytics.totals.activeDays
  }, [analytics])
  const strongestDay = useMemo(() => {
    if (weekdayBreakdown.length === 0) {
      return { day: 'MON', label: 'Mon', total: 0 }
    }

    return weekdayBreakdown.reduce((best, current) =>
      current.total > best.total ? current : best,
    )
  }, [weekdayBreakdown])
  const chartData = useMemo(() => {
    if (recentSeries.length === 0) {
      return null
    }

    return buildChartPath(recentSeries, peakSeriesValue)
  }, [peakSeriesValue, recentSeries])
  const hasRecentActivity = recentSeries.some((item) => item.total > 0)
  const hasWeekdayActivity = weekdayBreakdown.some((item) => item.total > 0)
  const hasFlowActivity = topRegimens.length > 0
  const rangeStartLabel =
    recentSeries.length > 0
      ? chartLabelFormatter.format(new Date(`${recentSeries[0].date}T12:00:00`))
      : ''
  const rangeMiddleLabel =
    recentSeries.length > 0
      ? chartLabelFormatter.format(new Date(`${recentSeries[Math.floor((recentSeries.length - 1) / 2)].date}T12:00:00`))
      : ''
  const rangeEndLabel =
    recentSeries.length > 0
      ? chartLabelFormatter.format(new Date(`${recentSeries[recentSeries.length - 1].date}T12:00:00`))
      : ''

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-page-frame peridot-overview-grid">
          <section className="peridot-panel overflow-hidden">
            <div className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="max-w-2xl">
                <div className="peridot-eyebrow text-xs text-emerald-200/55">Analytics</div>
                <p className="peridot-copy mt-3 max-w-2xl text-sm text-white/62 sm:text-base">
                  A quieter read on your momentum, weekly rhythm, and strongest flows without turning the page into a wall of charts.
                </p>
              </div>

              <div className="peridot-summary-grid">
                <div className="peridot-panel-soft peridot-stat-card peridot-compact-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Completed Today</span>
                    <CalendarCheck2 className="h-4 w-4 text-emerald-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : analytics?.totals.completedToday ?? 0}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card peridot-compact-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">Current Streak</span>
                    <Flame className="h-4 w-4 text-lime-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : analytics?.totals.currentStreak ?? 0}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card peridot-compact-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">This Week</span>
                    <Activity className="h-4 w-4 text-teal-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : analytics?.totals.completedThisWeek ?? 0}</div>
                </div>
                <div className="peridot-panel-soft peridot-stat-card peridot-compact-card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="peridot-stat-label text-xs text-white/45">All-Time Completed</span>
                    <Layers3 className="h-4 w-4 text-cyan-200/80" />
                  </div>
                  <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{isLoading ? '...' : analytics?.totals.totalCompleted ?? 0}</div>
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
              {error}
            </div>
          ) : (
            <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-4">
                <div className="peridot-panel p-6 sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                      <div className="peridot-section-label text-xs text-white/45">Last 14 Days</div>
                      <h3 className="peridot-panel-heading mt-2 text-2xl font-semibold text-white">Momentum curve</h3>
                      <p className="peridot-copy mt-3 max-w-xl text-sm text-white/58">
                        The trend line keeps the signal visible without forcing you to read a dense dashboard.
                      </p>
                    </div>

                    {!isLoading ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem]">
                        <div className="peridot-soft-inset">
                          <div className="peridot-section-label text-[11px] text-white/40">14-Day Volume</div>
                          <div className="peridot-panel-value mt-3 text-2xl font-semibold text-white">{recentCompleted}</div>
                          <p className="peridot-copy mt-2 text-xs text-white/45">Tasks completed in your recent window.</p>
                        </div>
                        <div className="peridot-soft-inset">
                          <div className="peridot-section-label text-[11px] text-white/40">Active Days</div>
                          <div className="peridot-panel-value mt-3 text-2xl font-semibold text-white">{recentActiveDays}</div>
                          <p className="peridot-copy mt-2 text-xs text-white/45">Days in that window with at least one completion.</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {isLoading ? (
                    <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
                      Loading analytics...
                    </div>
                  ) : hasRecentActivity && chartData ? (
                    <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(110,231,183,0.14),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
                      <div className="overflow-hidden">
                        <div className="w-full">
                          <svg viewBox={`0 0 ${LINE_CHART_WIDTH} ${LINE_CHART_HEIGHT}`} className="h-auto w-full">
                            <defs>
                              <linearGradient id="peridot-analytics-area" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(110,231,183,0.34)" />
                                <stop offset="55%" stopColor="rgba(163,230,53,0.18)" />
                                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                              </linearGradient>
                              <linearGradient id="peridot-analytics-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6ee7b7" />
                                <stop offset="45%" stopColor="#bef264" />
                                <stop offset="100%" stopColor="#67e8f9" />
                              </linearGradient>
                            </defs>

                            {chartData.gridLines.map((line) => (
                              <g key={line.y}>
                                <line
                                  x1={LINE_CHART_PADDING.left}
                                  y1={line.y}
                                  x2={LINE_CHART_WIDTH - LINE_CHART_PADDING.right}
                                  y2={line.y}
                                  stroke="rgba(255,255,255,0.08)"
                                  strokeDasharray="5 8"
                                />
                                <text
                                  x={LINE_CHART_WIDTH - LINE_CHART_PADDING.right}
                                  y={line.y - 6}
                                  textAnchor="end"
                                  fill="rgba(255,255,255,0.38)"
                                  fontSize="11"
                                  letterSpacing="0.18em"
                                >
                                  {line.value}
                                </text>
                              </g>
                            ))}

                            <path d={chartData.areaPath} fill="url(#peridot-analytics-area)" />
                            <path
                              d={chartData.linePath}
                              fill="none"
                              stroke="url(#peridot-analytics-line)"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {chartData.points.map((point) => (
                              <g key={point.date}>
                                <circle cx={point.x} cy={point.y} r="7" fill="rgba(5,9,7,0.75)" />
                                <circle cx={point.x} cy={point.y} r="4" fill="#d9f99d" />
                              </g>
                            ))}
                          </svg>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/35">
                        <span>{rangeStartLabel}</span>
                        <span>{rangeMiddleLabel}</span>
                        <span>{rangeEndLabel}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">
                      Mark a few tasks complete in the calendar and the momentum curve will come alive here.
                    </div>
                  )}
                </div>

                <div className="peridot-panel p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="peridot-section-label peridot-meta text-xs text-white/45">By Weekday</div>
                      <h3 className="peridot-panel-heading peridot-display mt-2 text-2xl font-semibold text-white">Weekly rhythm</h3>
                    </div>
                    {!isLoading ? (
                      <div className="peridot-meta rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-[10px] text-emerald-100/80">
                        {strongestDay.total > 0 ? `${strongestDay.label} is strongest` : 'Waiting on activity'}
                      </div>
                    ) : null}
                  </div>

                  {isLoading ? (
                    <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/50">
                      Loading weekday rhythm...
                    </div>
                  ) : hasWeekdayActivity ? (
                    <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-black/[0.08] p-4 sm:p-5">
                      <div className="peridot-meta mb-4 text-[10px] text-white/35">Completion Density</div>
                      <div className="space-y-3">
                      {weekdayBreakdown.map((item) => (
                        <div key={item.day} className="grid grid-cols-[56px_1fr_36px] items-center gap-3">
                          <div className="peridot-display rounded-md border border-white/10 bg-white/[0.05] px-2 py-2 text-center text-[0.95rem] leading-none text-white/78">
                            {item.label.slice(0, 3).toUpperCase()}
                          </div>
                          <div className="relative overflow-hidden rounded-none border border-white/10 bg-[#2d2d2d]/90">
                            <div
                              className="h-8 bg-[linear-gradient(90deg,rgba(125,125,125,0.96),rgba(103,103,103,0.96))] transition-[width]"
                              style={{ width: `${Math.max((item.total / peakWeekdayValue) * 100, item.total > 0 ? 10 : 0)}%` }}
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,transparent_0,transparent_calc(100%-14px),rgba(35,35,35,0.95)_calc(100%-14px),rgba(35,35,35,0.95)_100%)]" />
                          </div>
                          <div className="peridot-display text-right text-[1.05rem] leading-none text-white/78">{item.total}</div>
                        </div>
                      ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/50">
                      Your weekday pattern will show once completions start stacking up.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="peridot-panel p-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-200/80" />
                    <div className="peridot-section-label text-xs text-white/45">Motivation Snapshot</div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="peridot-soft-inset">
                      <div className="peridot-section-label text-[11px] text-white/40">Active Days</div>
                      <div className="peridot-panel-value mt-3 text-3xl font-semibold text-white">{isLoading ? '...' : analytics?.totals.activeDays ?? 0}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/50">Days where you got at least one task over the line.</p>
                    </div>
                    <div className="peridot-soft-inset">
                      <div className="peridot-section-label text-[11px] text-white/40">Average Active Day</div>
                      <div className="peridot-panel-value mt-3 text-3xl font-semibold text-white">{isLoading ? '...' : formatAverage(averagePerActiveDay)}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/50">Average tasks completed on the days you showed up.</p>
                    </div>
                    <div className="peridot-soft-inset">
                      <div className="peridot-section-label text-[11px] text-white/40">Strongest Day</div>
                      <div className="peridot-panel-value mt-3 text-3xl font-semibold text-white">{isLoading ? '...' : strongestDay.label}</div>
                      <p className="peridot-copy mt-2 text-sm text-white/50">
                        {isLoading
                          ? 'Loading your best rhythm...'
                          : strongestDay.total > 0
                            ? `${strongestDay.total} completions have landed here so far.`
                            : 'No standout day yet.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="peridot-panel p-6">
                  <div className="mb-5">
                    <div className="peridot-section-label text-xs text-white/45">Flow Momentum</div>
                    <h3 className="peridot-panel-heading mt-2 text-2xl font-semibold text-white">Top flows</h3>
                    <p className="peridot-copy mt-3 text-sm text-white/58">
                      The flows below are carrying the most repeated action, which makes them your strongest habit anchors.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">
                        Loading flow activity...
                      </div>
                    ) : hasFlowActivity ? (
                      topRegimens.map((regimen, index) => (
                        <div key={regimen.regimenId} className="peridot-soft-inset">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/60">
                                  #{index + 1}
                                </span>
                                <div className="peridot-panel-heading text-base font-semibold leading-[1.18] text-white">{regimen.regimenTitle}</div>
                              </div>
                              <div className="peridot-copy mt-2 text-sm text-white/50">{regimen.routineTitle}</div>
                            </div>
                            <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/75">
                              {regimen.completedCount}
                            </div>
                          </div>

                          <div className="mt-4 rounded-full bg-white/[0.05] p-[3px]">
                            <div
                              className="h-3 rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-cyan-200"
                              style={{ width: `${Math.max((regimen.completedCount / peakRegimenValue) * 100, regimen.completedCount > 0 ? 16 : 0)}%` }}
                            />
                          </div>

                          <div className="peridot-copy mt-3 text-xs text-white/38">
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
