import type { StudySetGenerateType } from '@/lib/api/study-sets.service'

export type StudySetUiSectionType =
  | 'notes'
  | 'multipleChoice'
  | 'flashcards'
  | 'podcast'
  | 'tutorLesson'
  | 'writtenTests'
  | 'fillInTheBlanks'

export const uiToBackendGenerationType: Record<StudySetUiSectionType, StudySetGenerateType> = {
  notes: 'notes',
  multipleChoice: 'multiple_choice',
  flashcards: 'flashcards',
  podcast: 'podcast',
  tutorLesson: 'tutor_lesson',
  writtenTests: 'written_test',
  fillInTheBlanks: 'fill_in_blanks',
}

export const uiSectionTypeLabels: Record<StudySetUiSectionType, string> = {
  notes: 'Notes',
  multipleChoice: 'Multiple Choice',
  flashcards: 'Flashcards',
  podcast: 'Podcast',
  tutorLesson: 'Tutor Lesson',
  writtenTests: 'Written Tests',
  fillInTheBlanks: 'Fill in the Blanks',
}

export const backendTaskTypeLabels: Record<StudySetGenerateType, string> = {
  notes: 'Notes',
  content: 'Content',
  tutor_lesson: 'Tutor Lesson',
  flashcards: 'Flashcards',
  multiple_choice: 'Multiple Choice',
  fill_in_blanks: 'Fill in the Blanks',
  written_test: 'Written Test',
  podcast: 'Podcast',
  quiz: 'Quiz',
}
// a

const backendToUiTaskTypeMap: Partial<Record<StudySetGenerateType, StudySetUiSectionType>> = {
  notes: 'notes',
  tutor_lesson: 'tutorLesson',
  flashcards: 'flashcards',
  multiple_choice: 'multipleChoice',
  fill_in_blanks: 'fillInTheBlanks',
  written_test: 'writtenTests',
  podcast: 'podcast',
  quiz: 'multipleChoice',
}

export function normalizeBackendTaskType(value: unknown): StudySetGenerateType | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (
    normalized === 'notes' ||
    normalized === 'content' ||
    normalized === 'tutor_lesson' ||
    normalized === 'flashcards' ||
    normalized === 'multiple_choice' ||
    normalized === 'fill_in_blanks' ||
    normalized === 'written_test' ||
    normalized === 'podcast' ||
    normalized === 'quiz'
  ) {
    return normalized as StudySetGenerateType
  }

  return null
}

export function toUiSectionType(taskType: unknown): StudySetUiSectionType | null {
  const normalizedTaskType = normalizeBackendTaskType(taskType)

  if (!normalizedTaskType) {
    return null
  }

  return backendToUiTaskTypeMap[normalizedTaskType] ?? null
}

export function getTaskTypeLabel(taskType: unknown) {
  const normalizedTaskType = normalizeBackendTaskType(taskType)

  if (!normalizedTaskType) {
    return 'Unknown'
  }

  return backendTaskTypeLabels[normalizedTaskType]
}

export function getOpenUiSectionLabel(sectionType: StudySetUiSectionType) {
  return `Open ${uiSectionTypeLabels[sectionType]}`
}
