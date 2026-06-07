'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function CancelSubscriptionButton({ currentTier }: { currentTier: string }) {
  const [isCancelling, setIsCancelling] = useState(false)

  if (currentTier === 'free') return null

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will have access until the end of your billing cycle.')) return

    setIsCancelling(true)
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST'
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        // Optionally trigger a refresh or let the user know they will see updates soon.
      } else {
        toast.error(data.error || 'Failed to cancel subscription')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="mt-12 p-6 border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Danger Zone</h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          Cancel your subscription. You will keep your current features until the end of your billing cycle.
        </p>
      </div>
      <button
        onClick={handleCancel}
        disabled={isCancelling}
        className="shrink-0 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
        Cancel Subscription
      </button>
    </div>
  )
}
