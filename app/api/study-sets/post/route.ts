import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleGenAI, createPartFromBase64, createPartFromText } from '@google/genai'

export const runtime = 'nodejs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const geminiTextModel = process.env.GEMINI_TEXT_MODEL?.trim() || 'gemini-2.5-flash'
const geminiVisionModel = process.env.GEMINI_VISION_MODEL?.trim() || geminiTextModel

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
if (!supabaseServiceRoleKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
if (!geminiApiKey) {
  throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const googleGenAi = new GoogleGenAI({ vertexai: false, apiKey: geminiApiKey })

const MAX_CONTENT_LENGTH = 8000
const MAX_SOURCE_TEXT_LENGTH = 12000

const methodMetadata = {
  notes: {
    label: 'Notes',
    prompt:
      'Write an elegant, human-sounding set of study notes with meaningful headings and clear explanations.',
  },
  multipleChoice: {
    label: 'Multiple Choice',
    prompt: 'Write multiple choice questions with 4 options, indicate the correct option, and explain why.',
  },
  flashcards: {
    label: 'Flashcards',
    prompt: 'Create prompt/answer flashcards that reinforce key definitions or concepts.',
  },
  podcast: {
    label: 'Podcast',
    prompt: 'Outline conversational podcast segments with titles, durations, and main talking points.',
  },
  tutorLesson: {
    label: 'Tutor Lesson',
    prompt: 'Draft tutor-style question/answer dialogues plus follow-up prompts for deeper reasoning.',
  },
  writtenTests: {
    label: 'Written Tests',
    prompt: 'Provide written exam questions with ideal responses or grading rubrics.',
  },
  fillInTheBlanks: {
    label: 'Fill in the Blanks',
    prompt: 'Create cloze statements with a single blank, the correct answer, and a short explanation.',
  },
} as const

type OutputType = keyof typeof methodMetadata

type Section = {
  type: OutputType
  label: string
  items?: any[]
  format?: string
  content?: string
}

const aliasMap: Record<string, OutputType> = {
  notes: 'notes',
  note: 'notes',
  'multiple choice': 'multipleChoice',
  multiplechoice: 'multipleChoice',
  mcq: 'multipleChoice',
  flashcards: 'flashcards',
  flashcard: 'flashcards',
  cards: 'flashcards',
  podcast: 'podcast',
  audio: 'podcast',
  tutorlesson: 'tutorLesson',
  tutoring: 'tutorLesson',
  lesson: 'tutorLesson',
  written: 'writtenTests',
  writtentests: 'writtenTests',
  essay: 'writtenTests',
  fill: 'fillInTheBlanks',
  cloze: 'fillInTheBlanks',
  blanks: 'fillInTheBlanks',
}

function stripUnsupportedChars(text: string) {
  return text.replace(/\u0000/g, '')
}

function normalizeNoteLine(value: unknown) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/^\s*[-*•]\s+/, '')
    .replace(/^\s*\d+[\)\.]\s+/, '')
    .replace(/^\s*[A-Ha-h][\)\.]\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isMeaningfulNoteLine(value: string) {
  if (!value) return false
  if (value.length < 4) return false
  if (/^[A-Ha-h]$/.test(value)) return false
  return true
}

function uniqueMeaningfulLines(values: string[]) {
  const seen = new Set<string>()
  const lines: string[] = []

  for (const raw of values) {
    const normalized = normalizeNoteLine(raw)
    if (!isMeaningfulNoteLine(normalized)) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    lines.push(normalized)
  }

  return lines
}

function normalizeMethodId(value: unknown): OutputType | null {
  if (typeof value !== 'string') return null
  const key = value.trim().toLowerCase()
  if ((methodMetadata as Record<string, unknown>)[key]) {
    return key as OutputType
  }
  for (const alias of Object.keys(aliasMap)) {
    if (key === alias || key.startsWith(alias)) {
      return aliasMap[alias]
    }
  }
  return null
}

function parseRequestedMethods(input: FormDataEntryValue | null): OutputType[] {
  const allMethods = Object.keys(methodMetadata) as OutputType[]
  if (typeof input !== 'string' || !input.trim()) {
    return allMethods
  }

  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed)) {
      const mapped = parsed
        .map((entry) => normalizeMethodId(entry))
        .filter((entry): entry is OutputType => Boolean(entry))
      if (mapped.length) {
        return Array.from(new Set(mapped))
      }
    }
  } catch {
    // Ignore parsing errors and fall back to defaults.
  }

  return allMethods
}

