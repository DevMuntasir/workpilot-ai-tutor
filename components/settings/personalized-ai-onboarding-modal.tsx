'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CircleCheck, LoaderCircle, Sparkles, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getApiClientErrorMessage } from '@/lib/api'
import {
  buildLearningPreferenceInstructions,
  emptyLearningPreferences,
  learningPreferenceQuestions,
  type LearningPreferences,
} from './personalized-ai-preferences'

export type PersonalizationOnboardingDraft = LearningPreferences

type PersonalizationOnboardingModalProps = {
  onClose: () => void
}

export default function PersonalizedAiOnboardingModal({ onClose }: PersonalizationOnboardingModalProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [draft, setDraft] = useState<PersonalizationOnboardingDraft>(emptyLearningPreferences)
  const [isSaving, setIsSaving] = useState(false)

  const step = learningPreferenceQuestions[currentStep]
  const selectedValue = draft[step.id]
  const isLastStep = currentStep === learningPreferenceQuestions.length - 1
  const canContinue = useMemo(() => Boolean(selectedValue), [selectedValue])

  const selectOption = (value: string) => {
    setDraft((current) => ({ ...current, [step.id]: value }))
  }

  const handleFinish = async () => {
    const instructions = buildLearningPreferenceInstructions(draft)
    if (!instructions) return

    setIsSaving(true)

    try {
      const { updatePersonalization } = await import('@/lib/api')
      await updatePersonalization({ instructions, ...draft })
      onClose()
    } catch (error) {
      toast({
        title: 'Unable to save learning preferences',
        description: getApiClientErrorMessage(error, 'Your Personalized AI profile could not be saved.'),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-60 bg-[#03110c]/85 p-0 sm:p-4" onClick={onClose} role="presentation">
      <div
        className="mx-auto flex h-full w-full max-w-xl flex-col overflow-hidden bg-[#07120e] shadow-2xl sm:h-[min(92vh,760px)] sm:rounded-3xl sm:border sm:border-emerald-950"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Personalized AI onboarding"
      >
        <div className="px-4 pt-5 sm:px-6">
          <div className="flex items-center gap-2">
            {learningPreferenceQuestions.map((item, index) => (
              <span
                key={item.id}
                className={`h-1 flex-1 rounded-full ${index <= currentStep ? 'bg-emerald-400' : 'bg-emerald-950'}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-medium tracking-wide text-emerald-400">STEP {currentStep + 1} OF {learningPreferenceQuestions.length}</p>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-emerald-100/70 hover:bg-emerald-950 hover:text-emerald-100" aria-label="Close onboarding modal">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-6 sm:px-6">
          <p className="text-sm font-bold tracking-wide text-emerald-400">{step.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-emerald-50 sm:text-4xl">{step.question}</h2>
          <p className="mt-3 max-w-lg text-base leading-7 text-emerald-100/55">{step.description}</p>

          <div className="mt-8 space-y-3">
            {step.options.map((option) => {
              const Icon = option.icon
              const isSelected = option.label === selectedValue

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => selectOption(option.label)}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/80 ring-1 ring-emerald-400'
                      : 'border-emerald-950 bg-emerald-950/30 hover:border-emerald-800 hover:bg-emerald-950/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-emerald-200/45'}`}>
                    {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-[#07120e]" />}
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/45 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-base font-semibold text-emerald-50">{option.label}</span>
                  {isSelected && <CircleCheck className="h-5 w-5 shrink-0 text-emerald-400" />}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-emerald-950 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setCurrentStep((current) => Math.max(0, current - 1))}
            disabled={currentStep === 0 || isSaving}
            className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-100/70 hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={() => void handleFinish()}
              disabled={!canContinue || isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#062116] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isSaving ? 'Saving...' : 'Set up my AI'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep((current) => Math.min(learningPreferenceQuestions.length - 1, current + 1))}
              disabled={!canContinue || isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#062116] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
