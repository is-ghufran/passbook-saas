'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 glass-card rounded-2xl text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Check your email</h2>
        <p className="text-slate-600 dark:text-slate-300">
          We've sent a password reset link to <span className="font-semibold">{email}</span>.
        </p>
        <Link href="/login" className="block mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium">
          Return to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 glass-card rounded-2xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reset Password</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter your email to receive a reset link</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
          <AlertCircle className="shrink-0 mt-0.5 w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow text-slate-900 dark:text-slate-100"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm mt-2"
        >
          {loading ? 'Sending link...' : 'Send Reset Link'}
        </button>
      </form>
      
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Remember your password?{' '}
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
