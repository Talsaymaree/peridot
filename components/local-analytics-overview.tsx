'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { PeridotPageChrome } from '@/components/layout/peridot-page-chrome'
import { fetchAnalytics, subscribeToWorkspaceChanges } from '@/lib/workspace-client'
import type { AnalyticsSummary } from '@/lib/workspace-types'

const rangeLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const DESKTOP_ANALYTICS_CHART = {
  width: 960,
  height: 260,
  padding: {
    top: 48,
    right: 18,
    bottom: 28,
    left: 18,
  },
} as const

const MOBILE_ANALYTICS_CHART = {
  width: 640,
  height: 360,
  padding: {
    top: 52,
    right: 22,
    bottom: 40,
    left: 18,
  },
} as const

const RANGE_OPTIONS = [
  { id: 'week', label: 'Week', days: 7 },
  { id: 'month', label: 'Month', days: 30 },
  { id: 'year', label: 'Year', days: 365 },
  { id: 'all', label: 'All', days: null },
] as const

type RangeOption = (typeof RANGE_OPTIONS)[number]['id']

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatAverage(value: number) {
  if (!Number.isFinite(value)) {
    return '0.0'
  }

  return value.toFixed(1)
}

function useIsCompactViewport(maxWidth = 900) {
  const [isCompactViewport, setIsCompactViewport] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const updateViewport = (event?: MediaQueryListEvent) => {
      setIsCompactViewport(event ? event.matches : mediaQuery.matches)
    }

    updateViewport()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewport)
      return () => mediaQuery.removeEventListener('change', updateViewport)
    }

    mediaQuery.addListener(updateViewport)
    return () => mediaQuery.removeListener(updateViewport)
  }, [maxWidth])

  return isCompactViewport
}

function buildAnimatedChart(
  series: AnalyticsSummary['series'],
  peakValue: number,
  dimensions: {
    width: number
    height: number
    padding: {
      top: number
      right: number
      bottom: number
      left: number
    }
  },
  options?: {
    insetLeft?: number
    insetRight?: number
  },
) {
  const insetLeft = options?.insetLeft ?? 0
  const insetRight = options?.insetRight ?? 0
  const innerWidth = dimensions.width - dimensions.padding.left - dimensions.padding.right - insetLeft - insetRight
  const innerHeight = dimensions.height - dimensions.padding.top - dimensions.padding.bottom

  const points = series.map((item, index) => {
    const x =
      dimensions.padding.left +
      insetLeft +
      (series.length === 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth)
    const y =
      dimensions.padding.top +
      innerHeight -
      (item.total / peakValue) * innerHeight

    return {
      ...item,
      x,
      y,
    }
  })

  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const baselineY = dimensions.padding.top + innerHeight
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3
    return {
      y: dimensions.padding.top + ratio * innerHeight,
      value: Math.round((1 - ratio) * peakValue),
    }
  })

  return {
    points,
    linePath,
    baselineY,
    gridLines,
    segmentPaths: points.slice(1).map((point, index) => ({
      id: `${points[index].date}-${point.date}`,
      path: `M ${points[index].x} ${points[index].y} L ${point.x} ${point.y}`,
    })),
  }
}

function buildRangeSeries(series: AnalyticsSummary['series'], selectedRange: RangeOption, todayIso: string) {
  const selected = RANGE_OPTIONS.find((option) => option.id === selectedRange)
  const cappedSeries = series
    .filter((item) => item.date <= todayIso)
    .sort((left, right) => left.date.localeCompare(right.date))

  if (cappedSeries.length === 0) {
    return []
  }

  if (!selected || selected.days === null) {
    return cappedSeries
  }

  const totalsByDate = new Map(cappedSeries.map((item) => [item.date, item.total]))
  const endDate = new Date(`${todayIso}T12:00:00`)

  return Array.from({ length: selected.days }, (_, index) => {
    const date = addDays(endDate, index - (selected.days - 1))
    const dateIso = localIsoDate(date)

    return {
      date: dateIso,
      label: rangeLabelFormatter.format(date),
      total: totalsByDate.get(dateIso) ?? 0,
    }
  })
}

