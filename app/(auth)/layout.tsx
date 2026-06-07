import Link from 'next/link'
import { X, Cpu } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">FinKul</span>
        </Link>
        <Link 
          href="/" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
