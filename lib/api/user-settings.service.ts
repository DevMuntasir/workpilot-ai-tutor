import { ApiClientError, apiClient } from '@/lib/api/client'

export const PERSONALIZATION_INSTRUCTIONS_MAX_LENGTH = 2500

export type PersonalizationProfileFieldKey =
  | 'learningStage'
  | 'learningGoal'
  | 'explanationDepth'
  | 'noteFormat'
  | 'exampleStyle'
  | 'practiceStyle'
  | 'studyPace'
  | 'tutorApproach'
  | 'tonePreference'

export type PersonalizationProfileFields = Partial<Record<PersonalizationProfileFieldKey, string>>

export type UpdatePersonalizationPayload = {
  instructions: string
} & PersonalizationProfileFields

export type PersonalizationProfile = {
  id: string | null
  instructions: string
  isActive: boolean
  moderationStatus: string | null
  moderationReason: string | null
} & PersonalizationProfileFields

export type PersonalizationSettings = {
  profile: PersonalizationProfile | null
  examples: string[]
  instructions: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function normalizeProfile(value: unknown): PersonalizationProfile | null {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  return {
    id: typeof record.id === 'string' ? record.id : null,
    instructions: typeof record.instructions === 'string' ? record.instructions : '',
    isActive: record.is_active === true,
    moderationStatus: typeof record.moderation_status === 'string' ? record.moderation_status : null,
    moderationReason: typeof record.moderation_reason === 'string' ? record.moderation_reason : null,
    learningStage: typeof record.learning_stage === 'string' ? record.learning_stage : undefined,
    learningGoal: typeof record.learning_goal === 'string' ? record.learning_goal : undefined,
    explanationDepth: typeof record.explanation_depth === 'string' ? record.explanation_depth : undefined,
    noteFormat: typeof record.note_format === 'string' ? record.note_format : undefined,
    exampleStyle: typeof record.example_style === 'string' ? record.example_style : undefined,
    practiceStyle: typeof record.practice_style === 'string' ? record.practice_style : undefined,
    studyPace: typeof record.study_pace === 'string' ? record.study_pace : undefined,
    tutorApproach: typeof record.tutor_approach === 'string' ? record.tutor_approach : undefined,
    tonePreference: typeof record.tone_preference === 'string' ? record.tone_preference : undefined,
  }
}

function normalizePersonalizationSettings(payload: unknown): PersonalizationSettings {
  const record = asRecord(payload)
  const profile = normalizeProfile(record?.profile ?? payload)
  const examples = Array.isArray(record?.examples)
    ? record.examples.filter((item): item is string => typeof item === 'string')
    : []

  return {
    profile,
    examples,
    instructions: profile?.instructions ?? '',
  }
}

export async function fetchPersonalization(signal?: AbortSignal) {
  const response = await apiClient.request<unknown>('/api/v1/personalization', { signal })

  return normalizePersonalizationSettings(response)
}

export async function updatePersonalization(
  payload: UpdatePersonalizationPayload,
  signal?: AbortSignal,
) {
  const instructions = payload.instructions.trim()

  if (instructions.length > PERSONALIZATION_INSTRUCTIONS_MAX_LENGTH) {
    throw new ApiClientError(
      `Instructions must be ${PERSONALIZATION_INSTRUCTIONS_MAX_LENGTH} characters or fewer.`,
    )
  }

  const body = {
    instructions,
    learning_stage: payload.learningStage,
    learning_goal: payload.learningGoal,
    explanation_depth: payload.explanationDepth,
    note_format: payload.noteFormat,
    example_style: payload.exampleStyle,
    practice_style: payload.practiceStyle,
    study_pace: payload.studyPace,
    tutor_approach: payload.tutorApproach,
    tone_preference: payload.tonePreference,
  }

  const response = await apiClient.request<unknown>('/api/v1/personalization', {
    method: 'PUT',
    body,
    signal,
  })

  return normalizePersonalizationSettings(response)
}
