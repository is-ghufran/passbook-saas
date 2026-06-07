import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Lazy init to avoid build-time errors when env vars aren't set
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getPlanTierMap(): Record<string, string> {
  return {
    [process.env.NEXT_PUBLIC_RAZORPAY_PLAN_PRO_ID || 'plan_pro_id']: 'pro',
    [process.env.NEXT_PUBLIC_RAZORPAY_PLAN_POWER_ID || 'plan_power_id']: 'power',
  }
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify webhook authenticity
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // Handle subscription activated / charged events
    if (
      event.event === 'subscription.activated' ||
      event.event === 'subscription.charged'
    ) {
      const subscription = event.payload?.subscription?.entity
      if (!subscription) {
        return NextResponse.json({ error: 'No subscription entity' }, { status: 400 })
      }

      const planId = subscription.plan_id
      const customerEmail = subscription.customer_notify !== 0
        ? event.payload?.payment?.entity?.email
        : subscription.notes?.email

      const newTier = getPlanTierMap()[planId]

      if (!newTier || !customerEmail) {
        console.error('Could not map plan or find email:', { planId, customerEmail })
        return NextResponse.json({ error: 'Unknown plan or missing email' }, { status: 400 })
      }

      // Find user by email and upgrade their tier
      const supabase = getSupabase()

      const { data: users, error: lookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)

      if (lookupError || !users || users.length === 0) {
        console.error('User not found for email:', customerEmail)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          tier: newTier,
          razorpay_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', users[0].id)

      if (updateError) {
        console.error('Failed to update tier:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log(`Upgraded ${customerEmail} to ${newTier}`)
      return NextResponse.json({ success: true, tier: newTier })
    }

    // Handle subscription cancellation
    if (
      event.event === 'subscription.cancelled' ||
      event.event === 'subscription.halted'
    ) {
      const subscription = event.payload?.subscription?.entity
      if (subscription?.id) {
        const supabase = getSupabase()
        const { error } = await supabase
          .from('profiles')
          .update({
            tier: 'free',
            razorpay_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to downgrade user:', error)
        } else {
          console.log(`Downgraded subscription ${subscription.id} to free`)
        }
      }

      return NextResponse.json({ success: true })
    }

    // Acknowledge other events we don't handle
    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
