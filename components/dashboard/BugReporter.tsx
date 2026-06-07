'use client'

import { useState } from 'react'
import { Bug, X, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

export function BugReporter() {
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pathname = usePathname()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description,
          url: window.location.href,
          path: pathname,
          userAgent: window.navigator.userAgent 
        })
      })

      if (!res.ok) throw new Error('Failed to submit bug report')

      toast.success('Bug reported successfully! Thank you for your feedback.')
      setIsOpen(false)
      setDescription('')
    } catch (err) {
      toast.error('Failed to submit bug report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Report a Bug"
      >
        <Bug className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-indigo-500" /> Report an Issue
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">What went wrong?</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? 'Submitting...' : 'Send Report'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
