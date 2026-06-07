"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, CreditCard, ChevronRight, Clock, Zap } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function DashboardSidebar() {
  const pathname = usePathname()
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
  
  const navItems = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Analyzer', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Billing', href: '/billing', icon: CreditCard },
  ]

  return (
    <aside className="w-64 glass-card border-r border-y-0 border-l-0 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 rounded-none bg-white/30 dark:bg-black/20">
      <div className="flex-1 py-8 px-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm shadow-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/30" : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-full bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgb(99,102,241,0.5)]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110 drop-shadow-md" : "group-hover:scale-110")} />
              {item.name}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </Link>
          )
        })}
      </div>
      
      {/* Sidebar Usage Counter */}
      {usage && (
        <div className="p-4 mb-4 mx-4 glass-card bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              Analyses
            </h4>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {usage.max ? `${usage.current} / ${usage.max}` : `${usage.current} Completed`}
            </span>
          </div>
          
          {usage.max ? (
            <>
              <div className="w-full h-1.5 bg-indigo-200/50 dark:bg-indigo-950 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${usage.current >= usage.max ? 'bg-red-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${Math.min(100, (usage.current / usage.max) * 100)}%` }} 
                />
              </div>
              <Link href="/billing" className="block text-center w-full py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
                Upgrade Plan
              </Link>
            </>
          ) : (
            <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 opacity-80">
              Unlimited Plan Active
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