function buildPrompt(content: string, methods: OutputType[], submissionTitle: string) {
  const requestedLines = methods
    .map((method) => `- ${methodMetadata[method].label}: ${methodMetadata[method].prompt}`)
    .join('\n')

  return `You are an experienced teacher and academic writer preparing polished study materials for a student.

Read the learner material below (truncated to ${MAX_CONTENT_LENGTH} characters) and produce structured study outputs ONLY for the requested methods.

Important writing rules for notes:
- Write with the warmth, clarity, and confidence of a skilled teacher.
- The writing must feel fully human, natural, and publication-ready.
- Never mention AI, assistant, generated content, prompt, extracted text, source extract, upload, or model.
- Do not use robotic transitions, repeated phrasing, or generic filler.
- Use elegant, meaningful section titles that sound like textbook or teacher-made note headings.
- Prefer short, well-shaped paragraphs over long dense blocks.
- Respond in the same language as the source text (Bangla for Bangla text, English for English text).
Study set title hint: ${submissionTitle}

Requested methods:
${requestedLines}

Return STRICT JSON with this structure (double quotes only, no explanations outside JSON):
{
  "title": "string",
  "summary": "string",
  "items": 12,
  "stats": {
    "unfamiliar": 12,
    "learning": 0,
    "familiar": 0,
    "mastered": 0
  },
  "sections": [
    {
      "type": "notes",
      "label": "Notes",
      "format": "markdown",
      "content": "# Title\\n\\n> Subtitle\\n\\nShort introduction...\\n\\n## Section Heading\\n\\nParagraph..."
    },
    {
      "type": "multipleChoice",
      "label": "Multiple Choice",
      "items": [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"],
          "answer": "B",
          "explanation": "Why this option is correct"
        }
      ]
    }
  ]
}

Rules:
- Provide one section per requested method using the matching "type" keys.
- If notes are requested, notes MUST be a single markdown string in section.content with "format": "markdown".
- Do NOT return any extra top-level notes object.
- Notes markdown structure: # title, > subtitle, short intro paragraph, 3-5 thematic ## sections, and a short key takeaway section.
- Use blockquote syntax (>) only once for a single-line subtitle placed directly under the # title.
- Avoid robotic bullet dumping; keep prose natural and readable.
- Non-note sections must use "items" arrays with at least 3 entries when possible.
- Flashcards use objects with "prompt", "answer", and optional "clue".
- Tutor lessons use objects with "prompt", "response", and "followUp".
- Written tests use objects with "prompt", "idealResponse", and optional "rubric".
- Podcast items include "title", "duration", and "talkingPoints" (array of strings).
- Fill in the blanks items include "sentence", "answer", and "explanation".
- Keep JSON compact and under 4500 characters.
Submission:
${content.substring(0, MAX_CONTENT_LENGTH)}`
}

function createSnippetBullets(content: string, fallback: string) {
  const segments = uniqueMeaningfulLines(
    content
    .split(/[\.\n]/)
    .map((segment) => segment.trim())
  )
    .filter(Boolean)
    .slice(0, 4)

  if (segments.length === 0) {
    segments.push(fallback)
  }

  while (segments.length < 3) {
    segments.push(`${fallback} (${segments.length + 1})`)
  }

  return segments
}

function createFallbackNotesMarkdown(title: string, summary: string, content: string) {
  const bullets = createSnippetBullets(content, 'Capture the most important idea from the uploaded material.')
  const markdownLines: string[] = [`# ${title}`, '', `> ${summary}`, '', bullets[0]]

  const extraBullets = bullets.slice(1, 4)
  for (let index = 0; index < extraBullets.length; index += 1) {
    markdownLines.push('', `## Key Insight ${index + 1}`, '', extraBullets[index])
  }

  markdownLines.push(
    '',
    '## Key Takeaway',
    '',
    'Review the notes once more, then move into practice mode with questions or flashcards.'
  )

  return markdownLines.join('\n').trim()
}

