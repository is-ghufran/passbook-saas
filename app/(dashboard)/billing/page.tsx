import { createClient } from '@/lib/supabase/server'
import PlanCard from '@/components/billing/PlanCard'
import { Download } from 'lucide-react'
import { CancelSubscriptionButton } from '@/components/billing/CancelSubscriptionButton'

// Billing history temporarily removed pending backend integration

export default async function BillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user?.id)
    .single()

  const currentTier = profile?.tier || 'free'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Manage Subscription
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Choose the plan that fits your needs.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PlanCard
          name="Free"
          price={0}
          planId="plan_free"
          features={[
            '3 Statements per month',
            'Basic text extraction',
            'Community support',
          ]}
          isCurrent={currentTier === 'free'}
        />
        <PlanCard
          name="Pro"
          price={499}
          planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_PRO_ID || 'plan_pro_id'}
          features={[
            '100 Statements per month',
            'High priority processing',
            'Email support',
            'Export to CSV',
          ]}
          isCurrent={currentTier === 'pro'}
          isPopular={true}
        />
        <PlanCard
          name="Power"
          price={999}
          planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_POWER_ID || 'plan_power_id'}
          features={[
            'Unlimited Statements',
            'Advanced Analytics',
            'Priority 24/7 support',
            'Early access features',
          ]}
          isCurrent={currentTier === 'power'}
        />
      </div>

      {/* Danger Zone */}
      <CancelSubscriptionButton currentTier={currentTier} />
    </div>
  )
}
