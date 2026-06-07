import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, FileText, ArrowDownCircle, ArrowUpCircle, Search, Calendar, Hash } from 'lucide-react'

export const metadata = {
  title: 'History - FinKul',
  description: 'View your previously analyzed passbooks and bank statements',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch analyses history
  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View your previously analyzed passbooks and bank statements.</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>{analyses?.length || 0} Total Analyses</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        {error ? (
          <div className="p-12 text-center text-red-500 dark:text-red-400">
            <p>Failed to load history. Please try again later.</p>
            <p className="text-xs mt-2 opacity-70">{error.message}</p>
          </div>
        ) : !analyses || analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-200/50 dark:border-slate-700/50">
              <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No history yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              You haven't analyzed any bank statements yet. Head over to the Analyzer to get started!
            </p>
            <a 
              href="/dashboard"
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
            >
              Go to Analyzer
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</div></th>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> Filename</div></th>
                  <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-1.5"><Hash className="w-4 h-4" /> Txns</div></th>
                  <th className="px-6 py-4 font-semibold text-right"><div className="flex items-center justify-end gap-1.5"><ArrowDownCircle className="w-4 h-4" /> Total In</div></th>
                  <th className="px-6 py-4 font-semibold text-right"><div className="flex items-center justify-end gap-1.5"><ArrowUpCircle className="w-4 h-4" /> Total Out</div></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {analyses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-900 dark:text-slate-200 font-medium" title={item.filename}>
                      {item.filename || 'Unknown File'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md">
                        {item.transaction_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(item.total_deposits)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(item.total_withdrawals)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
