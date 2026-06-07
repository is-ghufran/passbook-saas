import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('usage_count, tier')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Free tier limit: 3 analysis
  const maxUsage = profile.tier === 'power' ? Infinity : profile.tier === 'pro' ? 100 : 3;

  if (profile.usage_count >= maxUsage) {
    return NextResponse.json({ allowed: false, current: profile.usage_count, max: maxUsage, tier: profile.tier })
  }

  return NextResponse.json({ allowed: true, current: profile.usage_count, max: maxUsage, tier: profile.tier })
}

import { z } from 'zod'

const usageSchema = z.object({
  action: z.literal('increment')
})

export async function POST(request: Request) {
  // Increment usage count
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    usageSchema.parse(body)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('usage_count')
    .eq('id', user.id)
    .single()

  if (profile) {
    await supabase
      .from('profiles')
      .update({ usage_count: profile.usage_count + 1 })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}
