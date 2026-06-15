import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store (replace with your own database)
const submissions = new Map<string, any>()

export async function GET(
  request: NextRequest,
  { params }: { params: { submission_id: string } }
) {
  try {
    const submissionId = params.submission_id

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid submission ID' },
        { status: 400 }
      )
    }

    const submission = submissions.get(submissionId)

    if (!submission) {
      return NextResponse.json(
        { error: 'Grading result not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      submission_id: submission.id,
      title: submission.title,
      status: submission.status,
      created_at: submission.created_at,
      grading: {
        score: submission.grading.score,
        grade: submission.grading.grade,
        summary: submission.grading.summary,
        strengths: submission.grading.strengths,
        weaknesses: submission.grading.weaknesses,
        suggestions: submission.grading.suggestions,
        detailed_feedback: submission.grading.detailed_feedback,
      },
    })
  } catch (error) {
    console.error('Error retrieving grading result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
