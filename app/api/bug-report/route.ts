import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const bugReportSchema = z.object({
  description: z.string().min(5).max(2000),
  url: z.string().url().optional(),
  path: z.string().optional(),
  userAgent: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = bugReportSchema.parse(body)

    const { error } = await supabase
      .from('bug_reports')
      .insert({
        user_id: user.id,
        description: validatedData.description,
        url: validatedData.url,
        path: validatedData.path,
        user_agent: validatedData.userAgent,
        status: 'open'
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: err.issues }, { status: 400 })
    }
    console.error('Error submitting bug report:', err)
    return NextResponse.json({ error: 'Failed to submit bug report' }, { status: 500 })
  }
}

