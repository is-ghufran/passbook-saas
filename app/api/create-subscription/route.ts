import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('razorpay_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.razorpay_customer_id

    if (!customerId) {
      const customer = await razorpay.customers.create({
        email: user.email!,
        notes: {
          supabase_uid: user.id
        }
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({ razorpay_customer_id: customerId })
        .eq('id', user.id)
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 120
    } as any)

    return NextResponse.json(subscription)

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
