'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const Analyzer = dynamic(() => import('@/components/dashboard/Analyzer'), { 
  ssr: false,
  loading: () => (
    <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
      <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Analyzer Module...</p>
    </div>
  )
})

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Analyzer />
    </div>
  )
}
