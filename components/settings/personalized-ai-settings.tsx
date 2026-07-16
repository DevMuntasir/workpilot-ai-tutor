'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileUp, LoaderCircle, Sparkles, Trash2, UploadCloud } from 'lucide-react'

export type PersonalizationFieldKey =
  | 'origin'
  | 'interests'
  | 'hobby'
  | 'sports'
  | 'experience'
  | 'careerGoal'
  | 'connections'

export type PersonalizationDraft = Record<PersonalizationFieldKey, string>

export type WritingSample = {
  id: string
  name: string
  typeLabel: string
  content: string
}

type PersonalizedAiSettingsProps = {
  initialInstructions: string
  isLoading: boolean
  isSaving: boolean
  status: string | null
  onSave: (instructions: string) => Promise<void>
  onStatusChange: (status: string | null) => void
}

const defaultDraft: PersonalizationDraft = {
  origin: '',
  interests: '',
  hobby: '',
  sports: '',
  experience: '',
  careerGoal: '',
  connections: '',
}

const fieldLabels: Array<{ key: PersonalizationFieldKey; label: string; placeholder: string }> = [
  { key: 'origin', label: 'Where are you from?', placeholder: 'e.g. Dhaka, Bangladesh' },
  { key: 'interests', label: 'What are your interests?', placeholder: 'e.g. AI, writing, product design, startups' },
  { key: 'hobby', label: 'What are your hobbies?', placeholder: 'e.g. Reading, journaling, football, photography' },
  { key: 'sports', label: 'Do you play or follow sports?', placeholder: 'e.g. I enjoy football and cricket on weekends' },
  { key: 'experience', label: 'What experience should the AI know about?', placeholder: 'e.g. I have worked on content writing, tutoring, and student projects' },
  { key: 'careerGoal', label: 'What is your career goal?', placeholder: 'e.g. I want to become a product manager and grow into leadership' },
  { key: 'connections', label: 'Any important connections or context?', placeholder: 'e.g. I love collaborating with founders, tutors, and researchers' },
]

const inferWritingTypeLabel = (fileName: string) => {
  const normalized = fileName.toLowerCase()

  if (/essay|assignment|report/.test(normalized)) return 'Assignment / Essay'
  if (/email/.test(normalized)) return 'Email'
  if (/research|paper/.test(normalized)) return 'Research Paper'
  if (/journal|blog|personal|story/.test(normalized)) return 'Personal Writing'
  return 'Writing Sample'
}

const parseInitialInstructions = (instructions: string) => {
  const nextDraft: PersonalizationDraft = { ...defaultDraft }
  const extraLines: string[] = []

  instructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const normalizedLine = line.replace(/\s+/g, ' ')

      const matchedField = fieldLabels.find((field) => normalizedLine.startsWith(`${field.label}`))
      if (matchedField) {
        const value = normalizedLine.slice(matchedField.label.length).trim()
        nextDraft[matchedField.key] = value.replace(/^[-:–]\s*/, '')
        return
      }

      extraLines.push(line)
    })

  return {
    draft: nextDraft,
    extraInstructions: extraLines
      .filter((line) => !line.startsWith('AI Identity Profile:'))
      .filter((line) => !line.startsWith('Past writing samples for style cloning:'))
      .filter((line) => !line.startsWith('Additional response style guidance:'))
      .filter((line) => !line.startsWith('Sample:'))
      .join('\n\n'),
  }
}

const buildPersonalizationInstructionText = (draft: PersonalizationDraft, freeformInstructions: string, writingSamples: WritingSample[]) => {
  const sections = [] as string[]

  sections.push('AI Identity Profile:')

  fieldLabels.forEach((field) => {
    const value = draft[field.key].trim()
    if (value) {
      sections.push(`${field.label} ${value}`)
    }
  })

  if (freeformInstructions.trim()) {
    sections.push('Additional response style guidance:')
    sections.push(freeformInstructions.trim())
  }

  if (writingSamples.length > 0) {
    sections.push('Past writing samples for style cloning:')
    writingSamples.forEach((sample) => {
      const sampleText = sample.content.trim()
      if (!sampleText) {
        return
      }

      sections.push(`Sample: ${sample.name} (${sample.typeLabel})\n${sampleText}`)
    })
  }

  return sections.join('\n\n')
}