type AnalyticsMatrixChartProps = {
  title: string
  matrixLabel: string
  rangeLabel: string
  selectedRange: RangeOption
  series: AnalyticsSummary['series']
  emptyMessage: string
  isLoading?: boolean
  variant?: 'line' | 'bars'
  showControls?: boolean
  onSelectRange?: (range: RangeOption) => void
}

function AnalyticsMatrixChart({
  title,
  matrixLabel,
  rangeLabel,
  selectedRange,
  series,
  emptyMessage,
  isLoading = false,
  variant = 'line',
  showControls = false,
  onSelectRange,
}: AnalyticsMatrixChartProps) {
  const isCompactViewport = useIsCompactViewport()
  const chartMetrics = isCompactViewport ? MOBILE_ANALYTICS_CHART : DESKTOP_ANALYTICS_CHART
  const [hoveredChartPointDate, setHoveredChartPointDate] = useState<string | null>(null)
  const [touchedChartPointDate, setTouchedChartPointDate] = useState<string | null>(null)
  const touchTooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const barWidth = useMemo(() => {
    if (series.length === 0) {
      return 14
    }

    const innerWidth = chartMetrics.width - chartMetrics.padding.left - chartMetrics.padding.right
    return Math.max(12, Math.min(28, (innerWidth / series.length) * 0.58))
  }, [chartMetrics, series])
  const chartEdgeInset = useMemo(
    () => Math.max(26, Math.round(barWidth * 0.9 + 10)),
    [barWidth],
  )

  const animatedChart = useMemo(() => {
    if (series.length === 0) {
      return null
    }

    return buildAnimatedChart(
      series,
      Math.max(1, ...series.map((item) => item.total)),
      chartMetrics,
      variant === 'bars'
        ? {
            insetLeft: barWidth * 0.35,
            insetRight: chartEdgeInset,
          }
        : {
            insetRight: chartEdgeInset,
          },
    )
  }, [barWidth, chartEdgeInset, chartMetrics, series, variant])
  const lineGradientId = useMemo(
    () => `peridotAnalyticsLine-${matrixLabel.toLowerCase().replace(/\s+/g, '-')}`,
    [matrixLabel],
  )
  const barGradientId = useMemo(
    () => `peridotAnalyticsBar-${matrixLabel.toLowerCase().replace(/\s+/g, '-')}`,
    [matrixLabel],
  )

  const hasActivity = series.some((item) => item.total > 0)
  const activeChartPointDate = hoveredChartPointDate ?? touchedChartPointDate
  const rangeStartLabel =
    series.length > 0
      ? rangeLabelFormatter.format(new Date(`${series[0].date}T12:00:00`))
      : ''
  const rangeEndLabel =
    series.length > 0
      ? rangeLabelFormatter.format(new Date(`${series[series.length - 1].date}T12:00:00`))
      : ''

  useEffect(() => {
    setHoveredChartPointDate(null)
    setTouchedChartPointDate(null)
    if (touchTooltipTimeoutRef.current) {
      clearTimeout(touchTooltipTimeoutRef.current)
      touchTooltipTimeoutRef.current = null
    }
  }, [selectedRange, series])

  useEffect(() => {
    return () => {
      if (touchTooltipTimeoutRef.current) {
        clearTimeout(touchTooltipTimeoutRef.current)
      }
    }
  }, [])

  return (
    <section className="peridot-analytics-section peridot-analytics-section--chart">
      <div className="max-w-2xl">
        <h3 className="peridot-panel-heading text-2xl font-semibold text-[#ffdf33]">{title}</h3>
      </div>

      {showControls ? (
        <div className="peridot-analytics-chart-controls flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectRange?.(option.id)}
              className={`peridot-meta border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition ${
                selectedRange === option.id
                  ? 'border-[#66ff99]/24 bg-[#33b7db]/12 text-[#ffdf33]'
                  : 'border-[#33b7db]/18 bg-transparent text-[#66ff99]/55 hover:border-[#66ff99]/28 hover:text-[#ffdf33]/78'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="peridot-panel-deep peridot-analytics-chart-panel px-5 py-10 text-center text-[#ffdf33]/50">
          Loading analytics...
        </div>
      ) : series.length > 0 && animatedChart ? (
        <div className="peridot-panel-deep peridot-analytics-chart-panel p-4 sm:p-5">
          <div className="peridot-analytics-chart-board">
            <div className="peridot-analytics-chart-frame">
              <svg
                viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`}
                className="peridot-analytics-chart-svg"
                role="img"
                aria-label={`${title} chart`}
              >
                <defs>
                  <linearGradient id={lineGradientId} x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="-35%" stopColor="rgba(51,183,219,0.78)">
                      <animate attributeName="offset" values="-35%;65%;135%" dur="2.8s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="-12%" stopColor="rgba(255,223,51,0.98)">
                      <animate attributeName="offset" values="-12%;88%;158%" dur="2.8s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="18%" stopColor="rgba(51,183,219,0.78)">
                      <animate attributeName="offset" values="18%;118%;188%" dur="2.8s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                  <linearGradient id={barGradientId} x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,223,51,0.92)" />
                    <stop offset="100%" stopColor="rgba(102,255,153,0.22)" />
                  </linearGradient>
                </defs>

                {animatedChart.gridLines.map((line) => (
                  <g key={`${matrixLabel}-grid-${line.y}`}>
                    <line
                      x1={chartMetrics.padding.left}
                      y1={line.y}
                      x2={chartMetrics.width - chartMetrics.padding.right}
                      y2={line.y}
                      className="peridot-analytics-chart-grid-line"
                    />
                    <text
                      x={chartMetrics.width - chartMetrics.padding.right}
                      y={line.y - 6}
                      textAnchor="end"
                      className="peridot-analytics-chart-grid-label"
                    >
                      {line.value}
                    </text>
                  </g>
                ))}
                {variant === 'line' ? (
                  <>
                    <path d={animatedChart.linePath} className="peridot-analytics-chart-line-glow" />
                    <path d={animatedChart.linePath} className="peridot-analytics-chart-line" style={{ stroke: `url(#${lineGradientId})` }} />
                    {animatedChart.segmentPaths.map((segment, index) => (
                      <path
                        key={`${matrixLabel}-${segment.id}`}
                        d={segment.path}
                        className="peridot-analytics-chart-segment-beam"
                        style={{ animationDelay: `${2.6 + index * 0.16}s` }}
                      />
                    ))}
                  </>
                ) : (
                  animatedChart.points.map((point, index) => (
                    point.total > 0 ? (
                      <rect
                        key={`${matrixLabel}-bar-${point.date}`}
                        x={point.x - barWidth / 2}
                        y={point.y}
                        width={barWidth}
                        height={Math.max(animatedChart.baselineY - point.y, 4)}
                        rx="2"
                        className="peridot-analytics-chart-bar"
                        style={{ animationDelay: `${index * 90}ms`, fill: `url(#${barGradientId})` }}
                      />
                    ) : null
                  ))
                )}

                {animatedChart.points.map((point, index) => (
                  <g
                    key={`${matrixLabel}-${point.date}`}
                    className="peridot-analytics-chart-point-hit"
                    role="button"
                    tabIndex={0}
                    aria-label={`${rangeLabelFormatter.format(new Date(`${point.date}T12:00:00`))}: ${point.total}`}
                    onMouseEnter={() => setHoveredChartPointDate(point.date)}
                    onMouseLeave={() => setHoveredChartPointDate((current) => (current === point.date ? null : current))}
                    onFocus={() => setHoveredChartPointDate(point.date)}
                    onBlur={() => setHoveredChartPointDate((current) => (current === point.date ? null : current))}
                    onPointerDown={(event) => {
                      if (event.pointerType === 'mouse') {
                        return
                      }

                      if (touchTooltipTimeoutRef.current) {
                        clearTimeout(touchTooltipTimeoutRef.current)
                      }

                      setTouchedChartPointDate(point.date)
                      touchTooltipTimeoutRef.current = setTimeout(() => {
                        setTouchedChartPointDate((current) => (current === point.date ? null : current))
                        touchTooltipTimeoutRef.current = null
                      }, 1800)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setTouchedChartPointDate(point.date)
                      }
                    }}
                  >
                    {activeChartPointDate === point.date ? (
                      <g className="peridot-analytics-chart-point-label">
                        <rect
                          x={point.x - 34}
                          y={point.y - 36}
                          width="68"
                          height="18"
                          rx="2"
                          className="peridot-analytics-chart-point-label-box"
                        />
                        <text
                          x={point.x}
                          y={point.y - 23}
                          textAnchor="middle"
                          className="peridot-analytics-chart-point-label-text"
                        >
                          {rangeLabelFormatter.format(new Date(`${point.date}T12:00:00`))}
                        </text>
                      </g>
                    ) : null}
                    {variant === 'line' ? (
                      <>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="9"
                          className="peridot-analytics-chart-point-ring"
                          style={{ animationDelay: `${index * 120}ms` }}
                        />
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          className="peridot-analytics-chart-point"
                          style={{ animationDelay: `${index * 80}ms` }}
                        />
                      </>
                    ) : point.total > 0 ? (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        className="peridot-analytics-chart-point"
                        style={{ animationDelay: `${index * 80}ms` }}
                      />
                    ) : null}
                  </g>
                ))}
              </svg>

              <div className="peridot-analytics-chart-scan" aria-hidden="true" />
            </div>

            <div className="peridot-analytics-chart-readout">
              <span>{matrixLabel}</span>
              <strong>{selectedRange === 'all' ? 'ALL TIME' : `LAST ${rangeLabel.toUpperCase()}`}</strong>
            </div>

            <div className="peridot-analytics-chart-dates mt-4 text-[11px] uppercase tracking-[0.18em] text-[#ffdf33]/35">
              <span>{rangeStartLabel}</span>
              <span>{rangeEndLabel}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="peridot-panel-deep peridot-analytics-chart-panel border-dashed px-5 py-10 text-center text-[#ffdf33]/50">
          {emptyMessage}
        </div>
      )}
    </section>
  )
}

