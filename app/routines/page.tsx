'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, CheckSquare, ChevronDown, ChevronUp, Copy, ExternalLink, Image as ImageIcon, Layers3, Link2, Pencil, PlayCircle, Plus, Trash2, X } from 'lucide-react'
import { DEFAULT_REGIMEN_TINT, REGIMEN_TINTS, getRegimenTint, getRegimenTintMeta, tintRgba } from '@/lib/regimen-tints'
import {
  createRoutine,
  fetchWorkspace,
  removeRoutine,
  subscribeToWorkspaceChanges,
  updateRoutine,
} from '@/lib/workspace-client'
import type { RoutineInput } from '@/lib/workspace-types'

type Task = {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  dueLabel: string | null
  referenceUrl: string | null
  referenceLabel: string | null
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
  description: string | null
  category: string
  isActive: boolean
  regimens: Regimen[]
}

type TaskDraft = {
  title: string
  description: string
  priority: string
  status: string
  dueLabel: string
  referenceUrl: string
  referenceLabel: string
}

type RegimenDraft = {
  title: string
  description: string
  cadence: string
  colorTint: string
  recurrenceType: string
  recurrenceDays: string[]
  recurrenceTimes: Record<string, string>
  tasks: TaskDraft[]
}

type RoutineDraft = {
  name: string
  description: string
  category: string
  regimens: RegimenDraft[]
}

const categories = ['WORKOUT', 'LEARNING', 'PRODUCTIVITY', 'HABITS', 'CUSTOM']
const cadenceOptions = ['DAILY', 'WEEKLY', 'SEMI_WEEKLY', 'MONTHLY', 'CUSTOM']
const priorityOptions = ['HIGH', 'MEDIUM', 'LOW']
const statusOptions = ['TODO', 'IN_PROGRESS', 'COMPLETED']
const recurrenceOptions = ['NONE', 'WEEKLY', 'SEMI_WEEKLY', 'MONTHLY']
const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const formatLabel = (value: string) => value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const formatWeekday = (day: string) => ({ MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' }[day] || day)
const parseRecurrenceTimes = (value: string | null) => {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed ? parsed as Record<string, string> : {}
  } catch {
    return {}
  }
}
const emptyTask = (): TaskDraft => ({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueLabel: '', referenceUrl: '', referenceLabel: '' })
const emptyRegimen = (): RegimenDraft => ({ title: '', description: '', cadence: 'CUSTOM', colorTint: DEFAULT_REGIMEN_TINT, recurrenceType: 'NONE', recurrenceDays: [], recurrenceTimes: {}, tasks: [emptyTask()] })
const emptyRoutine = (): RoutineDraft => ({ name: '', description: '', category: 'CUSTOM', regimens: [emptyRegimen()] })
const countTasks = (regimens: Regimen[]) => regimens.reduce((sum, regimen) => sum + regimen.tasks.length, 0)
const parseRecurrenceDays = (days: string | null) => days?.split(',').map((day) => day.trim()).filter(Boolean) ?? []
const countFilledDraftTasks = (tasks: TaskDraft[]) => tasks.filter((task) => task.title.trim()).length
const getDraftRegimenTitle = (regimen: RegimenDraft, index: number) => regimen.title.trim() || `Untitled flow ${index + 1}`
const getDraftRegimenDaySummary = (regimen: RegimenDraft) => {
  if (regimen.recurrenceDays.length === 0) return 'Pick the days this flow should appear.'
  const days = regimen.recurrenceDays.map(formatWeekday)
  return days.length <= 3 ? days.join(', ') : `${days.slice(0, 3).join(', ')} +${days.length - 3}`
}

function routineToDraft(routine: Routine): RoutineDraft {
  return {
    name: routine.title,
    description: routine.description || '',
    category: routine.category,
    regimens: routine.regimens.length > 0
      ? routine.regimens.map((regimen) => ({
          title: regimen.title,
          description: regimen.description || '',
          cadence: regimen.cadence,
          colorTint: getRegimenTint(regimen.colorTint),
          recurrenceType: regimen.recurrenceType || 'NONE',
          recurrenceDays: parseRecurrenceDays(regimen.recurrenceDays),
          recurrenceTimes: parseRecurrenceTimes(regimen.recurrenceTimes),
          tasks: regimen.tasks.length > 0
            ? regimen.tasks.map((task) => ({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                status: task.status,
                dueLabel: task.dueLabel || '',
                referenceUrl: task.referenceUrl || '',
                referenceLabel: task.referenceLabel || '',
              }))
            : [emptyTask()],
        }))
      : [emptyRegimen()],
  }
}

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.split('/').filter(Boolean)[0] ? `https://www.youtube.com/embed/${parsed.pathname.split('/').filter(Boolean)[0]}` : null
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean)[1]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

