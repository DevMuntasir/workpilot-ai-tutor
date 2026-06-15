'use client'

import { ArrowLeft } from 'lucide-react'
import { formatUTCDate } from '@/lib/utils'

interface GradingResultProps {
  result: {
    submission_id: string
    title: string
    status: string
    created_at: string
    grading: {
      score: number | null
      grade: string | null
      summary: string | null
      strengths: string[]
      weaknesses: string[]
      suggestions: string[]
      detailed_feedback: string | null
    }
  }
  onBack: () => void
}

export default function GradingResult({ result, onBack }: GradingResultProps) {
  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-slate-600 bg-slate-50 dark:bg-slate-900/30'

    switch (grade.toUpperCase()) {
      case 'A':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
      case 'B':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
      case 'C':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
      case 'D':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30'
      case 'F':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-900/30'
    }
  }

  const isProcessing = result.status === 'processing' || result.grading.score === null

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 bg-card flex items-center gap-4 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {result.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatUTCDate(result.created_at)}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
          {result.status === 'processing' ? 'Processing...' : 'Completed'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        {isProcessing ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground font-medium">
                Your assignment is being graded...
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                This may take a few moments
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-8 rounded-2xl border border-border shadow-lg ${getGradeColor(result.grading.grade)}`}>
                <p className="text-sm font-semibold opacity-75 mb-3">Overall Score</p>
                <p className="text-6xl font-black">{result.grading.score}%</p>
              </div>
              <div className={`p-8 rounded-2xl border border-border shadow-lg ${getGradeColor(result.grading.grade)} flex items-center justify-center`}>
                <div className="text-center">
                  <p className="text-sm font-semibold opacity-75 mb-3">Final Grade</p>
                  <p className="text-6xl font-black">{result.grading.grade || '-'}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            {result.grading.summary && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Summary
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  {result.grading.summary}
                </p>
              </div>
            )}

            {/* Strengths */}
            {result.grading.strengths && result.grading.strengths.length > 0 && (
              <div className="bg-linear-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                  <span className="text-xl">✓</span> Strengths
                </h2>
                <ul className="space-y-3">
                  {result.grading.strengths.map((strength, idx) => (
                    <li key={idx} className="text-emerald-800 dark:text-emerald-200 flex gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {result.grading.weaknesses && result.grading.weaknesses.length > 0 && (
              <div className="bg-linear-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚠</span> Areas for Improvement
                </h2>
                <ul className="space-y-3">
                  {result.grading.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-amber-800 dark:text-amber-200 flex gap-3">
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {result.grading.suggestions && result.grading.suggestions.length > 0 && (
              <div className="bg-linear-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border border-primary/30 dark:border-primary/50 rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span> Suggestions
                </h2>
                <ul className="space-y-3">
                  {result.grading.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-foreground/80 flex gap-3">
                      <span className="text-primary font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Feedback */}
            {result.grading.detailed_feedback && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Detailed Feedback
                </h2>
                <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {result.grading.detailed_feedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
