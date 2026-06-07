import Link from 'next/link'
import { ShieldCheck, Zap, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FinKul | Smart Bank Statement Extraction',
  description: 'Upload your PDF or image passbook and instantly get cash flow insights, top expenses, and category breakdowns. 100% offline and secure.',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full mb-6 shadow-sm border border-green-200 dark:border-green-800/50">
          <ShieldCheck className="w-4 h-4" /> 100% Offline & Private Analysis
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
        Analyze your bank statements<br/><span className="text-indigo-600 dark:text-indigo-400">in seconds.</span>
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
        Upload your PDF or image passbook and instantly get cash flow insights, top expenses, and category breakdowns without your data ever leaving your device.
      </p>
      <div className="flex justify-center gap-4">
        {user ? (
          <Link href="/dashboard" className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-lg">
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/signup" className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-lg">
            Get Started for Free
          </Link>
        )}
        <Link href="/pricing" className="px-8 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-lg">
          View Pricing
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Instant OCR</h3>
          <p className="text-slate-600 dark:text-slate-300">Our local engine extracts text from images and PDFs in milliseconds.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">100% Private</h3>
          <p className="text-slate-600 dark:text-slate-300">Your statements are analyzed in your browser. Nothing is ever uploaded to our servers.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Password Protected</h3>
          <p className="text-slate-600 dark:text-slate-300">We support encrypted PDFs. Just enter your password and we'll unlock it locally.</p>
        </div>
      </div>
    </div>
  )
}
