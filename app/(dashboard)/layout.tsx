import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { QuickActions } from '@/components/dashboard/QuickActions'

import { BugReporter } from '@/components/dashboard/BugReporter'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <Navbar isDashboard={true} userEmail={user.email} />
      
      <div className="flex flex-1 max-w-[1600px] w-full mx-auto">
        <DashboardSidebar />
        <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <QuickActions />
      <BugReporter />
    </div>
  )
}

