import type { ComponentType } from 'react'
import {
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CircleCheck,
  GraduationCap,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
  MessagesSquare,
  NotebookTabs,
  Sparkles,
  Target,
  Timer,
  type LucideProps,
} from 'lucide-react'

export type LearningPreferenceKey =
  | 'learningStage'
  | 'learningGoal'
  | 'explanationDepth'
  | 'noteFormat'
  | 'exampleStyle'
  | 'practiceStyle'
  | 'studyPace'
  | 'tutorApproach'
  | 'tonePreference'

export type LearningPreferences = Record<LearningPreferenceKey, string>

export type LearningPreferenceOption = {
  label: string
  icon: ComponentType<LucideProps>
}

export type LearningPreferenceQuestion = {
  id: LearningPreferenceKey
  eyebrow: string
  question: string
  description: string
  options: LearningPreferenceOption[]
}

export const learningPreferenceQuestions: LearningPreferenceQuestion[] = [
  {
    id: 'learningStage',
    eyebrow: 'YOUR LEARNING STAGE',
    question: 'Where are you in your learning journey?',
    description: 'This helps the AI choose the right starting point and vocabulary.',
    options: [
      { label: 'School student', icon: GraduationCap },
      { label: 'University student', icon: BookOpen },
      { label: 'Early-career professional', icon: BriefcaseBusiness },
      { label: 'Advanced learner', icon: Brain },
      { label: 'Career switcher', icon: Target },
    ],
  },
  {
    id: 'learningGoal',
    eyebrow: 'YOUR MAIN GOAL',
    question: 'What do you usually want to achieve?',
    description: 'Your goal guides what the AI emphasizes in every study resource.',
    options: [
      { label: 'Understand a topic deeply', icon: Brain },
      { label: 'Prepare for exams', icon: Target },
      { label: 'Complete assignments', icon: NotebookTabs },
      { label: 'Build practical skills', icon: BriefcaseBusiness },
      { label: 'Revise quickly', icon: Timer },
    ],
  },
  {
    id: 'explanationDepth',
    eyebrow: 'EXPLANATION DEPTH',
    question: 'How detailed should explanations be?',
    description: 'The AI will match the level of detail to the way you prefer to learn.',
    options: [
      { label: 'Simple overview', icon: Sparkles },
      { label: 'Balanced explanation', icon: ListChecks },
      { label: 'Detailed breakdown', icon: NotebookTabs },
      { label: 'Advanced and technical', icon: Brain },
      { label: 'Start simple, then build up', icon: Target },
    ],
  },
  {
    id: 'noteFormat',
    eyebrow: 'NOTE FORMAT',
    question: 'Which type of notes help you most?',
    description: 'This choice shapes generated notes, summaries, and revision guides.',
    options: [
      { label: 'Concise bullet notes', icon: ListChecks },
      { label: 'Structured headings and sections', icon: NotebookTabs },
      { label: 'Step-by-step study guide', icon: CircleCheck },
      { label: 'Comparisons and tables in text', icon: MessagesSquare },
      { label: 'Exam-focused key points', icon: Target },
    ],
  },
  {
    id: 'exampleStyle',
    eyebrow: 'LEARNING AIDS',
    question: 'What makes a new idea click for you?',
    description: 'The AI will use this style when it explains difficult concepts.',
    options: [
      { label: 'Real-world examples', icon: BriefcaseBusiness },
      { label: 'Simple analogies', icon: Lightbulb },
      { label: 'Worked examples', icon: CircleCheck },
      { label: 'Diagrams and tables described in text', icon: MessagesSquare },
      { label: 'Clear definitions first', icon: BookOpen },
    ],
  },
  {
    id: 'practiceStyle',
    eyebrow: 'PRACTICE STYLE',
    question: 'How do you prefer to test your understanding?',
    description: 'This guides the mix of quizzes, flashcards, and practice questions.',
    options: [
      { label: 'Quick recall and flashcards', icon: Sparkles },
      { label: 'Multiple-choice questions', icon: ListChecks },
      { label: 'Short-answer practice', icon: MessageCircleQuestion },
      { label: 'Detailed written practice', icon: NotebookTabs },
      { label: 'A mixed practice set', icon: Target },
    ],
  },
  {
    id: 'studyPace',
    eyebrow: 'STUDY PACE',
    question: 'What pace works best for you?',
    description: 'The AI will adjust how much it introduces at once and how it checks progress.',
    options: [
      { label: 'Quick and focused', icon: Timer },
      { label: 'Balanced pace', icon: ListChecks },
      { label: 'Slow and guided', icon: CircleCheck },
      { label: 'Challenge me when I am ready', icon: Target },
      { label: 'Flexible, based on the topic', icon: Sparkles },
    ],
  },
  {
    id: 'tutorApproach',
    eyebrow: 'TUTOR APPROACH',
    question: 'How should your AI tutor help?',
    description: 'This sets how the tutor explains, asks questions, and supports you.',
    options: [
      { label: 'Ask guiding questions', icon: MessageCircleQuestion },
      { label: 'Explain first, then test me', icon: CircleCheck },
      { label: 'Coach me step by step', icon: NotebookTabs },
      { label: 'Give direct answers when needed', icon: Sparkles },
      { label: 'Encourage reflection and self-checking', icon: Lightbulb },
    ],
  },
  {
    id: 'tonePreference',
    eyebrow: 'CONVERSATION TONE',
    question: 'What tone feels most helpful?',
    description: 'One final choice, then your Personalized AI will be ready.',
    options: [
      { label: 'Friendly and encouraging', icon: Sparkles },
      { label: 'Calm and patient', icon: CircleCheck },
      { label: 'Professional and focused', icon: BriefcaseBusiness },
      { label: 'Energetic and motivating', icon: Target },
      { label: 'Direct and concise', icon: ListChecks },
    ],
  },
]

export const emptyLearningPreferences = (): LearningPreferences => ({
  learningStage: '',
  learningGoal: '',
  explanationDepth: '',
  noteFormat: '',
  exampleStyle: '',
  practiceStyle: '',
  studyPace: '',
  tutorApproach: '',
  tonePreference: '',
})

export const buildLearningPreferenceInstructions = (preferences: LearningPreferences, extraInstructions = '') => {
  const labels: Record<LearningPreferenceKey, string> = {
    learningStage: 'Learning stage',
    learningGoal: 'Primary goal',
    explanationDepth: 'Explanation depth',
    noteFormat: 'Preferred note format',
    exampleStyle: 'Preferred learning aid',
    practiceStyle: 'Preferred practice style',
    studyPace: 'Study pace',
    tutorApproach: 'Tutor approach',
    tonePreference: 'Preferred tone',
  }

  const profileLines = (Object.keys(labels) as LearningPreferenceKey[])
    .filter((key) => preferences[key].trim())
    .map((key) => `${labels[key]}: ${preferences[key].trim()}`)

  if (extraInstructions.trim()) {
    profileLines.push(`Additional guidance: ${extraInstructions.trim()}`)
  }

  return profileLines.join('\n')
}
