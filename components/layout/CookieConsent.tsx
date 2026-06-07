'use client'

import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-6 sm:p-6 sm:pb-8 flex justify-center pointer-events-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 max-w-2xl w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pointer-events-auto">
        <div className="flex-1 text-sm text-slate-600 dark:text-slate-300 text-center sm:text-left">
          We use cookies to ensure you get the best experience on our website. By continuing to use our site, you agree to our <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>.
        </div>
        <div className="flex shrink-0">
          <button
            onClick={handleAccept}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Accept & Close
          </button>
        </div>
      </div>
    </div>
  )
}