function createFallbackSection(method: OutputType, content: string): Section {
  const label = methodMetadata[method].label
  const bullets = createSnippetBullets(
    content,
    'Highlight the most important idea from the uploaded material.'
  )

  switch (method) {
    case 'notes':
      return {
        type: method,
        label,
        format: 'markdown',
        content: createFallbackNotesMarkdown(
          'Learning Notes',
          'A concise study overview based on your uploaded material.',
          content
        ),
      }
    case 'flashcards':
      return {
        type: method,
        label,
        items: bullets.map((line, idx) => ({
          prompt: line,
          answer: 'Use the uploaded material to explain this concept.',
          clue: `Key idea ${idx + 1}`,
        })),
      }
    case 'multipleChoice':
      return {
        type: method,
        label,
        items: bullets.map((line, idx) => ({
          question: `What is a core takeaway related to: ${line}?`,
          options: [
            'The main idea is unrelated.',
            'It reinforces a supporting detail.',
            'It summarizes a critical concept.',
            'It presents background trivia.',
          ],
          answer: 'It summarizes a critical concept.',
          explanation: 'The uploaded text emphasizes applied understanding of this takeaway.',
          id: idx + 1,
        })),
      }
    case 'podcast':
      return {
        type: method,
        label,
        items: bullets.map((line, idx) => ({
          title: `Segment ${idx + 1}`,
          duration: `${idx + 2} min`,
          talkingPoints: [line, 'Connect to real-world use', 'Provide a memorable story'],
        })),
      }
    case 'tutorLesson':
      return {
        type: method,
        label,
        items: bullets.map((line, idx) => ({
          prompt: `Tutor: Can you explain why "${line}" matters?`,
          response: 'Student should reference evidence from the uploaded content.',
          followUp: 'Ask for an analogy or personal example.',
          step: idx + 1,
        })),
      }
    case 'writtenTests':
      return {
        type: method,
        label,
        items: bullets.map((line, idx) => ({
          prompt: `Write a short response exploring: ${line}`,
          idealResponse: 'A cohesive paragraph citing two supporting details.',
          rubric: ['Thesis clarity', 'Evidence accuracy', 'Depth of insight'],
          number: idx + 1,
        })),
      }
    case 'fillInTheBlanks':
      return {
        type: method,
        label,
        items: bullets.map((line, idx) => ({
          sentence: `${line.replace(/([A-Za-z]+)/, '_____')} (${idx + 1})`,
          answer: 'Fill this blank with the main term.',
          explanation: 'Focus on the terminology highlighted in the uploaded content.',
        })),
      }
    default:
      return { type: method, label, items: bullets }
  }
}

function stringifyNoteItem(item: unknown) {
  if (typeof item === 'string') return item.trim()
  if (item && typeof item === 'object') {
    const source = item as any
    const prioritized =
      source.text ??
      source.lead ??
      source.prompt ??
      source.question ??
      source.answer ??
      source.response ??
      source.sentence
    if (typeof prioritized === 'string') {
      return prioritized.trim()
    }
  }

  if (item === null || item === undefined) return ''
  return String(item).trim()
}

function noteItemsToMarkdown(items: any[], title: string, summary: string) {
  const lines = uniqueMeaningfulLines(items.map((item) => stringifyNoteItem(item))).slice(0, 10)
  const intro = lines[0] || summary
  const middle = lines.slice(1, 6)

  const markdownLines: string[] = [`# ${title}`, '', `> ${summary}`, '', intro]
  for (let index = 0; index < middle.length; index += 1) {
    markdownLines.push('', `## Key Insight ${index + 1}`, '', middle[index])
  }
  markdownLines.push('', '## Key Takeaway', '', 'Review these notes and reinforce them with practice questions.')
  return markdownLines.join('\n').trim()
}

function sanitizeMarkdownContent(value: unknown) {
  if (typeof value !== 'string') return ''
  return stripUnsupportedChars(value).replace(/\r\n/g, '\n').trim()
}

function extractNotesMarkdownFromSections(sectionsInput: any, title: string, summary: string) {
  if (!Array.isArray(sectionsInput)) return ''

  for (const section of sectionsInput) {
    if (normalizeMethodId(section?.type) !== 'notes') continue

    const direct = sanitizeMarkdownContent(section?.content) || sanitizeMarkdownContent(section?.markdown)
    if (direct) return direct

    if (Array.isArray(section?.items) && section.items.length > 0) {
      return noteItemsToMarkdown(section.items, title, summary)
    }
  }

  return ''
}

