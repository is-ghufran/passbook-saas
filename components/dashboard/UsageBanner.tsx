'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UsageBanner() {
  const [usage, setUsage] = useState<{current: number, max: number, allowed: boolean} | null>(null)

  const fetchUsage = () => {
    fetch('/api/usage/check?t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setUsage(data)
      })
  }

  useEffect(() => {
    fetchUsage()
    window.addEventListener('usageUpdated', fetchUsage)
    return () => window.removeEventListener('usageUpdated', fetchUsage)
  }, [])

  if (!usage || usage.max === null || usage.max === undefined) return null;

  return (
    <div className="glass-card bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
      <div>
        <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Analysis Usage</h4>
        <p className="text-sm text-indigo-700 dark:text-indigo-300">You have used {usage.current} out of {usage.max} free analyses this month.</p>
      </div>
      <Link href="/billing" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
        Upgrade Plan
      </Link>
    </div>
  )
}