export default function PersonalizedAiSettings({
  initialInstructions,
  isLoading,
  isSaving,
  status,
  onSave,
  onStatusChange,
}: PersonalizedAiSettingsProps) {
  const [draft, setDraft] = useState<PersonalizationDraft>(defaultDraft)
  const [freeformInstructions, setFreeformInstructions] = useState(initialInstructions)
  const [writingSamples, setWritingSamples] = useState<WritingSample[]>([])
  const [isReadingFiles, setIsReadingFiles] = useState(false)

  useEffect(() => {
    const parsed = parseInitialInstructions(initialInstructions)
    setDraft(parsed.draft)
    setFreeformInstructions(parsed.extraInstructions)
  }, [initialInstructions])

  const canSave = useMemo(() => {
    const hasProfileAnswers = fieldLabels.some((field) => draft[field.key].trim().length > 0)
    const hasWritingSamples = writingSamples.length > 0
    const hasFreeformInstructions = freeformInstructions.trim().length > 0

    return hasProfileAnswers || hasWritingSamples || hasFreeformInstructions
  }, [draft, freeformInstructions, writingSamples])

  const updateFieldValue = (key: PersonalizationFieldKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
    onStatusChange(null)
  }

  const addWritingSamples = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    setIsReadingFiles(true)

    try {
      const nextSamples = await Promise.all(
        files.map(async (file) => {
          const content = await file.text()

          return {
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name,
            typeLabel: inferWritingTypeLabel(file.name),
            content,
          }
        }),
      )

      setWritingSamples((current) => [...nextSamples, ...current])
      onStatusChange(null)
    } catch {
      onStatusChange('We could not read one or more selected files. Please try text-based files.')
    } finally {
      setIsReadingFiles(false)
      event.target.value = ''
    }
  }

  const removeWritingSample = (id: string) => {
    setWritingSamples((current) => current.filter((sample) => sample.id !== id))
    onStatusChange(null)
  }

  const handleSave = async () => {
    const combinedInstructions = buildPersonalizationInstructionText(draft, freeformInstructions, writingSamples)
    if (!combinedInstructions.trim()) {
      return
    }

    await onSave(combinedInstructions)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Personalized AI</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Help the AI understand who you are, how you write, and what kind of response style fits you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fieldLabels.map((field) => (
          <label key={field.key} className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4">
            <span className="text-sm font-medium text-foreground">{field.label}</span>
            <textarea
              value={draft[field.key]}
              onChange={(event) => updateFieldValue(field.key, event.target.value)}
              rows={3}
              placeholder={field.placeholder}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </label>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Past Writing Upload</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload assignment, essay, email, research paper, or personal writing samples so the AI can mirror your style.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <UploadCloud className="h-4 w-4" />
            {isReadingFiles ? 'Reading...' : 'Upload Samples'}
            <input type="file" multiple className="hidden" accept=".txt,.md,.rtf,.doc,.docx,.pdf" onChange={addWritingSamples} />
          </label>
        </div>

        {writingSamples.length > 0 && (
          <div className="mt-4 space-y-2">
            {writingSamples.map((sample) => (
              <div key={sample.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{sample.name}</p>
                  <p className="text-xs text-muted-foreground">{sample.typeLabel}</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeWritingSample(sample.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={`Remove ${sample.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4">
        <label htmlFor="personalization-instructions" className="text-sm font-medium text-foreground">
          Additional response style instructions
        </label>
        <textarea
          id="personalization-instructions"
          value={freeformInstructions}
          onChange={(event) => {
            setFreeformInstructions(event.target.value)
            onStatusChange(null)
          }}
          disabled={isLoading}
          rows={6}
          placeholder="e.g. Explain concepts step by step, use simple language, and include examples."
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading your personalization profile...
        </p>
      )}

      {status && <p className="text-sm text-primary">{status}</p>}

      <button
        onClick={() => void handleSave()}
        disabled={!canSave || isSaving || isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isSaving ? 'Saving...' : 'Save Personalized AI Profile'}
      </button>
    </div>
  )
}
