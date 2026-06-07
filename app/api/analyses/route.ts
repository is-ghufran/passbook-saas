import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const analysisSchema = z.object({
  filename: z.string().min(1, "Filename is required").max(255),
  totalDeposits: z.number().min(0).default(0),
  totalWithdrawals: z.number().min(0).default(0),
  transactionCount: z.number().int().min(0).default(0)
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { filename, totalDeposits, totalWithdrawals, transactionCount } = analysisSchema.parse(body)


    // Insert into analyses table
    const { data, error } = await supabase
      .from('analyses')
      .insert([
        {
          user_id: user.id,
          filename: filename,
          total_deposits: totalDeposits || 0,
          total_withdrawals: totalWithdrawals || 0,
          transaction_count: transactionCount || 0
        }
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    }
    console.error('API /analyses error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