export function LocalAnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRange, setSelectedRange] = useState<RangeOption>('month')

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

  const todayIso = localIsoDate(new Date())
  const recentSeries = useMemo(
    () => buildRangeSeries(analytics?.series ?? [], selectedRange, todayIso),
    [analytics?.series, selectedRange, todayIso],
  )
  const recentFlowSeries = useMemo(
    () => buildRangeSeries(analytics?.flowSeries ?? [], selectedRange, todayIso),
    [analytics?.flowSeries, selectedRange, todayIso],
  )
  const recentRoutineSeries = useMemo(
    () => buildRangeSeries(analytics?.routineSeries ?? [], selectedRange, todayIso),
    [analytics?.routineSeries, selectedRange, todayIso],
  )
  const weekdayBreakdown = analytics?.weekdayBreakdown ?? []
  const topRegimens = analytics?.topRegimens ?? []
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
  const hasFlowActivity = topRegimens.length > 0
  const selectedRangeMeta = RANGE_OPTIONS.find((option) => option.id === selectedRange) ?? RANGE_OPTIONS[1]
  const rangeLabel = selectedRangeMeta.label
  const systemNodes = useMemo(() => {
    const positions = ['is-left', 'is-right', 'is-bottom'] as const

    return positions.map((position, index) => {
      const regimen = topRegimens[index]

      return {
        id: regimen?.regimenId ?? `system-node-${position}`,
        position,
        kicker: `Flow ${String(index + 1).padStart(2, '0')}`,
        title: regimen?.regimenTitle || `Standby ${index + 1}`,
        routine: regimen?.routineTitle || 'Awaiting completions',
        completedCount: regimen?.completedCount ?? 0,
        lastCompletedAt: regimen?.lastCompletedAt ?? null,
      }
    })
  }, [topRegimens])

  return (
    <PeridotPageChrome>
      <div className="peridot-app-page peridot-shell peridot-analytics-page peridot-page-gutter py-6 sm:py-8">
        <div className="peridot-analytics-shell">
          <section className="peridot-analytics-system">
            <div className="peridot-analytics-system-feed" aria-hidden="true">
              {Array.from({ length: 24 }, (_, index) => (
                <span key={`analytics-feed-${index}`} className="peridot-analytics-system-feed-node" />
              ))}
            </div>

            <div className="peridot-analytics-system-layout">
              <div className="peridot-analytics-system-side">
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">Completed Today</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : analytics?.totals.completedToday ?? 0}</div>
                </div>
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">Current Streak</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : analytics?.totals.currentStreak ?? 0}</div>
                </div>
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">This Week</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : analytics?.totals.completedThisWeek ?? 0}</div>
                </div>
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">All Time</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : analytics?.totals.totalCompleted ?? 0}</div>
                </div>
              </div>

              <div className="peridot-analytics-system-cluster-block">
                <div className="peridot-analytics-system-header">
                  <div className="peridot-analytics-system-kicker">Analytics System</div>
                  <div className="peridot-analytics-system-meta">
                    {selectedRange === 'all' ? 'FULL HISTORY' : `LAST ${rangeLabel.toUpperCase()}`}
                  </div>
                </div>

                <div className="peridot-analytics-system-cluster">
                  <div className="peridot-analytics-system-node-row">
                    {systemNodes.slice(0, 2).map((node) => (
                      <div key={node.id} className={`peridot-analytics-node ${node.position}`}>
                        <div className="peridot-analytics-node-shell">
                          <div className="peridot-analytics-node-kicker">{node.kicker}</div>
                          <div className="peridot-analytics-node-title">{node.title}</div>
                          <div className="peridot-analytics-node-routine">{node.routine}</div>
                        </div>
                        <div className="peridot-analytics-node-status">
                          {node.completedCount > 0 ? `${node.completedCount} DONE` : 'ONLINE'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="peridot-analytics-system-bottom">
                    <div className={`peridot-analytics-node ${systemNodes[2]?.position ?? 'is-bottom'}`}>
                      <div className="peridot-analytics-node-status">
                        {(systemNodes[2]?.completedCount ?? 0) > 0 ? `${systemNodes[2]?.completedCount ?? 0} DONE` : 'ONLINE'}
                      </div>
                      <div className="peridot-analytics-node-shell">
                        <div className="peridot-analytics-node-kicker">{systemNodes[2]?.kicker ?? 'Flow 03'}</div>
                        <div className="peridot-analytics-node-title">{systemNodes[2]?.title ?? 'Standby 3'}</div>
                        <div className="peridot-analytics-node-routine">{systemNodes[2]?.routine ?? 'Awaiting completions'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="peridot-analytics-system-chart-slot">
                {error ? null : (
                  <AnalyticsMatrixChart
                    title="Live chart"
                    matrixLabel="Task Matrix"
                    rangeLabel={rangeLabel}
                    selectedRange={selectedRange}
                    series={recentSeries}
                    emptyMessage="Mark a few tasks complete in the calendar and the momentum curve will come alive here."
                    isLoading={isLoading}
                    showControls
                    onSelectRange={setSelectedRange}
                  />
                )}
              </div>

              <div className="peridot-analytics-system-side is-right">
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">Strongest Day</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : strongestDay.day}</div>
                </div>
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">Avg Active Day</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : formatAverage(averagePerActiveDay)}</div>
                </div>
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">Recent Volume</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : recentCompleted}</div>
                </div>
                <div className="peridot-analytics-stat-cell peridot-analytics-stat-cell--rail">
                  <div className="peridot-analytics-stat-kicker">Active Days</div>
                  <div className="peridot-analytics-stat-value">{isLoading ? '...' : recentActiveDays}</div>
                </div>
              </div>
            </div>

          </section>

          {error ? (
            <div className="peridot-danger-note px-5 py-10 text-center text-[#ffdf33]/70">
              {error}
            </div>
          ) : (
              <section className="peridot-analytics-lower">
              <div className="peridot-analytics-lower-side">
                <div className="peridot-analytics-chart-stack">
                  <AnalyticsMatrixChart
                    title="Flow chart"
                    matrixLabel="Flow Matrix"
                    rangeLabel={rangeLabel}
                    selectedRange={selectedRange}
                    series={recentFlowSeries}
                    emptyMessage="Complete tasks across your flows and the daily flow matrix will render here."
                    isLoading={isLoading}
                  />

                  <AnalyticsMatrixChart
                    title="Routine chart"
                    matrixLabel="Routine Matrix"
                    rangeLabel={rangeLabel}
                    selectedRange={selectedRange}
                    series={recentRoutineSeries}
                    emptyMessage="Complete tasks across your routines and the daily routine matrix will render here."
                    isLoading={isLoading}
                    variant="bars"
                  />

                <section className="peridot-analytics-section peridot-analytics-section--flows">
                  <div className="mb-5">
                    <div className="peridot-section-label peridot-meta text-xs text-[#ffdf33]/45">Flow Momentum</div>
                    <h3 className="peridot-panel-heading peridot-display mt-2 text-2xl font-semibold text-[#ffdf33]">Top Flows</h3>
                  </div>

                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="peridot-panel-soft px-6 py-5 text-sm text-[#ffdf33]/50">
                        Loading flow activity...
                      </div>
                    ) : hasFlowActivity ? (
                      topRegimens.map((regimen, index) => (
                        <div key={regimen.regimenId} className="peridot-panel-soft px-6 py-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                <span className="peridot-meta mt-0.5 shrink-0 border border-[#33b7db]/20 bg-[#33b7db]/12 px-2.5 py-1 text-[10px] text-[#ffdf33]">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0">
                                  <div className="peridot-display text-[1.02rem] leading-[1.12] text-[#ffdf33]">
                                    {regimen.regimenTitle}
                                  </div>
                                  <div className="peridot-meta mt-2 text-[10px] text-[#ffdf33]/45">
                                    {regimen.routineTitle}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="min-w-[4rem] pl-4 text-right">
                              <div className="peridot-display text-[1.6rem] leading-none text-[#ffdf33]">
                                {regimen.completedCount}
                              </div>
                              <div className="peridot-meta mt-1 text-[10px] text-[#ffdf33]/45">Done</div>
                            </div>
                          </div>

                          <div className="mt-4 border border-[#33b7db]/10 bg-[#33b7db]/4 p-[3px]">
                            <div
                              className="h-3 bg-[linear-gradient(90deg,#33b7db,#66ff99)]"
                              style={{ width: `${Math.max((regimen.completedCount / peakRegimenValue) * 100, regimen.completedCount > 0 ? 16 : 0)}%` }}
                            />
                          </div>

                          <div className="peridot-meta mt-3 text-[10px] text-[#ffdf33]/45">
                            {regimen.lastCompletedAt
                              ? `Last completed ${rangeLabelFormatter.format(new Date(regimen.lastCompletedAt))}`
                              : 'No completion date yet'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="peridot-panel-soft border-dashed px-6 py-5 text-sm text-[#ffdf33]/50">
                        Flow rankings will appear once you start completing tasks.
                      </div>
                    )}
                  </div>
                </section>
                </div>
              </div>
              </section>
          )}
        </div>
      </div>
    </PeridotPageChrome>
  )
}