function sanitizeSections(
  sectionsInput: any,
  requested: OutputType[],
  content: string,
  title: string,
  summary: string
): Section[] {
  const fallbackNotesMarkdown = createFallbackNotesMarkdown(title, summary, content)
  const sanitized: Section[] = []

  if (Array.isArray(sectionsInput)) {
    for (const section of sectionsInput) {
      const method = normalizeMethodId(section?.type)
      if (!method || !requested.includes(method)) continue

      const label =
        typeof section?.label === 'string' && section.label.trim()
          ? section.label.trim()
          : methodMetadata[method].label

      if (method === 'notes') {
        const sectionItems = Array.isArray(section?.items) ? section.items : []
        const notesMarkdown =
          sanitizeMarkdownContent(section?.content) ||
          sanitizeMarkdownContent(section?.markdown) ||
          (sectionItems.length ? noteItemsToMarkdown(sectionItems, title, summary) : '') ||
          fallbackNotesMarkdown

        sanitized.push({
          type: 'notes',
          label,
          format: 'markdown',
          content: notesMarkdown,
        })
        continue
      }

      const items = Array.isArray(section?.items) ? section.items.slice(0, 12) : []
      sanitized.push({ type: method, label, items })
    }
  }

  const seen = new Set(sanitized.map((section) => section.type))
  for (const method of requested) {
    if (!seen.has(method)) {
      if (method === 'notes') {
        sanitized.push({
          type: 'notes',
          label: methodMetadata.notes.label,
          format: 'markdown',
          content: fallbackNotesMarkdown,
        })
        continue
      }
      sanitized.push(createFallbackSection(method, content))
    }
  }

  return sanitized.map((section) => {
    if (section.type === 'notes') {
      const notesContent = sanitizeMarkdownContent(section.content)
      return {
        ...section,
        format: 'markdown',
        content: notesContent || fallbackNotesMarkdown,
      }
    }

    if (!Array.isArray(section.items) || section.items.length === 0) {
      return createFallbackSection(section.type, content)
    }

    return section
  })
}

function countItems(sections: Section[]) {
  return sections.reduce((sum, section) => {
    if (Array.isArray(section.items)) {
      return sum + section.items.length
    }
    if (section.type === 'notes' && typeof section.content === 'string' && section.content.trim()) {
      return sum + 1
    }
    return sum
  }, 0)
}

function buildStats(statsInput: any, totalItems: number) {
  if (statsInput && typeof statsInput === 'object') {
    const stats = {
      unfamiliar: Number((statsInput as any).unfamiliar) || 0,
      learning: Number((statsInput as any).learning) || 0,
      familiar: Number((statsInput as any).familiar) || 0,
      mastered: Number((statsInput as any).mastered) || 0,
    }
    if (stats.unfamiliar + stats.learning + stats.familiar + stats.mastered > 0) {
      return stats
    }
  }

  return {
    unfamiliar: totalItems,
    learning: Math.max(0, Math.round(totalItems * 0.2)),
    familiar: Math.max(0, Math.round(totalItems * 0.1)),
    mastered: 0,
  }
}

function parseStudySetResponse(text: string) {
  const candidates: string[] = []
  const seen = new Set<string>()
  const trimmed = text.trim()

  const pushCandidate = (candidate: string) => {
    const next = candidate.trim()
    if (!next || seen.has(next)) return
    seen.add(next)
    candidates.push(next)
  }

  const tryParseCandidate = (candidate: string) => {
    const relaxed = candidate.replace(/,\s*([}\]])/g, '$1')
    try {
      const parsed = JSON.parse(relaxed)
      if (parsed && typeof parsed === 'object') {
        const payload =
          typeof (parsed as any).studySet === 'object'
            ? (parsed as any).studySet
            : typeof (parsed as any).result === 'object'
              ? (parsed as any).result
              : parsed
        return payload
      }
    } catch {
      return null
    }

    return null
  }

  const extractBalancedJsonObjects = (source: string) => {
    const objects: string[] = []
    let depth = 0
    let start = -1
    let inString = false
    let escaped = false

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index]

      if (escaped) {
        escaped = false
        continue
      }

      if (inString && char === '\\') {
        escaped = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (inString) continue

      if (char === '{') {
        if (depth === 0) {
          start = index
        }
        depth += 1
        continue
      }

      if (char === '}') {
        if (depth === 0) continue
        depth -= 1
        if (depth === 0 && start >= 0) {
          objects.push(source.slice(start, index + 1))
          start = -1
        }
      }
    }

    return objects
  }

  if (trimmed) {
    pushCandidate(trimmed)
  }

  const fencedRegex = /```(?:json)?\s*([\s\S]*?)```/gi
  let fencedMatch: RegExpExecArray | null = null
  while ((fencedMatch = fencedRegex.exec(text)) !== null) {
    if (fencedMatch?.[1]) {
      pushCandidate(fencedMatch[1])
    }
  }

  for (const objectCandidate of extractBalancedJsonObjects(text)) {
    pushCandidate(objectCandidate)
  }

  for (const candidate of candidates) {
    const parsed = tryParseCandidate(candidate)
    if (parsed) return parsed
  }

  console.error('Failed to parse study set JSON from Gemini response.')
  return null
}

