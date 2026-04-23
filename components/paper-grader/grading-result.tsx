'use client'

import { ArrowLeft } from 'lucide-react'
import { formatUTCDate } from '@/lib/utils'

interface GradingResultProps {
  result: {
    title?: string
    score: number
    grade: string
    date: string
    summary: string
    strengths: string[]
    weaknesses: string[]
    suggestions: string[]
    detailedFeedback: string
  }
  onBack: () => void
}

export default function GradingResult({ result, onBack }: GradingResultProps) {
  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'B':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
      case 'C':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30'
      case 'D':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30'
      case 'F':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-foreground bg-secondary'
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-8 py-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {result.title || 'Paper Grading Result'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatUTCDate(result.date)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        {/* Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl ${getGradeColor(result.grade)}`}>
            <p className="text-sm font-medium opacity-75 mb-2">Overall Score</p>
            <p className="text-5xl font-bold">{result.score}%</p>
          </div>
          <div className={`p-6 rounded-xl ${getGradeColor(result.grade)} flex items-center justify-center`}>
            <div className="text-center">
              <p className="text-sm font-medium opacity-75 mb-2">Grade</p>
              <p className="text-5xl font-bold">{result.grade}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-3">Summary</h2>
          <p className="text-foreground leading-relaxed">{result.summary}</p>
        </div>

        {/* Strengths */}
        {result.strengths && result.strengths.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3">
              ✓ Strengths
            </h2>
            <ul className="space-y-2">
              {result.strengths.map((strength, idx) => (
                <li key={idx} className="text-green-800 dark:text-green-200 flex gap-2">
                  <span className="text-green-600 dark:text-green-400 flex-shrink-0">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {result.weaknesses && result.weaknesses.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-3">
              ⚠ Areas for Improvement
            </h2>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-orange-800 dark:text-orange-200 flex gap-2">
                  <span className="text-orange-600 dark:text-orange-400 flex-shrink-0">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions && result.suggestions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
              💡 Suggestions
            </h2>
            <ul className="space-y-2">
              {result.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-blue-800 dark:text-blue-200 flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Feedback */}
        {result.detailedFeedback && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Detailed Feedback</h2>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {result.detailedFeedback}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
