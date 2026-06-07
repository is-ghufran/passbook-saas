import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="glass-card rounded-2xl p-12 max-w-lg w-full text-center space-y-6">
        {/* 404 hero text */}
        <h1 className="text-9xl font-extrabold tracking-tight text-gradient">
          404
        </h1>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Page Not Found
        </h2>

        {/* Subtitle */}
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>

          <Link
            href="javascript:history.back()"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
