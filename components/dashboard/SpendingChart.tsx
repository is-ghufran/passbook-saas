'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

type Transaction = { date: string, particulars: string, deposit: number, withdrawal: number }

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

function categorize(tx: Transaction): string {
  const p = tx.particulars.toUpperCase()
  if (p.includes('UPI') || p.includes('PHONEPE') || p.includes('PAYTM') || p.includes('GPAY')) return 'UPI'
  if (p.includes('CASH') || p.includes('ATM') || p.includes('WITHDRAWAL')) return 'ATM/Cash'
  if (p.includes('NEFT') || p.includes('RTGS') || p.includes('IMPS')) return 'Transfers'
  if (p.includes('EMI') || p.includes('LOAN')) return 'EMI/Loans'
  if (p.includes('SALARY') || p.includes('SAL')) return 'Salary'
  return 'Other'
}

export function SpendingChart({ transactions }: { transactions: Transaction[] }) {
  // Spending by category
  const categoryMap: Record<string, number> = {}
  transactions.forEach(tx => {
    if (tx.withdrawal > 0) {
      const cat = categorize(tx)
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.withdrawal
    }
  })
  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Monthly summary (deposits vs withdrawals)
  const monthMap: Record<string, { deposits: number, withdrawals: number }> = {}
  transactions.forEach(tx => {
    const dateMatch = tx.date.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (dateMatch) {
      const key = `${dateMatch[2]}/${dateMatch[3].slice(2)}`
      if (!monthMap[key]) monthMap[key] = { deposits: 0, withdrawals: 0 }
      monthMap[key].deposits += tx.deposit
      monthMap[key].withdrawals += tx.withdrawal
    }
  })
  const barData = Object.entries(monthMap).map(([month, data]) => ({
    month,
    Deposits: Math.round(data.deposits),
    Withdrawals: Math.round(data.withdrawals),
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value)
  }

  if (transactions.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Pie Chart - Spending Breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Spending Breakdown</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">By category</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart - Monthly Cash Flow */}
      {barData.length > 1 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Monthly Cash Flow</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Deposits vs. Withdrawals</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="Deposits" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Withdrawals" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
