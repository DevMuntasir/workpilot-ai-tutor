'use client'

import { useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import GraderUploadModal from '@/components/paper-grader/upload-modal'
import GradingResult from '@/components/paper-grader/grading-result'
import { formatUTCDate } from '@/lib/utils'

export default function PaperGraderPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [gradingResults, setGradingResults] = useState<any[]>([])
  const [activeResult, setActiveResult] = useState<any>(null)

  return (
    <div className="w-full">
      {activeResult ? (
        <GradingResult
          result={activeResult}
          onBack={() => setActiveResult(null)}
        />
      ) : (
        <>
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-background to-secondary/30 px-8 py-12 border-b border-border">
            <h1 className="text-4xl font-bold text-foreground mb-3 text-pretty">
              Paper Grader
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Upload your essays, assignments, or papers and get AI-powered feedback and grading
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <Upload className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-semibold text-foreground">Upload PDF/Document</p>
                  <p className="text-xs text-muted-foreground">Upload PDF or document files</p>
                </div>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <FileText className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-semibold text-foreground">Paste Text</p>
                  <p className="text-xs text-muted-foreground">Paste essay or paper text</p>
                </div>
              </button>
            </div>
          </div>

          {/* Results Section */}
          {gradingResults.length > 0 && (
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Recent Gradings</h2>
              <div className="space-y-4">
                {gradingResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveResult(result)}
                    className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {result.title || 'Untitled Paper'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Score: {result.score}% • {formatUTCDate(result.date)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-primary">
                          {result.score}%
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {gradingResults.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-8 py-12">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  No papers graded yet. Upload a paper to get started!
                </p>
              </div>
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <GraderUploadModal
              onClose={() => setShowUploadModal(false)}
              onSuccess={(result) => {
                setGradingResults([...gradingResults, result])
                setActiveResult(result)
                setShowUploadModal(false)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
