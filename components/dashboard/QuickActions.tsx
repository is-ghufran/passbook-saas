'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, X, Zap, Clock, CreditCard } from 'lucide-react'

const actions = [
  { name: 'New Analysis', href: '/dashboard', icon: Zap, color: 'bg-indigo-500 hover:bg-indigo-600' },
  { name: 'View History', href: '/history', icon: Clock, color: 'bg-purple-500 hover:bg-purple-600' },
  { name: 'Manage Plan', href: '/billing', icon: CreditCard, color: 'bg-emerald-500 hover:bg-emerald-600' },
]

export function QuickActions() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Action Items */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {actions.map((action) => {
          const isActive = pathname === action.href
          return (
            <Link
              key={action.name}
              href={action.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                isActive ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-slate-900/80' : ''
              } ${action.color}`}
            >
              <span>{action.name}</span>
              <action.icon className="w-4 h-4" />
            </Link>
          )
        })}
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 ${
          open
            ? 'bg-slate-700 dark:bg-slate-600 rotate-45 shadow-slate-500/30'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/40'
        }`}
        aria-label="Quick Actions"
      >
        {open ? (
          <X className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <Plus className="w-6 h-6 text-white transition-transform duration-300" />
        )}
      </button>
    </div>
  )
}
