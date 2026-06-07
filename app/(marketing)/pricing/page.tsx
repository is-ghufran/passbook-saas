'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    tierValue: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 Statements/month',
      'Basic text extraction',
      'Community support',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    tierValue: 'pro',
    monthlyPrice: 499,
    yearlyPrice: 399,
    features: [
      '100 Statements/month',
      'High priority processing',
      'Email support',
      'Export to CSV',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Power',
    tierValue: 'power',
    monthlyPrice: 999,
    yearlyPrice: 799,
    features: [
      'Unlimited Statements',
      'Advanced Analytics',
      'Priority 24/7 support',
      'Early access features',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [currentTier, setCurrentTier] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/usage/check?t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.tier) setCurrentTier(data.tier)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-14">
          <div className="relative flex w-[340px] max-w-full items-center rounded-full bg-slate-200/80 dark:bg-white/10 p-1 backdrop-blur-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 w-1/2 flex items-center justify-center rounded-full py-2 text-sm font-medium transition-all duration-300 ${
                !isYearly
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 w-1/2 flex items-center justify-center rounded-full py-2 text-sm font-medium transition-all duration-300 ${
                isYearly
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Yearly
              <span className="ml-1.5 inline-block rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Save 20%
              </span>
            </button>
            {/* Sliding pill */}
            <span
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-indigo-600 transition-all duration-300 ease-in-out ${
                isYearly ? 'left-[calc(50%+2px)]' : 'left-1'
              }`}
            />
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice

            if (plan.popular) {
              // Pro card with gradient border glow
              return (
                <div
                  key={plan.name}
                  className="relative rounded-2xl p-[2px] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #6366f1)',
                  }}
                >
                  {/* Glow effect behind */}
                  <div
                    className="absolute -inset-1 rounded-2xl opacity-40 blur-xl"
                    style={{
                      background:
                        'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                    }}
                  />

                  <div className="relative glass-card rounded-2xl p-8 flex flex-col h-full">
                    {/* Most Popular Badge */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                        Most Popular
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 mt-2">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        {price === 0 ? 'Free' : `₹${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          /mo
                        </span>
                      )}
                      {isYearly && plan.monthlyPrice > 0 && (
                        <span className="ml-2 text-sm text-slate-400 dark:text-slate-500 line-through">
                          ₹{plan.monthlyPrice}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {currentTier === plan.tierValue ? (
                      <div className="w-full block text-center py-3 px-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800/50">
                        Current Plan
                      </div>
                    ) : (
                      <Link
                        href={currentTier ? (plan.tierValue === 'power' ? '/contact' : '/billing') : plan.href}
                        className="w-full block text-center py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
                      >
                        {currentTier ? (plan.tierValue === 'power' ? 'Contact Sales' : 'Switch Plan') : plan.cta}
                      </Link>
                    )}
                  </div>
                </div>
              )
            }

            // Free & Power cards
            return (
              <div
                key={plan.name}
                className="glass-card rounded-2xl p-8 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {price === 0 ? 'Free' : `₹${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      /mo
                    </span>
                  )}
                  {isYearly && plan.monthlyPrice > 0 && (
                    <span className="ml-2 text-sm text-slate-400 dark:text-slate-500 line-through">
                      ₹{plan.monthlyPrice}
                    </span>
                  )}
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {currentTier === plan.tierValue ? (
                  <div className="w-full block text-center py-3 px-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800/50">
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href={currentTier ? (plan.tierValue === 'power' ? '/contact' : '/billing') : plan.href}
                    className="w-full block text-center py-3 px-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    {currentTier ? (plan.tierValue === 'power' ? 'Contact Sales' : 'Switch Plan') : plan.cta}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
