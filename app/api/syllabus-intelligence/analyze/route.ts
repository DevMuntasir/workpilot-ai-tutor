import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export const runtime = 'nodejs'

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const geminiTextModel = process.env.GEMINI_TEXT_MODEL?.trim() || 'gemini-2.0-flash'

if (!geminiApiKey) {
  throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.')
}

const googleProvider = createGoogleGenerativeAI({ apiKey: geminiApiKey })

const MAX_CONTENT_LENGTH = 12000

type SemesterTimelineItem = {
  weekRange: string
  focus: string
  outcomes: string[]
}

type PriorityTopicItem = {
  topic: string
  reason: string
  priority: 'High' | 'Medium' | 'Low'
}

type CourseworkPlanItem = {
  task: string
  when: string
  effort: string
  tips: string
}

type SyllabusAnalysisPayload = {
  summary: string
  modules: Array<{
    title: string
    topics: string[]
    estimatedWeeks: number
  }>
  learningObjectives: string[]
  semesterTimeline: SemesterTimelineItem[]
  priorityTopics: PriorityTopicItem[]
  courseworkPlan: CourseworkPlanItem[]
}

type NormalizedModule = SyllabusAnalysisPayload['modules'][number]

function stripUnsupportedChars(text: string) {
  return text.replace(/\u0000/g, '')
}

function normalizeLine(value: unknown) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/^\s*[-*•]\s+/, '')
    .replace(/^\s*\d+[\)\.]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueMeaningfulLines(lines: string[]) {
  const seen = new Set<string>()
  const output: string[] = []

  for (const line of lines) {
    const normalized = normalizeLine(line)
    if (!normalized || normalized.length < 4) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    output.push(normalized)
  }

  return output
}

function buildWeekRange(start: number, end: number) {
  return start === end ? `Week ${start}` : `Weeks ${start}-${end}`
}

function chunkArray<T>(values: T[], chunkSize: number) {
  const chunks: T[][] = []
  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize))
  }
  return chunks
}

function buildFallbackAnalysis(content: string, semesterWeeks: number): SyllabusAnalysisPayload {
  const lines = uniqueMeaningfulLines(content.split(/[\n\.]/).map((segment) => segment.trim())).slice(0, 18)

  const moduleLines = lines.length ? lines : ['Core concepts', 'Applied practice', 'Revision and assessment']
  const groupedModules = chunkArray(moduleLines, Math.max(1, Math.ceil(moduleLines.length / 4))).slice(0, 4)
  const modules = groupedModules.map((group, index) => {
    const title = group[0] || `Module ${index + 1}`
    return {
      title: `Module ${index + 1}: ${title}`,
      topics: group.slice(0, 4),
      estimatedWeeks: Math.max(1, Math.round(semesterWeeks / Math.max(1, groupedModules.length))),
    }
  })

  const learningObjectives = moduleLines.slice(0, 6).map(
    (line) => `Explain and apply: ${line.charAt(0).toLowerCase()}${line.slice(1)}`
  )

  const phaseCount = 4
  const weeksPerPhase = Math.max(1, Math.floor(semesterWeeks / phaseCount))
  const semesterTimeline: SemesterTimelineItem[] = []
  for (let phase = 0; phase < phaseCount; phase += 1) {
    const startWeek = phase * weeksPerPhase + 1
    const endWeek = phase === phaseCount - 1 ? semesterWeeks : Math.min(semesterWeeks, (phase + 1) * weeksPerPhase)
    const focus = modules[phase]?.title ?? `Module ${phase + 1}`
    semesterTimeline.push({
      weekRange: buildWeekRange(startWeek, endWeek),
      focus,
      outcomes: [
        `Complete readings and notes for ${focus}.`,
        'Practice retrieval with quizzes or flashcards.',
        'Run a short weekly self-review checkpoint.',
      ],
    })
  }

  const priorityTopics = moduleLines.slice(0, 5).map((topic, index) => ({
    topic,
    reason: index < 2 ? 'Foundational topic that supports later modules.' : 'Likely to appear in core assessments.',
    priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low',
  })) as PriorityTopicItem[]

  const courseworkPlan: CourseworkPlanItem[] = [
    {
      task: 'Set up a weekly syllabus review block',
      when: 'Before each new week begins',
      effort: '45-60 minutes',
      tips: 'Preview lecture goals and list questions before class.',
    },
    {
      task: 'Build module study sheets',
      when: 'After each module',
      effort: '60-90 minutes',
      tips: 'Capture formulas, key terms, and common mistakes in one page.',
    },
    {
      task: 'Assignment milestone planning',
      when: 'At least 2 weeks before deadlines',
      effort: '30 minutes per assignment',
      tips: 'Split each assignment into research, draft, and revision checkpoints.',
    },
    {
      task: 'Exam sprint preparation',
      when: 'Final 3 weeks of semester',
      effort: '3 sessions per week',
      tips: 'Prioritize high-weight topics and timed practice questions.',
    },
  ]

  return {
    summary:
      lines.slice(0, 3).join(' ') ||
      'This syllabus outlines course scope, expectations, and assessment structure for the semester.',
    modules,
    learningObjectives,
    semesterTimeline,
    priorityTopics,
    courseworkPlan,
  }
}

