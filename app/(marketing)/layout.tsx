import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <Navbar userEmail={user?.email} />

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 py-12 mt-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 FinKul. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
