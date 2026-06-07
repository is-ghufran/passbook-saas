import CheckoutButton from './CheckoutButton'
import { CheckCircle2 } from 'lucide-react'

export default function PlanCard({
  name,
  price,
  features,
  planId,
  isCurrent,
  isPopular,
}: {
  name: string
  price: number
  features: string[]
  planId: string
  isCurrent: boolean
  isPopular?: boolean
}) {
  return (
    <div
      className={`relative glass-card rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 ${
        isCurrent
          ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10'
          : 'hover:shadow-xl'
      }`}
    >
      {/* Badges */}
      {isCurrent && (
        <div className="absolute top-0 right-4 -translate-y-1/2">
          <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md">
            Current Plan
          </span>
        </div>
      )}
      {isPopular && !isCurrent && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30">
            Most Popular
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 mt-1">
        {name}
      </h3>
      <div className="mb-6">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
          ₹{price}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          /mo
        </span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
          >
            <CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <button
          disabled
          className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-xl font-medium cursor-not-allowed transition-colors"
        >
          Current Plan
        </button>
      ) : (
        <CheckoutButton planId={planId} planName={name} price={price} />
      )}
    </div>
  )
}