function ReferencePreview({ url, label }: { url: string | null, label: string | null }) {
  if (!url) return null
  const embed = getYouTubeEmbedUrl(url)
  const title = label || 'Task reference'
  if (embed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm text-white/70">
          <PlayCircle className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <div className="peridot-embed-frame w-full overflow-hidden bg-black">
          <iframe
            src={`${embed}?rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }
  if (/\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(url)) {
    return <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5"><div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm text-white/70"><ImageIcon className="h-4 w-4" /><span>{title}</span></div><img src={url} alt={title} className="h-64 w-full object-cover" /></div>
  }
  return <a href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white"><div className="flex items-center gap-3"><Link2 className="h-5 w-5 text-white/70" /><div><div className="font-medium">{title}</div><div className="text-sm text-white/60">{url}</div></div></div><ExternalLink className="h-4 w-4 text-white/60" /></a>
}

function duplicateRegimenDraft(regimen: RegimenDraft): RegimenDraft {
  return {
    ...regimen,
    title: regimen.title ? `${regimen.title} Copy` : regimen.title,
    recurrenceDays: [...regimen.recurrenceDays],
    recurrenceTimes: { ...regimen.recurrenceTimes },
    tasks: regimen.tasks.map((task) => ({ ...task })),
  }
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [formData, setFormData] = useState<RoutineDraft>(emptyRoutine())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null)
  const [activeRegimenIndex, setActiveRegimenIndex] = useState(0)
  const [activeTaskIndex, setActiveTaskIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null)
  const [duplicatingRoutineId, setDuplicatingRoutineId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [collapsedRoutines, setCollapsedRoutines] = useState<Record<string, boolean>>({})
  const [collapsedRegimens, setCollapsedRegimens] = useState<Record<string, boolean>>({})

  useEffect(() => {
    void loadWorkspace()
  }, [])

  useEffect(() => {
    setCollapsedRoutines((current) => {
      const next = { ...current }
      for (const routine of routines) {
        if (!(routine.id in next)) next[routine.id] = true
      }
      return next
    })
  }, [routines])

  useEffect(() => {
    setCollapsedRegimens((current) => {
      const next = { ...current }
      for (const routine of routines) {
        for (const regimen of routine.regimens) {
          if (!(regimen.id in next)) next[regimen.id] = true
        }
      }
      return next
    })
  }, [routines])

  async function loadWorkspace() {
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

  useEffect(() => {
    return subscribeToWorkspaceChanges(() => {
      void loadWorkspace()
    })
  }, [])

  useEffect(() => {
    if (!showCreateForm) return
    setActiveRegimenIndex((current) => {
      if (formData.regimens.length === 0) return 0
      return Math.min(current, formData.regimens.length - 1)
    })
  }, [formData.regimens.length, showCreateForm])

  useEffect(() => {
    if (!showCreateForm) return
    const regimen = formData.regimens[activeRegimenIndex]
    if (!regimen) {
      setActiveTaskIndex(0)
      return
    }
    setActiveTaskIndex((current) => regimen.tasks.length === 0 ? 0 : Math.min(current, regimen.tasks.length - 1))
  }, [activeRegimenIndex, formData.regimens, showCreateForm])

  const activeRoutines = useMemo(() => routines.filter((routine) => routine.isActive).length, [routines])
  const totalRegimens = useMemo(() => routines.reduce((sum, routine) => sum + routine.regimens.length, 0), [routines])
  const totalTasks = useMemo(() => routines.reduce((sum, routine) => sum + countTasks(routine.regimens), 0), [routines])

  const updateRegimen = (index: number, patch: Partial<RegimenDraft>) => setFormData((current) => ({ ...current, regimens: current.regimens.map((regimen, i) => i === index ? { ...regimen, ...patch } : regimen) }))
  const updateTask = (regimenIndex: number, taskIndex: number, patch: Partial<TaskDraft>) => setFormData((current) => ({ ...current, regimens: current.regimens.map((regimen, i) => i === regimenIndex ? { ...regimen, tasks: regimen.tasks.map((task, j) => j === taskIndex ? { ...task, ...patch } : task) } : regimen) }))
  const toggleRegimenDay = (regimenIndex: number, day: string) => {
    const regimen = formData.regimens[regimenIndex]
    const selected = regimen.recurrenceDays.includes(day)
    updateRegimen(regimenIndex, {
      recurrenceDays: selected ? regimen.recurrenceDays.filter((current) => current !== day) : [...regimen.recurrenceDays, day],
      recurrenceTimes: selected
        ? Object.fromEntries(Object.entries(regimen.recurrenceTimes).filter(([currentDay]) => currentDay !== day))
        : { ...regimen.recurrenceTimes, [day]: regimen.recurrenceTimes[day] || '09:00' },
    })
  }
  const updateRegimenTime = (regimenIndex: number, day: string, time: string) => updateRegimen(regimenIndex, { recurrenceTimes: { ...formData.regimens[regimenIndex].recurrenceTimes, [day]: time } })

  function closeBuilder() {
    setShowCreateForm(false)
    setEditingRoutineId(null)
    setFormData(emptyRoutine())
    setActiveRegimenIndex(0)
    setActiveTaskIndex(0)
  }

  function openCreateRoutine() {
    setEditingRoutineId(null)
    setFormData(emptyRoutine())
    setActiveRegimenIndex(0)
    setActiveTaskIndex(0)
    setShowCreateForm(true)
  }

  function openEditRoutine(routine: Routine) {
    setEditingRoutineId(routine.id)
    setFormData(routineToDraft(routine))
    setActiveRegimenIndex(0)
    setActiveTaskIndex(0)
    setShowCreateForm(true)
  }

  function selectRegimen(index: number) {
    setActiveRegimenIndex(index)
    setActiveTaskIndex(0)
  }

  function addRegimen() {
    setFormData((current) => ({ ...current, regimens: [...current.regimens, emptyRegimen()] }))
    setActiveRegimenIndex(formData.regimens.length)
    setActiveTaskIndex(0)
  }

  function duplicateRegimenAt(index: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.flatMap((item, i) => i === index ? [item, duplicateRegimenDraft(item)] : [item]),
    }))
    setActiveRegimenIndex(index + 1)
    setActiveTaskIndex(0)
  }

  function removeRegimenAt(index: number) {
    setFormData((current) => ({ ...current, regimens: current.regimens.filter((_, i) => i !== index) }))
    setActiveRegimenIndex((current) => {
      if (current > index) return current - 1
      if (current === index) return Math.max(0, current - 1)
      return current
    })
    setActiveTaskIndex(0)
  }

  function addTaskToRegimen(regimenIndex: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.map((item, i) => i === regimenIndex ? { ...item, tasks: [...item.tasks, emptyTask()] } : item),
    }))
    setActiveRegimenIndex(regimenIndex)
    setActiveTaskIndex(formData.regimens[regimenIndex]?.tasks.length ?? 0)
  }

  function removeTaskFromRegimen(regimenIndex: number, taskIndex: number) {
    setFormData((current) => ({
      ...current,
      regimens: current.regimens.map((item, i) => i === regimenIndex ? { ...item, tasks: item.tasks.filter((_, j) => j !== taskIndex) } : item),
    }))
    if (regimenIndex === activeRegimenIndex) {
      setActiveTaskIndex((current) => {
        if (current > taskIndex) return current - 1
        if (current === taskIndex) return Math.max(0, current - 1)
        return current
      })
    }
  }

  async function deleteRoutine(routineId: string) {
    const confirmed = window.confirm('Delete this routine and all its flows and tasks?')
    if (!confirmed) return

    setDeletingRoutineId(routineId)
    try {
      await removeRoutine(routineId)
      setRoutines((current) => current.filter((routine) => routine.id !== routineId))
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : 'Failed to delete routine')
    } finally {
      setDeletingRoutineId(null)
    }
  }

  async function duplicateRoutine(routine: Routine) {
    setDuplicatingRoutineId(routine.id)
    try {
      const created = await createRoutine({
        ...routineToDraft(routine),
        name: `${routine.title} Copy`,
      })
      setRoutines((current) => [created, ...current])
    } catch (duplicateError) {
      alert(duplicateError instanceof Error ? duplicateError.message : 'Failed to duplicate routine')
    } finally {
      setDuplicatingRoutineId(null)
    }
  }

  async function submitRoutine(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const payload: RoutineInput = {
      ...formData,
      regimens: formData.regimens
        .map((regimen) => ({ ...regimen, tasks: regimen.tasks.filter((task) => task.title.trim()) }))
        .filter((regimen) => regimen.title.trim() && regimen.tasks.length > 0),
    }
    try {
      const data = editingRoutineId
        ? await updateRoutine(editingRoutineId, payload)
        : await createRoutine(payload)
      setRoutines((current) => editingRoutineId ? current.map((routine) => routine.id === editingRoutineId ? data : routine) : [data, ...current])
      closeBuilder()
    } catch (submitError) {
      alert(submitError instanceof Error ? submitError.message : `Failed to ${editingRoutineId ? 'update' : 'create'} routine`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="lg:pl-80">
      <div className="peridot-app-page peridot-shell peridot-page-gutter overflow-x-hidden py-6 sm:py-8">
        <div className="peridot-page-frame flex flex-col">
        {showCreateForm ? (
          <section className="order-3 peridot-panel mb-8 overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[#21342b] bg-[#101a16] px-4 py-5 text-[#f7faef] sm:px-8 sm:py-6">
              <div>
                <div className="peridot-eyebrow text-xs text-[#d6ef91]">Builder</div>
                <h3 className="mt-1 text-xl font-semibold text-[#f7faef] sm:text-2xl">{editingRoutineId ? 'Edit Routine' : 'Create Routine'}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d5dfc4]">Start with the routine details, then move flow by flow instead of editing one long page.</p>
              </div>
              <Button type="button" variant="ghost" onClick={closeBuilder} className="h-10 rounded-xl border border-emerald-200/30 bg-emerald-100/12 px-3 !text-[#f7faef] hover:bg-emerald-100/18 hover:!text-[#f7faef] [&_svg]:!text-[#f7faef]"><X className="h-4 w-4 !text-[#f7faef]" /></Button>
            </div>
            <form onSubmit={submitRoutine} className="space-y-8">
              <div className="grid gap-5 px-4 pt-5 sm:px-8 sm:pt-8 md:grid-cols-2">
                <div className="md:col-span-2 peridot-panel-soft p-5 sm:p-6">
                  <div className="mb-5">
                    <div className="peridot-section-label text-xs text-emerald-200/60">Routine</div>
                    <div className="mt-1 text-lg font-semibold text-white">Core Identity</div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-white/90">Routine Name</label>
                      <Input value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} className="peridot-control h-11" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-white/90">Routine Description</label>
                      <Textarea value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} className="peridot-control min-h-[120px]" rows={4} />
                    </div>
                    <div className="max-w-sm">
                      <label className="mb-2 block text-sm font-medium text-white/90">Category</label>
                      <select value={formData.category} onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))} className="peridot-control h-11 w-full px-3 outline-none">{categories.map((category) => <option key={category} value={category}>{formatLabel(category)}</option>)}</select>
        </div>
        </div>
        </div>
      </div>

              <div className="space-y-5 px-4 pb-5 sm:px-8 sm:pb-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Flows</h3>
                    <p className="mt-1 text-sm leading-6 text-white/60">Select a flow to edit it. The builder keeps one flow and one task open at a time so you are not buried in one long stack.</p>
                  </div>
                  <Button type="button" variant="ghost" onClick={addRegimen} className="h-10 w-full rounded-xl border border-emerald-200/30 bg-[#243126] px-4 !text-[#f7faef] hover:bg-[#2b392d] hover:!text-[#f7faef] [&_svg]:!text-[#f7faef] sm:w-auto"><Plus className="mr-2 h-4 w-4 !text-[#f7faef]" />Add Flow</Button>
                </div>
                {formData.regimens.map((regimen, regimenIndex) => {
                  const isActiveFlow = regimenIndex === activeRegimenIndex
                  const tintMeta = getRegimenTintMeta(regimen.colorTint)
                  const currentTint = getRegimenTint(regimen.colorTint)
                  const isCustomTint = !REGIMEN_TINTS.some((tint) => tint.value === currentTint)
                  const titledTasks = countFilledDraftTasks(regimen.tasks)

                  return (
                  <div
                    key={regimenIndex}
                    className={`peridot-panel p-5 transition-colors sm:p-6 ${isActiveFlow ? 'border-white/20 bg-white/[0.06]' : 'bg-white/[0.03]'}`}
                    style={isActiveFlow ? { boxShadow: `0 0 0 1px ${tintRgba(tintMeta.value, 0.22)} inset` } : undefined}
                  >
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <button type="button" onClick={() => selectRegimen(regimenIndex)} className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">Flow {regimenIndex + 1}</span>
                          <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/68">{formatLabel(regimen.cadence)}</span>
                          <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/68">{titledTasks}/{regimen.tasks.length} titled tasks</span>
                        </div>
                        <div className="mt-3 flex items-start gap-3">
                          <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tintMeta.value }} />
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-white">{getDraftRegimenTitle(regimen, regimenIndex)}</h4>
                            <p className="mt-2 text-sm text-white/55">{isActiveFlow ? 'Editing this flow now.' : getDraftRegimenDaySummary(regimen)}</p>
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateRegimenAt(regimenIndex)}
                          className="h-9 rounded-xl border border-emerald-200/30 bg-[#243126] px-3 !text-[#f7faef] hover:bg-[#2b392d] hover:!text-[#f7faef] [&_svg]:!text-[#f7faef]"
                        >
                          <Copy className="mr-2 h-4 w-4 !text-[#f7faef]" />
                          Duplicate
                        </Button>
                        {formData.regimens.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => removeRegimenAt(regimenIndex)} className="h-9 w-9 rounded-xl border border-emerald-200/30 bg-emerald-100/12 p-0 !text-[#f7faef] hover:bg-emerald-100/18 hover:!text-[#f7faef] [&_svg]:!text-[#f7faef]"><X className="h-4 w-4 !text-[#f7faef]" /></Button> : null}
                      </div>
                    </div>
                    {isActiveFlow ? (<>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-white/90">Flow Title</label><Input value={regimen.title} onChange={(event) => updateRegimen(regimenIndex, { title: event.target.value })} className="peridot-control h-11" /></div>
                      <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-white/90">Flow Description</label><Textarea value={regimen.description} onChange={(event) => updateRegimen(regimenIndex, { description: event.target.value })} className="peridot-control min-h-[110px]" rows={3} /></div>
                      <div><label className="mb-2 block text-sm font-medium text-white/90">Cadence</label><select value={regimen.cadence} onChange={(event) => updateRegimen(regimenIndex, { cadence: event.target.value })} className="peridot-control h-11 w-full px-3 outline-none">{cadenceOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></div>
                      <div><label className="mb-2 block text-sm font-medium text-white/90">Repeat</label><select value={regimen.recurrenceType} onChange={(event) => updateRegimen(regimenIndex, { recurrenceType: event.target.value })} className="peridot-control h-11 w-full px-3 outline-none">{recurrenceOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></div>
                      <div className="md:col-span-2">
                        <label className="mb-3 block text-sm font-medium text-white/90">Flow Tint</label>
                        <div className="flex flex-wrap gap-2">
                          {REGIMEN_TINTS.map((tint) => {
                            const selected = currentTint === tint.value
                            return (
                              <button
                                key={tint.value}
                                type="button"
                                onClick={() => updateRegimen(regimenIndex, { colorTint: tint.value })}
                                className={`rounded-xl border px-3 py-2 text-sm transition-colors ${selected ? 'border-white/30 text-white' : 'border-white/10 text-white/72 hover:border-white/20 hover:text-white'}`}
                                style={{
                                  backgroundColor: tintRgba(tint.value, selected ? 0.26 : 0.14),
                                  boxShadow: selected ? `0 0 0 1px ${tintRgba(tint.value, 0.45)} inset` : 'none',
                                }}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tint.value }} />
                                  {tint.label}
                                </span>
                              </button>
                            )
                          })}
                          <label
                            className={`relative inline-flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${isCustomTint ? 'border-white/30 text-white' : 'border-white/10 text-white/72 hover:border-white/20 hover:text-white'}`}
                            style={{
                              backgroundColor: tintRgba(currentTint, isCustomTint ? 0.26 : 0.14),
                              boxShadow: isCustomTint ? `0 0 0 1px ${tintRgba(currentTint, 0.45)} inset` : 'none',
                            }}
                          >
                            <input
                              type="color"
                              value={currentTint}
                              onChange={(event) => updateRegimen(regimenIndex, { colorTint: event.target.value.toUpperCase() })}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              aria-label="Choose custom flow tint"
                            />
                            <span className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: currentTint }} />
                              <span>Custom</span>
                            </span>
                            <span className="text-[11px] uppercase tracking-[0.16em] text-white/55">{currentTint}</span>
                          </label>
                        </div>
                        <p className="mt-3 text-sm text-white/55">Pick a preset tint or tap `Custom` to open the color wheel.</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-3 block text-sm font-medium text-white/90">Days Of Week</label>
                        <div className="flex flex-wrap gap-2">{weekdays.map((day) => { const selected = regimen.recurrenceDays.includes(day); return <button key={day} type="button" onClick={() => toggleRegimenDay(regimenIndex, day)} className={`px-3 py-2 text-sm ${selected ? 'peridot-chip-active' : 'peridot-chip'}`}>{selected ? `✓ ${formatWeekday(day)}` : formatWeekday(day)}</button> })}</div>
                      </div>
                      {regimen.recurrenceDays.length > 0 ? (
                        <div className="md:col-span-2 peridot-panel-deep p-4 sm:p-5">
                          <div className="mb-4">
                            <h6 className="text-sm font-semibold text-white">Times By Day</h6>
                            <p className="mt-1 text-sm leading-6 text-white/60">Each selected day can have its own time, and the calendar will place the flow block there automatically.</p>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {regimen.recurrenceDays.map((day) => (
                              <div key={day}>
                                <label className="mb-2 block text-sm font-medium text-white/90">{formatWeekday(day)}</label>
                                <Input type="time" value={regimen.recurrenceTimes[day] || '09:00'} onChange={(event) => updateRegimenTime(regimenIndex, day, event.target.value)} className="peridot-control h-11" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="peridot-panel-deep mt-6 space-y-5 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h5 className="text-sm font-semibold uppercase tracking-wide text-white/80">Tasks</h5>
                          <p className="mt-1 text-sm leading-6 text-white/60">Select a task to edit it. The rest stay compact so you can move through the flow faster.</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => addTaskToRegimen(regimenIndex)} className="h-9 w-full rounded-xl border border-emerald-200/30 bg-[#243126] px-3 !text-[#f7faef] hover:bg-[#2b392d] hover:!text-[#f7faef] [&_svg]:!text-[#f7faef] sm:w-auto"><Plus className="mr-2 h-3 w-3 !text-[#f7faef]" />Add Task</Button>
                      </div>
                      {regimen.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className={`peridot-panel-soft p-4 transition-colors sm:p-5 ${taskIndex === activeTaskIndex ? 'border-white/18 bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <button type="button" onClick={() => setActiveTaskIndex(taskIndex)} className="min-w-0 flex-1 text-left">
                              <h6 className="text-sm font-semibold text-white">Task {taskIndex + 1}</h6>
                              <p className="mt-1 text-sm text-white/55">{task.title.trim() || 'Select this task to add details and reference media.'}</p>
                            </button>
                            {regimen.tasks.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => removeTaskFromRegimen(regimenIndex, taskIndex)} className="h-9 w-9 rounded-xl border border-emerald-200/30 bg-emerald-100/12 p-0 !text-[#f7faef] hover:bg-emerald-100/18 hover:!text-[#f7faef] [&_svg]:!text-[#f7faef]"><X className="h-4 w-4 !text-[#f7faef]" /></Button> : null}
                          </div>
                          {taskIndex === activeTaskIndex ? <div className="grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-white/90">Task Title</label><Input value={task.title} onChange={(event) => updateTask(regimenIndex, taskIndex, { title: event.target.value })} className="peridot-control h-11" /></div>
                            <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-white/90">Task Description</label><Textarea value={task.description} onChange={(event) => updateTask(regimenIndex, taskIndex, { description: event.target.value })} className="peridot-control min-h-[120px]" rows={4} /></div>
                            <div><label className="mb-2 block text-sm font-medium text-white/90">Priority</label><select value={task.priority} onChange={(event) => updateTask(regimenIndex, taskIndex, { priority: event.target.value })} className="peridot-control h-11 w-full px-3 outline-none">{priorityOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></div>
                            <div><label className="mb-2 block text-sm font-medium text-white/90">Status</label><select value={task.status} onChange={(event) => updateTask(regimenIndex, taskIndex, { status: event.target.value })} className="peridot-control h-11 w-full px-3 outline-none">{statusOptions.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}</select></div>
                            <div className="md:max-w-sm"><label className="mb-2 block text-sm font-medium text-white/90">Schedule Label</label><Input value={task.dueLabel} onChange={(event) => updateTask(regimenIndex, taskIndex, { dueLabel: event.target.value })} className="peridot-control h-11" /></div>
                            <div className="md:col-span-2 peridot-panel-deep p-4 sm:p-5"><div className="mb-4"><h6 className="text-sm font-semibold text-white">Reference Media</h6><p className="mt-1 text-sm leading-6 text-white/60">YouTube, image, or any supporting link.</p></div><div className="grid gap-5 md:grid-cols-2"><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-white/90">Reference URL</label><Input value={task.referenceUrl} onChange={(event) => updateTask(regimenIndex, taskIndex, { referenceUrl: event.target.value })} className="peridot-control h-11" /></div><div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-white/90">Reference Label</label><Input value={task.referenceLabel} onChange={(event) => updateTask(regimenIndex, taskIndex, { referenceLabel: event.target.value })} className="peridot-control h-11" /></div></div>{task.referenceUrl.trim() ? <div className="mt-5"><ReferencePreview url={task.referenceUrl} label={task.referenceLabel} /></div> : null}</div>
                          </div> : <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/58"><span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">{formatLabel(task.priority)}</span><span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">{formatLabel(task.status)}</span>{task.dueLabel ? <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">{task.dueLabel}</span> : null}</div>}
                        </div>
                      ))}
                    </div>
                    </>) : null}
                  </div>
                  )
                })}
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-[#21342b] px-4 py-4 sm:flex-row sm:justify-end sm:px-8"><Button type="button" variant="ghost" onClick={closeBuilder} className="h-11 rounded-xl border border-emerald-200/30 bg-[#243126] px-4 !text-[#f7faef] hover:bg-[#2b392d] hover:!text-[#f7faef] [&_svg]:!text-[#f7faef]">Cancel</Button><Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl border border-emerald-300/20 bg-emerald-300 px-4 font-semibold text-[#162113] hover:bg-emerald-200">{isSubmitting ? (editingRoutineId ? 'Saving...' : 'Creating...') : (editingRoutineId ? 'Save Routine' : 'Create Routine')}</Button></div>
            </form>
          </section>
        ) : null}
        {!showCreateForm ? (
        <>
        <div className="order-1 mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="peridot-panel-soft peridot-stat-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="peridot-stat-label text-xs text-white/45">Total Routines</span>
              <Layers3 className="h-4 w-4 text-emerald-200/80" />
            </div>
            <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{routines.length}</div>
          </div>
          <div className="peridot-panel-soft peridot-stat-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="peridot-stat-label text-xs text-white/45">Active Routines</span>
              <PlayCircle className="h-4 w-4 text-emerald-200/80" />
            </div>
            <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{activeRoutines}</div>
          </div>
          <div className="peridot-panel-soft peridot-stat-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="peridot-stat-label text-xs text-white/45">Flows</span>
              <Calendar className="h-4 w-4 text-lime-200/80" />
            </div>
            <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{totalRegimens}</div>
          </div>
          <div className="peridot-panel-soft peridot-stat-card">
            <div className="mb-2 flex items-center justify-between">
              <span className="peridot-stat-label text-xs text-white/45">Total Tasks</span>
              <CheckSquare className="h-4 w-4 text-teal-200/80" />
            </div>
            <div className="peridot-stat-value text-2xl font-semibold text-white sm:text-3xl">{totalTasks}</div>
          </div>
        </div>

        <div className="order-2 mb-8">
          <Button onClick={openCreateRoutine} className="h-12 w-full justify-center rounded-2xl border border-emerald-300/25 bg-emerald-300 px-5 font-semibold text-emerald-950 shadow-[0_12px_36px_rgba(110,231,183,0.18)] hover:bg-emerald-200 sm:w-auto"><Plus className="mr-2 h-5 w-5" />Create Routine</Button>
        </div>

        <div className="order-4">
        {isLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-12 text-center text-white/65">
            Loading routines...
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-12 text-center">
            <p className="mb-6 text-white/65">{error}</p>
            <Button onClick={() => void loadWorkspace()} className="h-11 rounded-2xl border border-white/10 bg-white/10 px-5 text-white hover:bg-white/15">
              Try Again
            </Button>
          </div>
        ) : routines.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-emerald-300/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-12 text-center">
            <p className="mb-6 text-white/65">Create your first routine, then add flows and tasks inside it.</p>
            <Button onClick={openCreateRoutine} className="h-11 rounded-2xl border border-emerald-300/25 bg-emerald-300 px-5 font-semibold text-emerald-950 hover:bg-emerald-200">
              <Plus className="mr-2 h-5 w-5" />
              Create Routine
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {routines.map((routine) => (
              <div key={routine.id} className="overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="border-b border-white/10 bg-white/5 px-6 py-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setCollapsedRoutines((current) => ({ ...current, [routine.id]: !current[routine.id] }))}
                        className="flex w-full items-start gap-3 text-left text-white"
                      >
                        <span className="mt-0.5 rounded-2xl border border-white/10 bg-white/5 p-2">
                          {collapsedRoutines[routine.id] ? <ChevronDown className="h-4 w-4 text-white/70" /> : <ChevronUp className="h-4 w-4 text-white/70" />}
                        </span>
                        <div className="min-w-0">
                          <h4 className="peridot-display text-[1.4rem] font-semibold leading-tight tracking-tight sm:text-2xl">{routine.title}</h4>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="peridot-meta rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] text-emerald-100/80">
                              {formatLabel(routine.category)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="grid gap-3 xl:w-[28rem]">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-2.5">
                          <div className="peridot-display text-[1.35rem] leading-none text-white">{routine.regimens.length}</div>
                          <div className="peridot-meta mt-2 text-[10px] text-white/45">Flows</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-2.5">
                          <div className="peridot-display text-[1.35rem] leading-none text-white">{countTasks(routine.regimens)}</div>
                          <div className="peridot-meta mt-2 text-[10px] text-white/45">Tasks</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button type="button" variant="ghost" onClick={() => openEditRoutine(routine)} className="h-10 rounded-2xl border border-white/10 bg-white/5 px-2 text-white hover:bg-white/10">
                          <Pencil className="mr-1.5 h-4 w-4 shrink-0" />
                          Edit
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => void duplicateRoutine(routine)} disabled={duplicatingRoutineId === routine.id} className="h-10 rounded-2xl border border-white/10 bg-white/5 px-2 text-white hover:bg-white/10">
                          <Copy className="mr-1.5 h-4 w-4 shrink-0" />
                          {duplicatingRoutineId === routine.id ? 'Duplicating...' : 'Duplicate'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => void deleteRoutine(routine.id)} disabled={deletingRoutineId === routine.id} className="h-10 rounded-2xl border border-red-400/20 bg-red-400/10 px-2 text-red-100 hover:bg-red-400/15">
                          <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
                          {deletingRoutineId === routine.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {!collapsedRoutines[routine.id] ? (
                  <div className="space-y-5 p-6">
                    {routine.regimens.map((regimen) => {
                      const tintMeta = getRegimenTintMeta(regimen.colorTint)

                      return (
                      <div key={regimen.id} className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0f1714]">
                        <button
                          type="button"
                          onClick={() => setCollapsedRegimens((current) => ({ ...current, [regimen.id]: !current[regimen.id] }))}
                          className="flex w-full items-start justify-between gap-4 border-b border-white/10 bg-white/5 px-5 py-4 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tintMeta.value }} />
                              <div className="min-w-0">
                                <h5 className="text-lg font-semibold text-white">{regimen.title}</h5>
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
                                    {formatLabel(regimen.cadence)}
                                  </span>
                                  <span
                                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/85"
                                    style={{
                                      borderColor: tintRgba(tintMeta.value, 0.32),
                                      backgroundColor: tintRgba(tintMeta.value, 0.18),
                                    }}
                                  >
                                    {regimen.recurrenceType && regimen.recurrenceType !== 'NONE'
                                      ? `${formatLabel(regimen.recurrenceType)}${regimen.recurrenceDays ? ` · ${regimen.recurrenceDays.split(',').filter(Boolean).map(formatWeekday).join(', ')}` : ''}`
                                      : 'No Repeat'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="rounded-2xl border border-white/10 bg-white/5 p-2">
                            {collapsedRegimens[regimen.id] ? <ChevronDown className="h-4 w-4 text-white/70" /> : <ChevronUp className="h-4 w-4 text-white/70" />}
                          </span>
                        </button>

                        {!collapsedRegimens[regimen.id] ? (
                          <div className="space-y-4 p-5">
                            {regimen.description ? <p className="text-white/55">{regimen.description}</p> : null}
                            {regimen.tasks.map((task) => (
                              <div key={task.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="max-w-2xl">
                                    <h6 className="text-base font-semibold text-white">{task.title}</h6>
                                    <p className="mt-2 text-sm leading-6 text-white/60">{task.description || 'No task description yet.'}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span className="rounded-full bg-teal-300/12 px-3 py-1 text-xs uppercase tracking-[0.16em] text-teal-100">{formatLabel(task.priority)}</span>
                                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/70">{formatLabel(task.status)}</span>
                                    {task.dueLabel ? <span className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/70">{task.dueLabel}</span> : null}
                                  </div>
                                </div>
                                {task.referenceUrl ? <div><ReferencePreview url={task.referenceUrl} label={task.referenceLabel} /></div> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )})}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        </div>
        </>
        ) : null}
        </div>
      </div>
    </div>
  )
}
