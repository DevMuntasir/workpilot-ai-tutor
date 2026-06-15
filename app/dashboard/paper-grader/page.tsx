'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, ArrowRight } from 'lucide-react'
import GraderUploadModal from '@/components/paper-grader/upload-modal'
import GradingResult from '@/components/paper-grader/grading-result'
import { formatUTCDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Submission {
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

export default function PaperGraderPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null)
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    setIsLoadingSubmissions(true)
    try {
      const stored = localStorage.getItem('paper_grader_submissions')
      if (stored) {
        setSubmissions(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setIsLoadingSubmissions(false)
    }
  }

  const handleUploadSuccess = async (submissionId: string, title: string) => {
    const newSubmission: Submission = {
      submission_id: submissionId,
      title,
      status: 'processing',
      created_at: new Date().toISOString(),
      grading: {
        score: null,
        grade: null,
        summary: null,
        strengths: [],
        weaknesses: [],
        suggestions: [],
        detailed_feedback: null,
      },
    }

    setSubmissions([newSubmission, ...submissions])
    localStorage.setItem('paper_grader_submissions', JSON.stringify([newSubmission, ...submissions]))
    setActiveSubmission(newSubmission)
    setShowUploadModal(false)

    pollForResults(submissionId)
  }

  const pollForResults = async (submissionId: string, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        const response = await fetch(`/api/v1/grader/result/${submissionId}`)

        if (response.ok) {
          const result = await response.json()

          setSubmissions((prev) =>
            prev.map((sub) =>
              sub.submission_id === submissionId
                ? { ...sub, status: result.status, grading: result.grading }
                : sub
            )
          )

          setActiveSubmission((prev) =>
            prev && prev.submission_id === submissionId
              ? { ...prev, status: result.status, grading: result.grading }
              : prev
          )

          if (result.status !== 'processing') {
            localStorage.setItem(
              'paper_grader_submissions',
              JSON.stringify(
                submissions.map((sub) =>
                  sub.submission_id === submissionId
                    ? { ...sub, status: result.status, grading: result.grading }
                    : sub
                )
              )
            )
            break
          }
        }
      } catch (error) {
        console.error('Error polling for results:', error)
      }
    }
  }

  return (
    <div className="w-full">
      {activeSubmission ? (
        <GradingResult result={activeSubmission} onBack={() => setActiveSubmission(null)} />
      ) : (
        <div className="min-h-screen bg-white dark:bg-background">
          {/* Hero Section */}
          <div className="border-b border-border bg-white dark:bg-background/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-8 py-12">
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Paper Grader
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Upload your essays, assignments, or papers with grading rubrics to get instant AI-powered feedback and detailed assessments.
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                <Upload className="w-5 h-5" />
                Upload Assignment & Rubric
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-8 py-12">
            {isLoadingSubmissions ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground font-medium">
                    Loading submissions...
                  </p>
                </div>
              </div>
            ) : submissions.length > 0 ? (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-linear-to-b from-primary to-thirdary rounded-full"></div>
                    Recent Submissions
                  </h2>
                </div>

                <div className="grid gap-4">
                  {submissions.map((submission) => (
                    <Button
                      key={submission.submission_id}
                      onClick={() => setActiveSubmission(submission)}
                      className="group p-6 bg-card dark:bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-lg dark:hover:shadow-primary/10 transition-all duration-300 text-left"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-3 bg-secondary dark:bg-secondary rounded-lg shrink-0 group-hover:shadow-md transition-all">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {submission.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatUTCDate(submission.created_at)} •{' '}
                              {submission.status === 'processing' ? (
                                <span className="text-primary font-semibold">
                                  Processing...
                                </span>
                              ) : submission.grading.score !== null ? (
                                <span className="font-semibold text-foreground/70">
                                  Score: {submission.grading.score}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Grading completed
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {submission.grading.score !== null && (
                          <div className="text-right shrink-0">
                            <p className="text-4xl font-black bg-linear-to-r from-primary to-thirdary bg-clip-text text-transparent">
                              {submission.grading.score}%
                            </p>
                            <p className="text-sm font-bold text-muted-foreground mt-1">
                              Grade: <span className="text-lg text-foreground">{submission.grading.grade}</span>
                            </p>
                          </div>
                        )}

                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-6">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-thirdary/20 rounded-3xl blur-2xl"></div>
                  <div className="relative w-24 h-24 bg-secondary dark:bg-secondary rounded-3xl flex items-center justify-center shadow-lg">
                    <FileText className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-foreground mb-3 text-center">
                  No submissions yet
                </h2>
                <p className="text-muted-foreground mb-10 max-w-sm text-center leading-relaxed font-medium">
                  Start by uploading your assignment along with the grading rubric to receive instant feedback and grading.
                </p>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Upload Your First Assignment</span>
                </Button>
              </div>
            )}
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <GraderUploadModal
              onClose={() => setShowUploadModal(false)}
              onSuccess={handleUploadSuccess}
            />
          )}
        </div>
      )}
    </div>
  )
}
