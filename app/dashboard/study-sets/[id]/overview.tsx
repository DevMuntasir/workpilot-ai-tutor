'use client'

import { AlertCircle, CheckCircle2, Edit3, FileText, GraduationCap, Headphones, Layers, ListChecks, LoaderCircle, PenSquare, Sparkles, RotateCw } from 'lucide-react'
import type { StudySet } from '@/components/study-sets/utils'
import type { StoredStudySetGenerationMeta } from '@/lib/api/study-sets.storage'
import { type StudySetUiSectionType, toUiSectionType, uiSectionTypeLabels } from '@/components/study-sets/generation-mapping'

type CardStatus = 'ready' | 'generating' | 'fetching' | 'failed'

function getCardStatus(
  sectionType: StudySetUiSectionType,
  studySet: StudySet | null,
  generationMeta: StoredStudySetGenerationMeta | null,
): CardStatus {
  if (!generationMeta) {
    if (studySet?.sections.some((section) => section.type === sectionType)) {
      return 'ready'
    }
    return 'generating'
  }

  const job = generationMeta.jobs.find((j) => {
    const uiType = toUiSectionType(j.type)
    return uiType === sectionType
  })

  if (!job) return 'generating'

  if (job.status === 'completed') {
    const fetchedOutput = generationMeta.fetchedOutputs[job.jobId]
    if (fetchedOutput?.fetched) return 'ready'
    if (fetchedOutput) return 'fetching'
    return 'fetching'
  }

  if (job.status === 'failed') return 'failed'

  return 'generating'
}

function getSectionIcon(sectionType: StudySetUiSectionType) {
  const iconMap: Record<StudySetUiSectionType, any> = {
    notes: FileText,
    multipleChoice: ListChecks,
    flashcards: Layers,
    podcast: Headphones,
    tutorLesson: GraduationCap,
    writtenTests: PenSquare,
    fillInTheBlanks: Edit3,
  }
  return iconMap[sectionType] || FileText
}

function getStepStatus(sectionType: StudySetUiSectionType, studySet: StudySet | null, generationMeta: StoredStudySetGenerationMeta | null) {
  const status = getCardStatus(sectionType, studySet, generationMeta)
  if (status === 'ready') return 'completed'
  if (status === 'failed') return 'failed'
  if (status === 'generating') return 'pending'
  return 'in-progress'
}

interface StudySetOverviewProps {
  studySet: StudySet | null
  generationMeta: StoredStudySetGenerationMeta | null
  onOpenSection: (sectionType: StudySetUiSectionType) => void
  onRetrySection?: (sectionType: StudySetUiSectionType) => Promise<void>
}

export function StudySetOverview({
  studySet,
  generationMeta,
  onOpenSection,
  onRetrySection,
}: StudySetOverviewProps) {
  if (!studySet) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Study set not found
      </div>
    )
  }

  const selections = (studySet.selections || []) as StudySetUiSectionType[]
  const completedCount = generationMeta
    ? generationMeta.jobs.filter((j) => j.status === 'completed').length
    : 0
  const failedCount = generationMeta
    ? generationMeta.jobs.filter((j) => j.status === 'failed').length
    : 0

  // Generation is done when all jobs are in terminal state (completed or failed)
  const totalJobs = selections.length
  const doneJobs = completedCount + failedCount
  const isGenerating = doneJobs < totalJobs

  // Show building UI only while generating
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-teal-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-teal-600 animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Building your study set</h2>
            <p className="text-muted-foreground mt-2">This usually takes a few seconds.</p>
          </div>
        </div>

        <div className="w-full max-w-md space-y-3">
          {selections.map((sectionType) => {
            const stepStatus = getStepStatus(sectionType, studySet, generationMeta)
            const label = uiSectionTypeLabels[sectionType] || sectionType

            return (
              <div key={sectionType} className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {stepStatus === 'completed' && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {stepStatus === 'in-progress' && (
                      <LoaderCircle className="w-5 h-5 text-teal-600 animate-spin" />
                    )}
                    {stepStatus === 'failed' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {stepStatus === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <p className={stepStatus === 'completed' || stepStatus === 'in-progress' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {label}
                  </p>
                </div>

                {stepStatus === 'failed' && (
                  <button
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Retry"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">{completedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{selections.length}</span> sections ready
          </p>
          {failedCount > 0 && (
            <p className="text-red-600 mt-1">
              <span className="font-semibold">{failedCount}</span> failed
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show cards when generation is complete
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {selections.map((sectionType) => {
          const status = getCardStatus(sectionType, studySet, generationMeta)
          const Icon = getSectionIcon(sectionType)
          const label = uiSectionTypeLabels[sectionType] || sectionType
          const isReady = status === 'ready'
          const isFailed = status === 'failed'

          let cardClasses = 'rounded-2xl border p-6 transition-all duration-200 animate-in fade-in-0 zoom-in-95 relative'
          let iconBgClasses = 'rounded-xl p-3 w-fit'

          if (isReady) {
            cardClasses += ' border-primary/40 bg-primary/5 hover:border-primary/60 hover:shadow-md cursor-pointer'
            iconBgClasses += ' bg-primary/20 text-primary'
          } else if (isFailed) {
            cardClasses += ' border-red-200 bg-red-50'
            iconBgClasses += ' bg-red-100 text-red-600'
          } else {
            cardClasses += ' border-border bg-card cursor-not-allowed'
            iconBgClasses += ' bg-secondary text-muted-foreground'
          }

          return (
            <div
              key={sectionType}
              className={cardClasses}
            >
              <button
                onClick={() => isReady && onOpenSection(sectionType)}
                disabled={!isReady}
                className="w-full h-full text-left"
              >
                <div className="flex flex-col items-start gap-3">
                  <div className={iconBgClasses}>
                    {isFailed ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="text-left">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isReady ? 'Ready to explore' : isFailed ? 'Generation failed' : 'Loading...'}
                    </p>
                  </div>
                </div>
              </button>

              {isFailed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRetrySection?.(sectionType)
                  }}
                  className="absolute top-3 right-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Retry generation for this section"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
