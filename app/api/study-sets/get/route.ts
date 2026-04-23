import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/dist/server/web/spec-extension/response"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET() {
  try {
    console.log('[study-sets/create] GET health-check received')
    const { data, error } = await supabase
      .from('study_sets')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[study-sets/create] Health check Supabase error:', error)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase query failed',
          details: error.message,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: {
        reachable: true,
        sampleRowCount: data?.length ?? 0,
      },
    })
  } catch (error) {
    console.error('[study-sets/create] Health check failed:', error)
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}