function normalizePriority(value: unknown): 'High' | 'Medium' | 'Low' {
  if (typeof value !== 'string') return 'Medium'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'high') return 'High'
  if (normalized === 'low') return 'Low'
  return 'Medium'
}

function normalizeModelOutput(raw: unknown, fallback: SyllabusAnalysisPayload): SyllabusAnalysisPayload {
  if (!raw || typeof raw !== 'object') return fallback
  const source = raw as Record<string, unknown>

  const modules = Array.isArray(source.modules)
    ? source.modules
        .map((entry, index) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const title = normalizeLine(item.title) || `Module ${index + 1}`
          const topics = Array.isArray(item.topics)
            ? uniqueMeaningfulLines(item.topics.map((topic) => normalizeLine(topic))).slice(0, 6)
            : []
          return {
            title,
            topics: topics.length ? topics : [`Key idea from ${title}`],
            estimatedWeeks:
              typeof item.estimatedWeeks === 'number' && item.estimatedWeeks > 0
                ? Math.round(item.estimatedWeeks)
                : fallback.modules[Math.min(index, fallback.modules.length - 1)]?.estimatedWeeks ?? 2,
          }
        })
        .filter((entry): entry is NormalizedModule => Boolean(entry))
    : []

  const learningObjectives = Array.isArray(source.learningObjectives)
    ? uniqueMeaningfulLines(source.learningObjectives.map((value) => normalizeLine(value))).slice(0, 10)
    : []

  const semesterTimeline = Array.isArray(source.semesterTimeline)
    ? source.semesterTimeline
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const outcomes = Array.isArray(item.outcomes)
            ? uniqueMeaningfulLines(item.outcomes.map((value) => normalizeLine(value))).slice(0, 5)
            : []
          const weekRange = normalizeLine(item.weekRange)
          const focus = normalizeLine(item.focus)
          if (!weekRange || !focus) return null
          return {
            weekRange,
            focus,
            outcomes: outcomes.length ? outcomes : ['Review key concepts and complete practice.'],
          }
        })
        .filter((entry): entry is SemesterTimelineItem => Boolean(entry))
    : []

  const priorityTopics = Array.isArray(source.priorityTopics)
    ? source.priorityTopics
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const topic = normalizeLine(item.topic)
          const reason = normalizeLine(item.reason)
          if (!topic || !reason) return null
          return {
            topic,
            reason,
            priority: normalizePriority(item.priority),
          }
        })
        .filter((entry): entry is PriorityTopicItem => Boolean(entry))
    : []

  const courseworkPlan = Array.isArray(source.courseworkPlan)
    ? source.courseworkPlan
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null
          const item = entry as Record<string, unknown>
          const task = normalizeLine(item.task)
          if (!task) return null
          return {
            task,
            when: normalizeLine(item.when) || 'Throughout semester',
            effort: normalizeLine(item.effort) || 'Moderate',
            tips: normalizeLine(item.tips) || 'Break tasks into weekly milestones.',
          }
        })
        .filter((entry): entry is CourseworkPlanItem => Boolean(entry))
    : []

  return {
    summary: normalizeLine(source.summary) || fallback.summary,
    modules: modules.length ? modules : fallback.modules,
    learningObjectives: learningObjectives.length ? learningObjectives : fallback.learningObjectives,
    semesterTimeline: semesterTimeline.length ? semesterTimeline : fallback.semesterTimeline,
    priorityTopics: priorityTopics.length ? priorityTopics : fallback.priorityTopics,
    courseworkPlan: courseworkPlan.length ? courseworkPlan : fallback.courseworkPlan,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const titleInput = formData.get('title')
    const textInput = formData.get('text')
    const semesterWeeksInput = formData.get('semesterWeeks')

    const title =
      typeof titleInput === 'string' && titleInput.trim().length
        ? titleInput.trim()
        : 'Untitled Syllabus'

    const semesterWeeksRaw =
      typeof semesterWeeksInput === 'string' ? Number.parseInt(semesterWeeksInput, 10) : 16
    const semesterWeeks = Number.isFinite(semesterWeeksRaw)
      ? Math.max(8, Math.min(24, semesterWeeksRaw))
      : 16

    let content = typeof textInput === 'string' ? textInput : ''

    if (!content.trim()) {
      const files = formData.getAll('files') as File[]
      for (const file of files) {
        try {
          const text = await file.text()
          if (text.trim()) {
            content += `\n\n${file.name}:\n${text}`
          }
        } catch {
          continue
        }
      }
    }

    content = stripUnsupportedChars(content)

    if (!content.trim()) {
      return NextResponse.json({ error: 'No syllabus content provided.' }, { status: 400 })
    }

    const fallback = buildFallbackAnalysis(content, semesterWeeks)

    const prompt = `You are an expert academic planning assistant. Analyze this syllabus/course outline and return ONLY valid JSON (no markdown, no backticks).

Required JSON shape:
{
  "summary": "string",
  "modules": [
    {
      "title": "string",
      "topics": ["string"],
      "estimatedWeeks": 2
    }
  ],
  "learningObjectives": ["string"],
  "semesterTimeline": [
    {
      "weekRange": "Weeks 1-2",
      "focus": "string",
      "outcomes": ["string"]
    }
  ],
  "priorityTopics": [
    {
      "topic": "string",
      "reason": "string",
      "priority": "High"
    }
  ],
  "courseworkPlan": [
    {
      "task": "string",
      "when": "string",
      "effort": "string",
      "tips": "string"
    }
  ]
}

Rules:
- Keep summary concise (max 120 words).
- Include 4-8 modules.
- Include 5-10 learning objectives.
- Create timeline aligned to a ${semesterWeeks}-week semester.
- priority must be one of: High, Medium, Low.
- Focus on practical study planning for students.

Syllabus:
${content.slice(0, MAX_CONTENT_LENGTH)}`

    const result = await generateText({
      model: googleProvider(geminiTextModel),
      prompt,
      temperature: 0.4,
    })

    let parsed: unknown = null
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      }
    } catch {
      parsed = null
    }

    const normalized = normalizeModelOutput(parsed, fallback)

    return NextResponse.json({
      result: {
        id: randomUUID(),
        title,
        sourceLength: content.length,
        createdAt: new Date().toISOString(),
        ...normalized,
      },
    })
  } catch (error) {
    console.error('Error generating syllabus intelligence:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
