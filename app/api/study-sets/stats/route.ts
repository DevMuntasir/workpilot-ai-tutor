import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

type StudySetStats = {
  unfamiliar: number
  learning: number
  familiar: number
  mastered: number
}

function normalizeStats(input: any): StudySetStats {
  return {
    unfamiliar: Number(input?.unfamiliar) || 0,
    learning: Number(input?.learning) || 0,
    familiar: Number(input?.familiar) || 0,
    mastered: Number(input?.mastered) || 0,
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await req.json()
    const studySetId = typeof payload?.studySetId === 'string' ? payload.studySetId.trim() : ''
    const stats = normalizeStats(payload?.stats)
    const updatedAt =
      typeof payload?.updatedAt === 'string' && payload.updatedAt.trim()
        ? payload.updatedAt
        : new Date().toISOString()

    if (!studySetId) {
      return NextResponse.json({ error: 'studySetId is required.' }, { status: 400 })
    }

    const { data: existingRow, error: readError } = await supabase
      .from('grading_results')
      .select('id, feedback')
      .eq('id', studySetId)
      .maybeSingle()

    if (readError) {
      return NextResponse.json(
        {
          error: 'Failed to read existing study set.',
          details: readError.message,
        },
        { status: 500 },
      )
    }

    if (!existingRow) {
      return NextResponse.json({ synced: false, reason: 'not_found' })
    }

    const currentFeedback =
      existingRow.feedback && typeof existingRow.feedback === 'object' ? existingRow.feedback : {}

    const nextFeedback = {
      ...currentFeedback,
      stats,
      updatedAt,
    }

    const { error: updateError } = await supabase
      .from('grading_results')
      .update({
        feedback: nextFeedback,
        updated_at: updatedAt,
      })
      .eq('id', studySetId)

    if (updateError) {
      return NextResponse.json(
        {
          error: 'Failed to update study set stats.',
          details: updateError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ synced: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to sync study set stats.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

