'use client'

import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import {
  emptyLearningPreferences,
  learningPreferenceQuestions,
  type LearningPreferences,
} from './personalized-ai-preferences'

type PersonalizedAiSettingsProps = {
  initialInstructions: string
  initialPreferences: LearningPreferences
  isLoading: boolean
  isSaving: boolean
  status: string | null
  onSave: (preferences: LearningPreferences, extraInstructions: string) => Promise<void>
  onStatusChange: (status: string | null) => void
}

export default function PersonalizedAiSettings({
  initialInstructions,
  initialPreferences,
  isLoading,
  isSaving,
  status,
  onSave,
  onStatusChange,
}: PersonalizedAiSettingsProps) {
  const [preferences, setPreferences] = useState<LearningPreferences>(emptyLearningPreferences)
  const [extraInstructions, setExtraInstructions] = useState(initialInstructions)

  useEffect(() => {
    setPreferences({ ...emptyLearningPreferences(), ...initialPreferences })
    setExtraInstructions(initialInstructions)
  }, [initialInstructions, initialPreferences])

  const canSave = useMemo(
    () => Object.values(preferences).some((value) => value.trim()) || extraInstructions.trim().length > 0,
    [extraInstructions, preferences],
  )

  const updatePreference = (key: keyof LearningPreferences, value: string) => {
    setPreferences((current) => ({ ...current, [key]: value }))
    onStatusChange(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Personalized AI</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how your AI should explain, organize, and practice material across notes, summaries, quizzes, and tutor lessons.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {learningPreferenceQuestions.map((question) => (
          <label key={question.id} className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4">
            <span className="block text-xs font-bold tracking-wide text-primary">{question.eyebrow}</span>
            <span className="block text-sm font-semibold text-foreground">{question.question}</span>
            <select
              value={preferences[question.id]}
              onChange={(event) => updatePreference(question.id, event.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Choose an option</option>
              {question.options.map((option) => (
                <option key={option.label} value={option.label}>{option.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4">
        <label htmlFor="personalization-instructions" className="text-sm font-medium text-foreground">
          Additional guidance
        </label>
        <textarea
          id="personalization-instructions"
          value={extraInstructions}
          onChange={(event) => {
            setExtraInstructions(event.target.value)
            onStatusChange(null)
          }}
          disabled={isLoading}
          rows={5}
          placeholder="Optional: add anything else that makes learning easier for you."
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading your learning preferences...
        </p>
      )}

      {status && <p className="text-sm text-primary">{status}</p>}

      <button
        type="button"
        onClick={() => void onSave(preferences, extraInstructions)}
        disabled={!canSave || isSaving || isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isSaving ? 'Saving...' : 'Save Learning Preferences'}
      </button>
    </div>
  )
}
