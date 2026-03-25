'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, ImageIcon, Plus, Video } from 'lucide-react'
import { darkenTint, getRegimenTint, tintRgba } from '@/lib/regimen-tints'
import {
  fetchCompletions,
  fetchWorkspace,
  saveTaskCompletion,
  subscribeToWorkspaceChanges,
} from '@/lib/workspace-client'

type Task = {
  id: string
  title: string
  description: string | null
  status?: string | null
  referenceUrl?: string | null
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
  regimens: Regimen[]
}

type ScheduleEntry = {
  id: string
  regimenId: string
  routineTitle: string
  title: string
  detail: string
  taskCount: number
  tasks: Task[]
  startTime: string
  hourIndex: number
}

type CompletionItem = {
  regimenId: string
  taskId: string
  completedAt: string
}

type RegimenLayer = {
  id: string
  title: string
  routineTitle: string
  tint: string
  color: {
    dot: string
    chipBg: string
    chipText: string
    border: string
    bg: string
    softBg: string
    completeBg: string
    completeBorder: string
    accent: string
    accentGlow: string
    layerBg: string
    accentText: string
    accentSoft: string
    taskBg: string
    taskDoneBg: string
    taskPanelBg: string
  }
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthLabelFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
const dayLabelFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const hourSlots = Array.from({ length: 24 }, (_, hour) => {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
})
const hourHeight = 40
function makeRegimenTheme(colorTint: string | null | undefined) {
  const tint = getRegimenTint(colorTint)
  const darkerTint = darkenTint(tint, 0.24)
  return {
    dot: tint,
    chipBg: `linear-gradient(135deg, ${tintRgba(tint, 0.92)}, ${tintRgba(darkerTint, 0.94)})`,
    chipText: '#FEFFF7',
    border: tintRgba(tint, 0.88),
    bg: `linear-gradient(135deg, ${tintRgba(tint, 0.64)}, ${tintRgba(darkerTint, 0.42)})`,
    softBg: `linear-gradient(160deg, ${tintRgba(tint, 0.78)}, ${tintRgba(darkerTint, 0.52)})`,
    completeBg: `linear-gradient(135deg, ${tintRgba(darkerTint, 0.82)}, ${tintRgba(tint, 0.56)})`,
    completeBorder: tintRgba(darkerTint, 0.92),
    accent: tint,
    accentGlow: tintRgba(tint, 0.34),
    layerBg: `linear-gradient(135deg, ${tintRgba(tint, 0.44)}, ${tintRgba(darkerTint, 0.28)})`,
    accentText: '#30451B',
    accentSoft: tintRgba(darkerTint, 0.14),
    taskBg: `linear-gradient(180deg, ${tintRgba(tint, 0.14)}, ${tintRgba(darkerTint, 0.1)})`,
    taskDoneBg: `linear-gradient(180deg, ${tintRgba(tint, 0.22)}, ${tintRgba(darkerTint, 0.18)})`,
    taskPanelBg: tintRgba(darkerTint, 0.08),
  }
}

const fallbackRegimenTheme = makeRegimenTheme(null)

function progressPillTheme(completed: number, total: number) {
  if (total > 0 && completed === total) {
    return {
      bg: 'rgba(92, 146, 38, 0.82)',
      border: 'rgba(181, 227, 122, 0.68)',
      text: '#F6FFE7',
    }
  }

  if (completed > 0) {
    return {
      bg: 'rgba(189, 132, 26, 0.84)',
      border: 'rgba(255, 221, 126, 0.68)',
      text: '#FFF8DD',
    }
  }

  return {
    bg: 'rgba(165, 58, 40, 0.84)',
    border: 'rgba(246, 152, 127, 0.62)',
    text: '#FFE8E1',
  }
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function isoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildMonthGrid(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const leading = firstDay.getDay()
  const trailing = 6 - lastDay.getDay()
  const cells: Date[] = []

  for (let index = leading; index > 0; index -= 1) cells.push(addDays(firstDay, -index))
  for (let day = 1; day <= lastDay.getDate(); day += 1) cells.push(new Date(year, month, day))
  for (let index = 1; index <= trailing; index += 1) cells.push(addDays(lastDay, index))

  return cells
}

function buildYearOptions(centerYear: number) {
  return Array.from({ length: 11 }, (_, index) => centerYear - 5 + index)
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

function hourIndexFromTime(value: string) {
  const [hoursText] = value.split(':')
  const hours = Number(hoursText)
  return Number.isNaN(hours) ? 9 : Math.min(Math.max(hours, 0), 23)
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

function getMediaType(url: string | null | undefined) {
  if (!url) return null
  const lower = url.toLowerCase()
  if (
    lower.includes('youtube.com/watch') ||
    lower.includes('youtu.be/') ||
    lower.includes('youtube.com/embed/') ||
    lower.includes('youtube.com/shorts/')
  ) return 'youtube'
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/.test(lower)) return 'image'
  return 'link'
}

function getYoutubeEmbedUrl(url: string) {
  const id = getYoutubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
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
    if (parsed.searchParams.get('v')) return parsed.searchParams.get('v')
    if (parsed.pathname.includes('/embed/')) return parsed.pathname.split('/embed/')[1]?.split('/')[0] ?? null
  } catch {
    return null
  }
  return null
}

function descriptionLines(value: string | null | undefined) {
  return cleanRichText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function estimateTaskCardHeight(task: Task) {
  const lineCount = descriptionLines(task.description).length
  const descriptionHeight = lineCount > 0 ? 72 + lineCount * 28 : 0
  const mediaType = getMediaType(task.referenceUrl)
  const mediaHeight =
    mediaType === 'youtube' ? 560
      : mediaType === 'image' ? 320
        : mediaType === 'link' ? 76
          : 0

  return 96 + descriptionHeight + mediaHeight
}

function estimateExpandedEntryHeight(entry: ScheduleEntry) {
  const taskHeights = entry.tasks.reduce((sum, task) => sum + estimateTaskCardHeight(task), 0)
  const gaps = Math.max(entry.tasks.length - 1, 0) * 12
  return Math.max(220, 148 + taskHeights + gaps)
}

function entryTopOffset(entry: ScheduleEntry, index: number) {
  return entry.hourIndex * hourHeight + 8 + index * 12
}

function regimenRunsOnDate(regimen: Regimen, date: Date) {
  const recurrenceType = regimen.recurrenceType || 'NONE'
  const recurrenceDays = regimen.recurrenceDays?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
  const weekday = weekdayMap[date.getDay()]

  if (recurrenceType === 'MONTHLY') return date.getDate() === 1
  if (recurrenceDays.length > 0) return recurrenceDays.includes(weekday)
  return recurrenceType === 'NONE'
}

function buildEntries(routines: Routine[], date: Date) {
  return routines.flatMap((routine) =>
    routine.regimens.flatMap((regimen) => {
      if (!regimenRunsOnDate(regimen, date)) return []
      const weekday = weekdayMap[date.getDay()]
      const times = parseRecurrenceTimes(regimen.recurrenceTimes)
      const startTime = times[weekday] || '09:00'
      return [{
        id: `${routine.id}-${regimen.id}-${isoDate(date)}`,
        regimenId: regimen.id,
        routineTitle: cleanRichText(routine.title),
        title: cleanRichText(regimen.title),
        detail: cleanRichText(regimen.description) || `${cleanRichText(routine.title)} flow`,
        taskCount: regimen.tasks.length,
        tasks: regimen.tasks.map((task) => ({
          ...task,
          title: cleanRichText(task.title),
          description: cleanRichText(task.description),
        })),
        startTime,
        hourIndex: hourIndexFromTime(startTime),
      }]
    }),
  )
}

function dayRegimenIds(routines: Routine[], date: Date) {
  return routines.flatMap((routine) =>
    routine.regimens.flatMap((regimen) => (regimenRunsOnDate(regimen, date) ? [regimen.id] : [])),
  )
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

function TaskReference({ task }: { task: Task }) {
  const mediaType = getMediaType(task.referenceUrl)

  if (!task.referenceUrl || !mediaType) return null

  if (mediaType === 'youtube') {
    const embedUrl = getYoutubeEmbedUrl(task.referenceUrl)
    if (!embedUrl) return null

    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="peridot-embed-frame w-full overflow-hidden bg-black">
          <iframe
            src={`${embedUrl}?rel=0`}
            title={task.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  if (mediaType === 'image') {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={task.referenceUrl} alt={task.title} className="max-h-[24rem] w-full object-cover" />
      </div>
    )
  }

  return (
    <a
      href={task.referenceUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/88 hover:bg-black/25"
    >
      <span className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4 text-white/50" />
        Open reference
      </span>
      <span className="text-xs uppercase tracking-[0.16em] text-white/40">Link</span>
    </a>
  )
}

function CalendarPageContent() {
  const searchParams = useSearchParams()
  const requestedDate = searchParams.get('date')
  const targetRegimenId = searchParams.get('regimen')
  const initialDate = useMemo(() => {
    if (!requestedDate) return new Date()
    const parsed = new Date(`${requestedDate}T12:00:00`)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  }, [requestedDate])
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completionError, setCompletionError] = useState<string | null>(null)
  const [visibleRegimens, setVisibleRegimens] = useState<Record<string, boolean>>({})
  const [showMobileLayers, setShowMobileLayers] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({})
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const dayScrollRef = useRef<HTMLDivElement | null>(null)
  const lastAutoScrollDateRef = useRef<string | null>(null)

  useEffect(() => {
    setCurrentDate(initialDate)
  }, [initialDate])

  useEffect(() => {
    async function loadRoutines() {
      setIsLoading(true)
      setError(null)
      try {
        const workspace = await fetchWorkspace()
        setRoutines(workspace.routines)
        setVisibleRegimens((current) => {
          const next = { ...current }
          for (const routine of workspace.routines as Routine[]) {
            for (const regimen of routine.regimens) {
              if (!(regimen.id in next)) next[regimen.id] = true
            }
          }
          if (targetRegimenId) next[targetRegimenId] = true
          return next
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load routines')
      } finally {
        setIsLoading(false)
      }
    }

    void loadRoutines()
    return subscribeToWorkspaceChanges((reason) => {
      if (reason === 'completion-updated') {
        return
      }

      void loadRoutines()
    })
  }, [targetRegimenId])

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

  const currentIso = isoDate(currentDate)
  const todayIso = isoDate(new Date())
  const miniMonthGrid = useMemo(() => buildMonthGrid(currentDate), [currentDate])
  const yearOptions = useMemo(() => buildYearOptions(currentDate.getFullYear()), [currentDate])
  const filteredRoutines = useMemo(
    () => routines.map((routine) => ({ ...routine, regimens: routine.regimens.filter((regimen) => visibleRegimens[regimen.id] !== false) })).filter((routine) => routine.regimens.length > 0),
    [routines, visibleRegimens],
  )
  const entryMap = useMemo(() => {
    const map: Record<string, ScheduleEntry[]> = {}
    for (const date of miniMonthGrid) {
      map[isoDate(date)] = buildEntries(filteredRoutines, date)
    }
    return map
  }, [filteredRoutines, miniMonthGrid])
  const dayEntries = entryMap[currentIso] ?? []
  const highlightedEntryId = useMemo(
    () => (targetRegimenId ? dayEntries.find((entry) => entry.regimenId === targetRegimenId)?.id ?? null : null),
    [dayEntries, targetRegimenId],
  )
  const regimenLayers = useMemo<RegimenLayer[]>(
    () =>
      routines.flatMap((routine) =>
        routine.regimens.map((regimen) => ({
          id: regimen.id,
          title: cleanRichText(regimen.title),
          routineTitle: cleanRichText(routine.title),
          tint: getRegimenTint(regimen.colorTint),
          color: makeRegimenTheme(regimen.colorTint),
        })),
      ),
    [routines],
  )
  const regimenColorMap = useMemo(
    () => Object.fromEntries(regimenLayers.map((layer) => [layer.id, layer.color])),
    [regimenLayers],
  )
  const currentDayRegimenIdSet = useMemo(
    () => new Set(dayRegimenIds(routines, currentDate)),
    [routines, currentDate],
  )
  const currentDayRegimenLayers = useMemo(
    () => regimenLayers.filter((layer) => currentDayRegimenIdSet.has(layer.id)),
    [regimenLayers, currentDayRegimenIdSet],
  )
  const miniCalendarMarkers = useMemo(() => {
    const markers: Record<string, string[]> = {}
    for (const date of miniMonthGrid) {
      markers[isoDate(date)] = Array.from(new Set(dayRegimenIds(routines, date)))
    }
    return markers
  }, [routines, miniMonthGrid])
  const desktopTimelineHeight = useMemo(
    () =>
      dayEntries.reduce((maxHeight, entry, index) => {
        const expanded = expandedEntries[entry.id] !== false
        const blockHeight = expanded ? estimateExpandedEntryHeight(entry) : 126
        return Math.max(maxHeight, entryTopOffset(entry, index) + blockHeight + 16)
      }, hourSlots.length * hourHeight),
    [dayEntries, expandedEntries],
  )

  const statusBlock = isLoading ? (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">Loading scheduled items...</div>
  ) : error ? (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">{error}</div>
  ) : null

  useEffect(() => {
    if (!dayScrollRef.current || dayEntries.length === 0) return
    if (lastAutoScrollDateRef.current === currentIso) return

    lastAutoScrollDateRef.current = currentIso
    const firstHour = Math.min(...dayEntries.map((entry) => entry.hourIndex))
    const target = Math.max(firstHour * hourHeight - hourHeight * 2, 0)
    const frame = window.requestAnimationFrame(() => {
      dayScrollRef.current?.scrollTo({ top: target, behavior: 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [currentIso, dayEntries])

  useEffect(() => {
    if (!highlightedEntryId) return
    setExpandedEntries((current) => ({ ...current, [highlightedEntryId]: true }))
  }, [highlightedEntryId])

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
      const saved = await saveTaskCompletion({
        date: currentIso,
        regimenId,
        taskId,
        completed: nextCompleted,
      })

      if (!saved) {
        throw new Error('Failed to save task completion')
      }
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

  function isTaskComplete(regimenId: string, taskId: string) {
    return completedTasks[completionKey(currentIso, regimenId, taskId)] === true
  }

  function completedCount(entry: ScheduleEntry) {
    return entry.tasks.filter((task) => isTaskComplete(entry.regimenId, task.id)).length
  }

  function updateMonth(monthIndex: number) {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1))
    setShowMonthPicker(false)
  }

  function updateYear(year: number) {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1))
    setShowMonthPicker(false)
  }

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter py-4 sm:py-6">
        <div className="peridot-page-frame">
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-6">
            <aside className="peridot-panel hidden overflow-hidden lg:block">
              <div className="border-b border-white/10 px-5 py-4">
                <Button type="button" asChild className="peridot-display h-10 w-full justify-start rounded-xl border border-white/10 bg-white/5 px-4 text-white hover:bg-white/10">
                  <a href="/routines">
                    <Plus className="mr-2 h-4 w-4" />
                    Create flow
                  </a>
                </Button>
              </div>
              <div className="space-y-6 p-5">
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMonthPicker((current) => !current)}
                    className="peridot-meta mb-3 flex items-center gap-2 text-xs text-white/45 hover:text-white/75"
                  >
                    {monthLabelFormatter.format(currentDate)}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                  </button>
                  {showMonthPicker ? (
                    <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        {monthNames.map((monthName, monthIndex) => (
                          <button
                            key={`desktop-month-${monthName}`}
                            type="button"
                            onClick={() => updateMonth(monthIndex)}
                            className={monthIndex === currentDate.getMonth() ? 'peridot-meta rounded-xl border border-emerald-200/70 bg-emerald-300/30 px-2 py-2 text-[11px] font-semibold text-white' : 'peridot-meta rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[11px] text-white/70 hover:bg-black/25'}
                          >
                            {monthName.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                      <div>
                        <div className="peridot-meta mb-2 text-[11px] text-white/35">Year</div>
                        <div className="grid grid-cols-3 gap-2">
                          {yearOptions.map((year) => (
                            <button
                              key={`desktop-year-${year}`}
                              type="button"
                              onClick={() => updateYear(year)}
                              className={year === currentDate.getFullYear() ? 'peridot-meta rounded-xl border border-emerald-200/70 bg-emerald-300/30 px-2 py-2 text-[11px] font-semibold text-white' : 'peridot-meta rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[11px] text-white/70 hover:bg-black/25'}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="peridot-meta grid grid-cols-7 gap-1 text-center text-[11px] text-white/35">
                    {dayNames.map((day) => <div key={`mini-${day}`}>{day.slice(0, 1)}</div>)}
                      {miniMonthGrid.map((date) => {
                        const dateIso = isoDate(date)
                        const selected = dateIso === currentIso
                        const isToday = dateIso === todayIso
                        const markerIds = miniCalendarMarkers[dateIso] ?? []
                        const hasEntries = markerIds.length > 0
                        return (
                          <button
                            key={`mini-date-${dateIso}`}
                            type="button"
                            onClick={() => setCurrentDate(date)}
                            className={selected ? 'relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0f1512]' : hasEntries ? 'relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/[0.1]' : isToday ? 'relative flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/30 text-sm font-semibold text-emerald-200' : 'relative flex h-11 w-11 items-center justify-center rounded-full text-sm text-white/70 hover:bg-white/5'}
                          >
                            <span className={`${hasEntries ? '-translate-y-1' : ''}`}>{date.getDate()}</span>
                            {hasEntries ? (
                              <span className="pointer-events-none absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1">
                                {markerIds.slice(0, 3).map((regimenId) => (
                                  <span key={`desktop-marker-${dateIso}-${regimenId}`} className="h-1.5 w-1.5 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" style={{ backgroundColor: regimenColorMap[regimenId]?.dot ?? '#ffffff' }} />
                                ))}
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">Flow Layers</div>
                  <div className="space-y-2">
                    {currentDayRegimenLayers.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-white/45">No flows scheduled for this day.</div> : null}
                    {currentDayRegimenLayers.map((layer) => {
                      const checked = visibleRegimens[layer.id] !== false
                      return (
                        <label
                          key={layer.id}
                          className="flex items-center gap-3 rounded-xl border px-3 py-3 text-sm text-white"
                          style={{
                            borderColor: layer.color.border,
                            background: checked ? layer.color.softBg : layer.color.bg,
                            boxShadow: `inset 3px 0 0 ${layer.color.accent}, 0 14px 30px ${layer.color.accentGlow}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setVisibleRegimens((current) => ({ ...current, [layer.id]: !checked }))}
                            className="h-4 w-4 rounded border-white/20 bg-transparent accent-emerald-300"
                          />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: layer.color.dot }} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{layer.title}</span>
                            <span className="block truncate text-xs text-white/45">{layer.routineTitle}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>

            <section className="peridot-panel overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.02] px-2.5 py-3 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3 md:space-y-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button type="button" onClick={() => setCurrentDate(new Date())} className="peridot-display h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10">
                        Today
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCurrentDate((current) => addDays(current, -1))} className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCurrentDate((current) => addDays(current, 1))} className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="peridot-display text-lg font-semibold text-white md:text-2xl">{dayLabelFormatter.format(currentDate)}</h2>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <Button type="button" onClick={() => setShowMobileLayers((current) => !current)} className="peridot-display h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10 sm:w-auto lg:hidden">
                      {showMobileLayers ? 'Hide Flows' : 'Show Flows'}
                    </Button>
                    <Button type="button" asChild className="peridot-display inline-flex h-10 w-full rounded-xl border border-emerald-300/25 bg-emerald-300 px-4 font-semibold text-emerald-950 hover:bg-emerald-200 sm:w-auto">
                      <a href="/routines">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Routine
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-1.5 sm:p-4">
                {showMobileLayers ? (
                  <div className="mb-3 space-y-3 lg:hidden">
                    <div className="overflow-hidden rounded-[1.2rem] border border-white/10">
                      <div className="border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setShowMonthPicker((current) => !current)}
                          className="peridot-meta flex items-center gap-2 text-xs text-white/45 hover:text-white/75"
                        >
                          {monthLabelFormatter.format(currentDate)}
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      {showMonthPicker ? (
                        <div className="border-b border-white/10 bg-white/[0.03] p-1.5">
                          <div className="mb-3 grid grid-cols-3 gap-2">
                            {monthNames.map((monthName, monthIndex) => (
                              <button
                                key={`mobile-month-${monthName}`}
                                type="button"
                                onClick={() => updateMonth(monthIndex)}
                                className={monthIndex === currentDate.getMonth() ? 'peridot-meta rounded-xl border border-emerald-200/70 bg-emerald-300/30 px-2 py-2 text-[11px] font-semibold text-white' : 'peridot-meta rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[11px] text-white/70 hover:bg-black/25'}
                              >
                                {monthName.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {yearOptions.map((year) => (
                              <button
                                key={`mobile-year-${year}`}
                                type="button"
                                onClick={() => updateYear(year)}
                                className={year === currentDate.getFullYear() ? 'peridot-meta rounded-xl border border-emerald-200/70 bg-emerald-300/30 px-2 py-2 text-[11px] font-semibold text-white' : 'peridot-meta rounded-xl border border-white/10 bg-black/15 px-2 py-2 text-[11px] text-white/70 hover:bg-black/25'}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <div className="peridot-meta grid grid-cols-7 gap-1 p-1.5 text-center text-[11px] text-white/35">
                        {dayNames.map((day) => <div key={`mobile-mini-${day}`}>{day.slice(0, 1)}</div>)}
                        {miniMonthGrid.map((date) => {
                          const dateIso = isoDate(date)
                          const selected = dateIso === currentIso
                          const isToday = dateIso === todayIso
                          const markerIds = miniCalendarMarkers[dateIso] ?? []
                          const hasEntries = markerIds.length > 0
                          return (
                            <button
                              key={`mobile-mini-date-${dateIso}`}
                              type="button"
                              onClick={() => setCurrentDate(date)}
                              className={selected ? 'relative mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0f1512]' : hasEntries ? 'relative mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white hover:bg-white/[0.1]' : isToday ? 'relative mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300/30 text-sm font-semibold text-emerald-200' : 'relative mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm text-white/70 hover:bg-white/5'}
                            >
                              <span className={`${hasEntries ? '-translate-y-1' : ''}`}>{date.getDate()}</span>
                              {hasEntries ? (
                                <span className="pointer-events-none absolute bottom-1.5 left-1/2 flex -translate-x-1/2 items-center gap-1">
                                  {markerIds.slice(0, 3).map((regimenId) => (
                                    <span key={`mobile-marker-${dateIso}-${regimenId}`} className="h-1.5 w-1.5 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.35)]" style={{ backgroundColor: regimenColorMap[regimenId]?.dot ?? '#ffffff' }} />
                                  ))}
                                </span>
                              ) : null}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[1.2rem] border border-white/10">
                      <div className="border-b border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs uppercase tracking-[0.18em] text-white/45">
                        Flow Layers
                      </div>
                      <div className="space-y-2 p-1.5">
                        {currentDayRegimenLayers.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm text-white/45">No flows scheduled for this day.</div> : null}
                        {currentDayRegimenLayers.map((layer) => {
                          const checked = visibleRegimens[layer.id] !== false
                          return (
                            <label
                              key={`mobile-layer-${layer.id}`}
                              className="flex items-center gap-3 rounded-xl border px-2.5 py-2.5 text-sm text-white"
                              style={{
                                borderColor: layer.color.border,
                                background: checked ? layer.color.softBg : layer.color.bg,
                                boxShadow: `inset 3px 0 0 ${layer.color.accent}, 0 14px 30px ${layer.color.accentGlow}`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => setVisibleRegimens((current) => ({ ...current, [layer.id]: !checked }))}
                                className="h-4 w-4 rounded border-white/20 bg-transparent accent-emerald-300"
                              />
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: layer.color.dot }} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{layer.title}</span>
                                <span className="block truncate text-xs text-white/45">{layer.routineTitle}</span>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {statusBlock}

                {completionError ? (
                  <div className="rounded-[1.2rem] border border-amber-200/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                    {completionError}
                  </div>
                ) : null}

                {!statusBlock ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-[1.2rem] border border-white/10 md:hidden">
                      <div className="max-h-[70vh] overflow-y-auto">
                        {hourSlots.map((slot, slotIndex) => {
                          const slotEntries = dayEntries.filter((entry) => entry.hourIndex === slotIndex)
                          return (
                            <div key={`mobile-slot-${slot}`} className="grid grid-cols-[44px_1fr] border-b border-white/5 last:border-b-0 sm:grid-cols-[64px_1fr]">
                              <div className="peridot-meta border-r border-white/10 bg-white/[0.02] px-1 py-2 text-right text-[10px] font-medium text-white/45 sm:px-2 sm:py-3 sm:text-[11px]">
                                {slot}
                              </div>
                              <div className="min-h-[52px] bg-[#141a17] px-1.5 py-2 sm:min-h-[72px] sm:px-3 sm:py-3">
                                {slotEntries.length === 0 ? null : (
                                  <div className="space-y-3">
                                    {slotEntries.map((entry) => {
                                      const expanded = expandedEntries[entry.id] !== false
                                      const isTargeted = highlightedEntryId === entry.id
                                      const color = regimenColorMap[entry.regimenId] ?? fallbackRegimenTheme
                                      const completeCount = completedCount(entry)
                                      const regimenDone = completeCount === entry.tasks.length && entry.tasks.length > 0
                                      const progressTheme = progressPillTheme(completeCount, entry.tasks.length)
                                      return (
                                        <div
                                          key={`mobile-${entry.id}`}
                                          className="overflow-hidden rounded-[1rem] border"
                                          style={{
                                            borderColor: regimenDone ? color.completeBorder : color.border,
                                            background: expanded ? color.softBg : regimenDone ? color.completeBg : color.bg,
                                            boxShadow: isTargeted
                                              ? `0 0 0 2px ${tintRgba(color.accent, 0.92)}, 0 18px 40px ${color.accentGlow}`
                                              : `0 18px 40px ${color.accentGlow}`,
                                          }}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => setExpandedEntries((current) => ({ ...current, [entry.id]: !expanded }))}
                                            className="flex w-full items-start justify-between gap-3 px-2.5 py-2.5 text-left sm:px-4 sm:py-4"
                                            style={{
                                              background: color.softBg,
                                              boxShadow: `inset 3px 0 0 ${color.accent}`,
                                            }}
                                          >
                                            <div className="min-w-0 flex-1">
                                              <div className="mb-2 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                                <span
                                                  className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]"
                                                  style={{
                                                    background: color.chipBg,
                                                    color: color.chipText,
                                                    boxShadow: `0 10px 24px ${color.accentGlow}`,
                                                  }}
                                                >
                                                  {timeLabel(entry.startTime)}
                                                </span>
                                                <span className="rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] sm:ml-auto" style={{ backgroundColor: progressTheme.bg, borderColor: progressTheme.border, color: progressTheme.text }}>
                                                  {completeCount}/{entry.tasks.length} tasks
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <div className="text-base font-semibold text-[#18200f]">{entry.title}</div>
                                              </div>
                                              <div className="mt-1 text-sm font-medium" style={{ color: color.accentText }}>{entry.routineTitle}</div>
                                              {entry.detail ? <div className="mt-3 text-sm leading-6 text-[#31421d]">{entry.detail}</div> : null}
                                              {regimenDone ? <div className="mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em]" style={{ borderColor: tintRgba(color.accent, 0.34), backgroundColor: color.accentSoft, color: color.accentText }}>Flow complete for today.</div> : null}
                                            </div>
                                            <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-[#32441d] transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                          </button>

                                          {expanded ? (
                                            <div
                                              className="space-y-3 border-t border-white/10 px-2.5 py-2.5 sm:px-4 sm:py-4"
                                              style={{ backgroundColor: tintRgba(color.accent, 0.14) }}
                                            >
                                              {entry.tasks.map((task) => {
                                                const done = isTaskComplete(entry.regimenId, task.id)
                                                return (
                                                  <div
                                                    key={task.id}
                                                    className="rounded-2xl border p-4"
                                                    style={{
                                                      borderColor: done ? tintRgba(color.accent, 0.42) : tintRgba(color.accent, 0.28),
                                                      background: done ? color.taskDoneBg : color.taskBg,
                                                      boxShadow: `0 14px 28px ${tintRgba(color.accent, 0.14)}`,
                                                    }}
                                                  >
                                                    <div className="flex items-start gap-3">
                                                      <input
                                                        type="checkbox"
                                                        checked={done}
                                                        onChange={() => toggleTaskCompletion(entry.regimenId, task.id)}
                                                        className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-transparent accent-emerald-300"
                                                      />
                                                      <div className={`min-w-0 flex-1 text-base font-semibold leading-6 ${done ? 'text-[#587040] line-through' : 'text-[#18200f]'}`}>{task.title}</div>
                                                    </div>
                                                    {!done && task.description ? (
                                                      <div
                                                        className="mt-3 rounded-xl border px-3 py-3"
                                                        style={{
                                                          borderColor: tintRgba(color.accent, 0.18),
                                                          backgroundColor: color.taskPanelBg,
                                                        }}
                                                      >
                                                        <div className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: color.accentText }}>Instructions</div>
                                                        <div className="space-y-2">
                                                          {descriptionLines(task.description).map((line, index) => (
                                                            <p key={`${task.id}-mobile-line-${index}`} className="text-[15px] leading-7 text-[#31421d]">
                                                              {line}
                                                            </p>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    ) : null}
                                                    {!done ? <TaskReference task={task} /> : null}
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          ) : null}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div ref={dayScrollRef} className="hidden max-h-[72vh] overflow-y-auto rounded-[1.2rem] border border-white/10 md:block">
                      <div className="grid grid-cols-[78px_1fr]">
                        <div className="border-r border-white/10 bg-white/[0.015]">
                          {hourSlots.map((slot) => (
                            <div key={slot} className="peridot-meta flex items-start justify-end border-b border-white/5 pr-3 pt-1 text-[11px] text-white/35" style={{ height: `${hourHeight}px` }}>
                              {slot}
                            </div>
                          ))}
                        </div>
                        <div className="relative" style={{ minHeight: `${desktopTimelineHeight}px` }}>
                          {hourSlots.map((slot) => (
                            <div key={slot} className="border-b border-white/5 bg-[#141a17]" style={{ height: `${hourHeight}px` }} />
                          ))}
                          {dayEntries.length > 0 ? (
                            <div className="absolute inset-0 p-4">
                              {dayEntries.map((entry, index) => {
                                const expanded = expandedEntries[entry.id] !== false
                                const isTargeted = highlightedEntryId === entry.id
                                const color = regimenColorMap[entry.regimenId] ?? fallbackRegimenTheme
                                const completeCount = completedCount(entry)
                                const regimenDone = completeCount === entry.tasks.length && entry.tasks.length > 0
                                const progressTheme = progressPillTheme(completeCount, entry.tasks.length)
                                const blockHeight = expanded ? estimateExpandedEntryHeight(entry) : 126
                                return (
                                  <div
                                    key={entry.id}
                                    className="absolute left-4 right-4 overflow-hidden rounded-2xl border"
                                    style={{
                                      top: `${entryTopOffset(entry, index)}px`,
                                      minHeight: `${blockHeight}px`,
                                      borderColor: regimenDone ? color.completeBorder : color.border,
                                      background: expanded ? color.softBg : regimenDone ? color.completeBg : color.bg,
                                      boxShadow: isTargeted
                                        ? `0 0 0 2px ${tintRgba(color.accent, 0.92)}, 0 20px 45px ${color.accentGlow}`
                                        : `0 20px 45px ${color.accentGlow}`,
                                    }}
                                  >
                                    <div
                                      className="border-l-4 px-5 py-4"
                                      style={{
                                        borderLeftColor: color.accent,
                                        background: color.softBg,
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-3">
                                            <div className="inline-flex items-center gap-2">
                                              <div className="text-base font-semibold text-[#18200f]">{entry.title}</div>
                                            </div>
                                            <span
                                              className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]"
                                              style={{
                                                background: color.chipBg,
                                                color: color.chipText,
                                                boxShadow: `0 10px 24px ${color.accentGlow}`,
                                              }}
                                            >
                                              {timeLabel(entry.startTime)}
                                            </span>
                                            <span className="ml-2 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]" style={{ backgroundColor: progressTheme.bg, borderColor: progressTheme.border, color: progressTheme.text }}>
                                              {completeCount}/{entry.tasks.length} done
                                            </span>
                                            {regimenDone ? <span className="rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]" style={{ borderColor: tintRgba(color.accent, 0.34), backgroundColor: color.accentSoft, color: color.accentText }}>Complete</span> : null}
                                          </div>
                                          <div className="mt-1 text-sm font-medium" style={{ color: color.accentText }}>{entry.routineTitle}</div>
                                          {entry.detail ? <div className="mt-3 max-w-3xl text-sm leading-6 text-[#31421d]">{entry.detail}</div> : null}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          onClick={() => setExpandedEntries((current) => ({ ...current, [entry.id]: !expanded }))}
                                          className="h-9 rounded-xl border border-black/10 bg-black/10 px-3 text-[#18200f] hover:bg-black/15"
                                        >
                                          {expanded ? 'Collapse' : 'Expand'}
                                        </Button>
                                      </div>

                                      {expanded ? (
                                        <div className="mt-4 grid gap-3" style={{ backgroundColor: tintRgba(color.accent, 0.14) }}>
                                          {entry.tasks.map((task) => {
                                            const done = isTaskComplete(entry.regimenId, task.id)
                                            return (
                                              <div
                                                key={task.id}
                                                className="rounded-2xl border p-5"
                                                style={{
                                                  borderColor: done ? tintRgba(color.accent, 0.42) : tintRgba(color.accent, 0.28),
                                                  background: done ? color.taskDoneBg : color.taskBg,
                                                  boxShadow: `0 16px 30px ${tintRgba(color.accent, 0.14)}`,
                                                }}
                                              >
                                                <div className="flex items-start gap-3">
                                                  <input
                                                    type="checkbox"
                                                    checked={done}
                                                    onChange={() => toggleTaskCompletion(entry.regimenId, task.id)}
                                                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-transparent accent-emerald-300"
                                                  />
                                                  <div className={`min-w-0 flex-1 text-base font-semibold leading-7 ${done ? 'text-[#587040] line-through' : 'text-[#18200f]'}`}>{task.title}</div>
                                                </div>
                                                {!done && task.description ? (
                                                  <div
                                                    className="mt-3 rounded-xl border px-4 py-3"
                                                    style={{
                                                      borderColor: tintRgba(color.accent, 0.18),
                                                      backgroundColor: color.taskPanelBg,
                                                    }}
                                                  >
                                                    <div className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: color.accentText }}>Instructions</div>
                                                    <div className="space-y-2">
                                                      {descriptionLines(task.description).map((line, index) => (
                                                        <p key={`${task.id}-desktop-line-${index}`} className="text-[15px] leading-7 text-[#31421d]">
                                                          {line}
                                                        </p>
                                                      ))}
                                                    </div>
                                                  </div>
                                                ) : null}
                                                {!done ? <TaskReference task={task} /> : null}
                                              </div>
                                            )
                                          })}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="lg:pl-80"><div className="peridot-app-page peridot-shell peridot-page-gutter py-6 sm:py-8"><div className="peridot-page-frame"><div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-white/50">Loading calendar...</div></div></div></div>}>
      <CalendarPageContent />
    </Suspense>
  )
}
