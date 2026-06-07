'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message })
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h1>
        <p className="text-slate-600 dark:text-slate-400">Have questions? We're here to help.</p>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        {status === 'success' ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Message Sent!</h3>
            <p className="text-slate-600 dark:text-slate-400">We'll get back to you as soon as possible.</p>
            <button onClick={() => setStatus('idle')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Send another message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-slate-100 transition-colors"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'error' && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">Something went wrong. Please try again.</p>}
          </form>
        )}
      </div>
    </div>
  )
}
