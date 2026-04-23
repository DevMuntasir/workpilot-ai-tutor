import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const geminiTextModel = process.env.GEMINI_TEXT_MODEL?.trim() || 'gemini-2.0-flash'

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
}

if (!geminiApiKey) {
  throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const googleProvider = createGoogleGenerativeAI({ apiKey: geminiApiKey })

function stripUnsupportedChars(text: string) {
  return text.replace(/\u0000/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const titleInput = formData.get('title')
    const submissionTitle =
      typeof titleInput === 'string' && titleInput.trim().length
        ? titleInput.trim()
        : 'Untitled Submission'
    let content = ''

    // Get content from either file or text
    const textContent = formData.get('text') as string
    if (textContent) {
      content = textContent
    } else {
      const files = formData.getAll('files') as File[]
      for (const file of files) {
        const text = await file.text()
        content += text + '\n'
      }
    }

    content = stripUnsupportedChars(content)

    if (!content.trim()) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    // Prompt (cap input to avoid huge payloads)
    const prompt = `You are an expert academic grader. Analyze the following paper/essay and provide comprehensive feedback. Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "score": 85,
  "grade": "B",
  "summary": "Brief summary of the paper...",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "detailedFeedback": "Detailed paragraph feedback here..."
}

Important:
- score must be 0-100
- grade must be A, B, C, D, or F
- Be constructive and helpful
- Provide specific examples from the text

Paper:
${content.substring(0, 8000)}`

    // Generate grading using Gemini (AI SDK + Google provider)
    const result = await generateText({
      model: googleProvider(geminiTextModel),
      prompt,
      temperature: 0.5,
    })

    // Safe defaults
    let gradingData: {
      score: number
      grade: string
      summary: string
      strengths: string[]
      weaknesses: string[]
      suggestions: string[]
      detailedFeedback: string
    } = {
      score: 75,
      grade: 'C',
      summary: 'Paper analysis provided by AI',
      strengths: ['Well-structured', 'Clear arguments'],
      weaknesses: ['Needs more examples', 'Some grammar issues'],
      suggestions: ['Add more evidence', 'Proofread carefully'],
      detailedFeedback: 'Your paper demonstrates understanding of the topic.',
    }

    // Parse JSON from model output
    try {
      const text = result.text ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        const score =
          typeof parsed.score === 'number'
            ? Math.max(0, Math.min(100, parsed.score))
            : gradingData.score

        const grade =
          typeof parsed.grade === 'string'
            ? parsed.grade.toUpperCase()
            : gradingData.grade

        gradingData = {
          score,
          grade: ['A', 'B', 'C', 'D', 'F'].includes(grade) ? grade : gradingData.grade,
          summary: typeof parsed.summary === 'string' ? parsed.summary : gradingData.summary,
          strengths: Array.isArray(parsed.strengths)
            ? parsed.strengths.filter((s: any) => typeof s === 'string')
            : gradingData.strengths,
          weaknesses: Array.isArray(parsed.weaknesses)
            ? parsed.weaknesses.filter((w: any) => typeof w === 'string')
            : gradingData.weaknesses,
          suggestions: Array.isArray(parsed.suggestions)
            ? parsed.suggestions.filter((s: any) => typeof s === 'string')
            : gradingData.suggestions,
          detailedFeedback:
            typeof parsed.detailedFeedback === 'string'
              ? parsed.detailedFeedback
              : gradingData.detailedFeedback,
        }
      } else {
        console.log('No JSON found in Gemini response:', result.text)
      }
    } catch (e) {
      console.error('Failed to parse grading data:', e)
      console.log('Raw response:', result.text)
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from('grading_results')
      .insert({
        title: submissionTitle,
        content: content.substring(0, 10000),
        overall_score: gradingData.score,
        feedback: gradingData,
        strengths: gradingData.strengths,
        improvements: gradingData.weaknesses,
        suggestions: gradingData.suggestions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          error: 'Failed to save grading result',
          details: error.message,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      result: {
        id: data?.[0]?.id,
        date: new Date().toISOString(),
        ...gradingData,
      },
    })
  } catch (error) {
    console.error('Error grading paper:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
