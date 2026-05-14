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

type NormalizeSyllabusBackendOptions = {
  titleFallback?: string
  syllabusId?: string
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

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function getObjectValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (key in source) {
      return source[key]
    }
  }

  return undefined
}

function hasMeaningfulAnalysisFields(source: Record<string, unknown>) {
  return [
    'summary',
    'course_summary',
    'overview',
    'modules',
    'course_modules',
    'courseModules',
    'learningObjectives',
    'learning_objectives',
    'objectives',
    'semesterTimeline',
    'semester_timeline',
    'timeline',
    'priorityTopics',
    'priority_topics',
    'priorities',
    'courseworkPlan',
    'coursework_plan',
    'planning',
  ].some((key) => key in source)
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

  const source = payload as Record<string, unknown>

  const rawModules = getObjectValue(source, ['modules', 'course_modules', 'courseModules'])
  const modules = Array.isArray(rawModules)
    ? rawModules
        .map((entry: any, index: number) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const title = normalizeText(getObjectValue(item, ['title', 'name']), `Module ${index + 1}`)
          const topics = normalizeStringList(
            getObjectValue(item, ['topics', 'items', 'subtopics']),
            [`Key topic from ${title}`]
          )
          const estimatedWeeks = Math.max(
            1,
            normalizeNumber(getObjectValue(item, ['estimatedWeeks', 'estimated_weeks', 'weeks']), 2)
          )
          return { title, topics, estimatedWeeks }
        })
        .filter((entry: SyllabusModule | null): entry is SyllabusModule => Boolean(entry))
    : []

  const rawTimeline = getObjectValue(source, ['semesterTimeline', 'semester_timeline', 'timeline'])
  const semesterTimeline = Array.isArray(rawTimeline)
    ? rawTimeline
        .map((entry: any) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const weekRange = normalizeText(getObjectValue(item, ['weekRange', 'week_range', 'range']))
          const focus = normalizeText(getObjectValue(item, ['focus', 'title']))
          if (!weekRange || !focus) return null
          return {
            weekRange,
            focus,
            outcomes: normalizeStringList(
              getObjectValue(item, ['outcomes', 'items', 'goals']),
              ['Review and practice key concepts.']
            ),
          }
        })
        .filter(
          (entry: SemesterTimelineItem | null): entry is SemesterTimelineItem => Boolean(entry)
        )
    : []

  const rawPriorityTopics = getObjectValue(source, ['priorityTopics', 'priority_topics', 'priorities'])
  const priorityTopics = Array.isArray(rawPriorityTopics)
    ? rawPriorityTopics
        .map((entry: any) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const topic = normalizeText(getObjectValue(item, ['topic', 'title', 'name']))
          const reason = normalizeText(getObjectValue(item, ['reason', 'description']))
          if (!topic || !reason) return null
          return {
            topic,
            reason,
            priority: normalizePriority(getObjectValue(item, ['priority', 'level'])),
          }
        })
        .filter((entry: PriorityTopic | null): entry is PriorityTopic => Boolean(entry))
    : []

  const rawCourseworkPlan = getObjectValue(source, ['courseworkPlan', 'coursework_plan', 'planning'])
  const courseworkPlan = Array.isArray(rawCourseworkPlan)
    ? rawCourseworkPlan
        .map((entry: any) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const task = normalizeText(getObjectValue(item, ['task', 'title', 'name']))
          if (!task) return null
          return {
            task,
            when: normalizeText(getObjectValue(item, ['when', 'timing']), 'Throughout semester'),
            effort: normalizeText(getObjectValue(item, ['effort', 'load']), 'Moderate effort'),
            tips: normalizeText(getObjectValue(item, ['tips', 'description']), 'Break work into weekly milestones.'),
          }
        })
        .filter(
          (entry: CourseworkPlanItem | null): entry is CourseworkPlanItem => Boolean(entry)
        )
    : []

  return {
    id: normalizeText(getObjectValue(source, ['id', 'syllabus_id']), generateId()),
    title: normalizeText(getObjectValue(source, ['title', 'course_title']), titleFallback),
    summary: normalizeText(
      getObjectValue(source, ['summary', 'course_summary', 'overview']),
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
    learningObjectives: normalizeStringList(getObjectValue(source, ['learningObjectives', 'learning_objectives', 'objectives']), [
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
      normalizeNumber(getObjectValue(source, ['sourceLength', 'source_length', 'character_count']), 0) > 0
        ? normalizeNumber(getObjectValue(source, ['sourceLength', 'source_length', 'character_count']), 0)
        : 0,
    createdAt: normalizeText(
      getObjectValue(source, ['createdAt', 'created_at', 'processed_at']),
      new Date().toISOString()
    ),
  }
}

export function normalizeSyllabusBackendResultPayload(
  payload: unknown,
  options: NormalizeSyllabusBackendOptions = {}
) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const source = payload as Record<string, unknown>
  const candidate =
    (getObjectValue(source, ['result', 'summary_result', 'summaryResult', 'payload', 'data']) as
      | Record<string, unknown>
      | undefined) ?? source

  if (!hasMeaningfulAnalysisFields(candidate)) {
    return null
  }

  const normalized = normalizeSyllabusResultPayload(candidate, options.titleFallback)

  if (!normalized) {
    return null
  }

  if (options.syllabusId && !normalized.id) {
    normalized.id = options.syllabusId
  }

  if (options.syllabusId && normalized.id !== options.syllabusId) {
    normalized.id = normalizeText(
      getObjectValue(candidate as Record<string, unknown>, ['syllabus_id', 'id']),
      options.syllabusId
    )
  }

  return normalized
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