function isTextLikeFile(file: File) {
  return (
    file.type.startsWith('text/') ||
    /\.(txt|md|csv|json|xml|html?)$/i.test(file.name)
  )
}

function isVisionReadableFile(file: File) {
  return file.type.startsWith('image/') || file.type === 'application/pdf'
}

async function fileToBase64(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  return Buffer.from(arrayBuffer).toString('base64')
}

async function extractTextFromVisionFiles(files: File[]) {
  const parts = await Promise.all(
    files.map(async (file) => createPartFromBase64(await fileToBase64(file), file.type || 'application/octet-stream'))
  )

  const response = await googleGenAi.models.generateContent({
    model: geminiVisionModel,
    contents: [
      createPartFromText(
        'Transcribe the uploaded study materials into clean plain text. Preserve the language used in the source. If there are multiple files, combine them in a readable order. Do not add commentary. '
      ),
      ...parts,
    ],
    config: { temperature: 0.1 },
  })

  return response.text ?? ''
}

async function extractSubmissionContent(formData: FormData) {
  const textContent = formData.get('text')
  if (typeof textContent === 'string' && textContent.trim()) {
    return stripUnsupportedChars(textContent)
  }

  const files = formData.getAll('files') as File[]
  const textChunks: string[] = []
  const visionFiles: File[] = []

  for (const file of files) {
    if (isTextLikeFile(file)) {
      textChunks.push(await file.text())
      continue
    }

    if (isVisionReadableFile(file)) {
      visionFiles.push(file)
      continue
    }

    try {
      const fallbackText = await file.text()
      if (fallbackText.trim()) {
        textChunks.push(fallbackText)
      }
    } catch {
      // Ignore unsupported binary files for now.
    }
  }

  if (visionFiles.length > 0) {
    const extracted = await extractTextFromVisionFiles(visionFiles)
    if (extracted.trim()) {
      textChunks.push(extracted)
    }
  }

  return stripUnsupportedChars(textChunks.join('\n\n'))
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const titleInput = formData.get('title')
    const submissionTitle =
      typeof titleInput === 'string' && titleInput.trim().length
        ? titleInput.trim()
        : 'Untitled Study Set'

    const requestedMethods = parseRequestedMethods(formData.get('studyMethods'))
    const content = await extractSubmissionContent(formData)

    if (!content.trim()) {
      return NextResponse.json({ error: 'No content could be extracted from the upload.' }, { status: 400 })
    }

    const prompt = buildPrompt(content, requestedMethods, submissionTitle)
    const geminiResp = await googleGenAi.models.generateContent({
      model: geminiTextModel,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    })

    const responseText = geminiResp?.text ?? ''
    const parsed = parseStudySetResponse(responseText)
    const title =
      typeof parsed?.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : submissionTitle
    const summary =
      typeof parsed?.summary === 'string' && parsed.summary.trim()
        ? parsed.summary.trim()
        : `Prepared ${requestedMethods.length} study formats from your material.`

    const sections = sanitizeSections(parsed?.sections, requestedMethods, content, title, summary)
    const normalizedNotesMarkdown =
      extractNotesMarkdownFromSections(sections, title, summary) ||
      createFallbackNotesMarkdown(title, summary, content)
    const totalItems =
      parsed?.items && typeof parsed.items === 'number' ? parsed.items : countItems(sections)
    const stats = buildStats(parsed?.stats, totalItems)

    let studySetPayload = {
      id: randomUUID(),
      title,
      summary,
      selections: requestedMethods,
      sections,
      notesMarkdown: normalizedNotesMarkdown || undefined,
      sourceText: content.substring(0, MAX_SOURCE_TEXT_LENGTH),
      stats,
      items: totalItems,
      createdAt: new Date().toISOString(),
    }

    let warning: string | undefined
    const { data, error } = await supabase
      .from('grading_results')
      .insert({
        title: studySetPayload.title,
        content: content.substring(0, 10000),
        overall_score: totalItems,
        feedback: studySetPayload,
        strengths: requestedMethods,
        improvements: [],
        suggestions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Supabase warning while saving study set:', error)
      warning = error.message
    } else if (data?.[0]?.id) {
      studySetPayload = { ...studySetPayload, id: data[0].id }
    }

    return NextResponse.json({
      studySet: studySetPayload,
      ...(warning ? { warning } : {}),
    })
  } catch (err: any) {
    console.error('Error generating study set:', err)
    const isDev = process.env.NODE_ENV !== 'production'
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(isDev ? { details: String(err?.message || err) } : {}),
      },
      { status: 500 }
    )
  }
}
