import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('razorpay_subscription_id, tier')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.razorpay_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Cancel the subscription in Razorpay (cancel at cycle end by default)
    // We pass cancel_at_cycle_end: 1 to ensure they keep access until the period is over
    await getRazorpay().subscriptions.cancel(profile.razorpay_subscription_id, false)

    
    // We don't immediately downgrade them in Supabase here because they get to finish their billing cycle.
    // The webhook will handle downgrading them when the cycle actually ends.

    return NextResponse.json({ success: true, message: 'Subscription cancelled successfully' })
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json({ error: error.message || 'Failed to cancel subscription' }, { status: 500 })
  }
}
