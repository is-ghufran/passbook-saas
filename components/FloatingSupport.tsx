'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-indigo-600 p-4 text-white">
            <h3 className="font-semibold text-lg">Support Chat</h3>
            <p className="text-indigo-100 text-sm">We typically reply in a few minutes.</p>
          </div>
          <div className="p-4 h-64 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col justify-end">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm max-w-[85%] self-start mb-4">
              <p className="text-sm text-slate-700 dark:text-slate-200">Hi there! 👋 How can we help you with FinKul today?</p>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Send
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1 transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
