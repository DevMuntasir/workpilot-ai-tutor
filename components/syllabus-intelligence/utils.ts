'use client'

export type PriorityLevel = 'High' | 'Medium' | 'Low'

export type SyllabusModule = {
  title: string
  topics: string[]
  estimatedWeeks: number
}

export type SemesterTimelineItem = {
  weekRange: string
  focus: string
  outcomes: string[]
}

export type PriorityTopic = {
  topic: string
  reason: string
  priority: PriorityLevel
}

export type CourseworkPlanItem = {
  task: string
  when: string
  effort: string
  tips: string
}

export type SyllabusIntelligenceResult = {
  id: string
  title: string
  summary: string
  modules: SyllabusModule[]
  learningObjectives: string[]
  semesterTimeline: SemesterTimelineItem[]
  priorityTopics: PriorityTopic[]
  courseworkPlan: CourseworkPlanItem[]
  sourceLength: number
  createdAt: string
}

const STORAGE_KEY = 'Tutora-syllabus-intelligence-results'

function normalizeText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback
  const text = value.trim()
  return text || fallback
}

function normalizePriority(value: unknown): PriorityLevel {
  if (typeof value !== 'string') return 'Medium'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'high') return 'High'
  if (normalized === 'low') return 'Low'
  return 'Medium'
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback
  const list = value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item))
  return list.length ? list : fallback
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function normalizeSyllabusResultPayload(
  payload: any,
  titleFallback = 'Untitled Syllabus'
): SyllabusIntelligenceResult | null {
  if (!payload || typeof payload !== 'object') return null

  const modules = Array.isArray(payload.modules)
    ? payload.modules
        .map((entry: any, index: number) => {
          if (!entry || typeof entry !== 'object') return null
          const title = normalizeText(entry.title, `Module ${index + 1}`)
          const topics = normalizeStringList(entry.topics, [`Key topic from ${title}`])
          const estimatedWeeks =
            typeof entry.estimatedWeeks === 'number' && entry.estimatedWeeks > 0
              ? Math.round(entry.estimatedWeeks)
              : 2
          return { title, topics, estimatedWeeks }
        })
        .filter((entry: SyllabusModule | null): entry is SyllabusModule => Boolean(entry))
    : []

  const semesterTimeline = Array.isArray(payload.semesterTimeline)
    ? payload.semesterTimeline
        .map((entry: any) => {
          if (!entry || typeof entry !== 'object') return null
          const weekRange = normalizeText(entry.weekRange)
          const focus = normalizeText(entry.focus)
          if (!weekRange || !focus) return null
          return {
            weekRange,
            focus,
            outcomes: normalizeStringList(entry.outcomes, ['Review and practice key concepts.']),
          }
        })
        .filter(
          (entry: SemesterTimelineItem | null): entry is SemesterTimelineItem => Boolean(entry)
        )
    : []

  const priorityTopics = Array.isArray(payload.priorityTopics)
    ? payload.priorityTopics
        .map((entry: any) => {
          if (!entry || typeof entry !== 'object') return null
          const topic = normalizeText(entry.topic)
          const reason = normalizeText(entry.reason)
          if (!topic || !reason) return null
          return {
            topic,
            reason,
            priority: normalizePriority(entry.priority),
          }
        })
        .filter((entry: PriorityTopic | null): entry is PriorityTopic => Boolean(entry))
    : []

  const courseworkPlan = Array.isArray(payload.courseworkPlan)
    ? payload.courseworkPlan
        .map((entry: any) => {
          if (!entry || typeof entry !== 'object') return null
          const task = normalizeText(entry.task)
          if (!task) return null
          return {
            task,
            when: normalizeText(entry.when, 'Throughout semester'),
            effort: normalizeText(entry.effort, 'Moderate effort'),
            tips: normalizeText(entry.tips, 'Break work into weekly milestones.'),
          }
        })
        .filter(
          (entry: CourseworkPlanItem | null): entry is CourseworkPlanItem => Boolean(entry)
        )
    : []

  return {
    id: normalizeText(payload.id, generateId()),
    title: normalizeText(payload.title, titleFallback),
    summary: normalizeText(
      payload.summary,
      'A structured course overview with module breakdown and semester roadmap.'
    ),
    modules:
      modules.length > 0
        ? modules
        : [
            {
              title: 'Module 1',
              topics: ['Course foundations'],
              estimatedWeeks: 2,
            },
          ],
    learningObjectives: normalizeStringList(payload.learningObjectives, [
      'Identify key ideas and learning outcomes for the course.',
    ]),
    semesterTimeline:
      semesterTimeline.length > 0
        ? semesterTimeline
        : [
            {
              weekRange: 'Weeks 1-2',
              focus: 'Course orientation',
              outcomes: ['Review syllabus and define study goals.'],
            },
          ],
    priorityTopics:
      priorityTopics.length > 0
        ? priorityTopics
        : [
            {
              topic: 'Foundational concepts',
              reason: 'Understanding these unlocks later modules.',
              priority: 'High',
            },
          ],
    courseworkPlan:
      courseworkPlan.length > 0
        ? courseworkPlan
        : [
            {
              task: 'Plan weekly revision blocks',
              when: 'Start of each week',
              effort: '45 minutes',
              tips: 'Schedule fixed slots and track completion.',
            },
          ],
    sourceLength:
      typeof payload.sourceLength === 'number' && payload.sourceLength > 0
        ? Math.round(payload.sourceLength)
        : 0,
    createdAt: normalizeText(payload.createdAt, new Date().toISOString()),
  }
}

function readStoredResults(): SyllabusIntelligenceResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => normalizeSyllabusResultPayload(entry))
      .filter((entry): entry is SyllabusIntelligenceResult => Boolean(entry))
  } catch {
    return []
  }
}

function writeStoredResults(results: SyllabusIntelligenceResult[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
  } catch {
    // ignore local storage write errors
  }
}

export function getStoredSyllabusResults() {
  return readStoredResults()
}

export function persistSyllabusResult(result: SyllabusIntelligenceResult) {
  if (typeof window === 'undefined') return []
  const current = readStoredResults()
  const index = current.findIndex((entry) => entry.id === result.id)
  if (index >= 0) {
    current[index] = result
  } else {
    current.unshift(result)
  }
  writeStoredResults(current)
  return current
}
