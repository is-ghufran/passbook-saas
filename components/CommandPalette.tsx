'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Command as CommandIcon, FileText, CreditCard, LogOut, Sun, Moon, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

type CommandItem = {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  category: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { setTheme, theme } = useTheme()

  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, action: () => router.push('/dashboard'), category: 'Navigation' },
    { id: 'billing', label: 'Go to Billing', icon: <CreditCard className="w-4 h-4" />, action: () => router.push('/billing'), category: 'Navigation' },
    { id: 'pricing', label: 'View Pricing', icon: <FileText className="w-4 h-4" />, action: () => router.push('/pricing'), category: 'Navigation' },
    { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, icon: theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: () => setTheme(theme === 'dark' ? 'light' : 'dark'), category: 'Actions' },
    { id: 'signout', label: 'Sign Out', icon: <LogOut className="w-4 h-4" />, action: () => { const form = document.createElement('form'); form.method = 'POST'; form.action = '/api/auth/signout'; document.body.appendChild(form); form.submit(); }, category: 'Account' },
  ]

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
  const categories = [...new Set(filtered.map(c => c.category))]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setIsOpen(prev => !prev)
      setQuery('')
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const runCommand = (cmd: CommandItem) => {
    cmd.action()
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-lg mx-4 glass-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            autoFocus
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No commands found.
            </div>
          ) : (
            categories.map(category => (
              <div key={category}>
                <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500">{category}</p>
                {filtered.filter(c => c.category === category).map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={() => runCommand(cmd)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors text-left"
                  >
                    <span className="text-slate-400 dark:text-slate-500">{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><CommandIcon className="w-3 h-3" />K to toggle</span>
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
        </div>
      </div>
    </div>
  )
}
