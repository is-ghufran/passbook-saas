'use client'

import { useState } from 'react'
import Script from 'next/script'

export default function CheckoutButton({ planId, planName, price }: { planId: string, planName: string, price: number }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, planName })
      })
      const data = await res.json()
      
      if (data.id) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          subscription_id: data.id,
          name: 'FinKul',
          description: `Subscription for ${planName} Plan`,
          handler: function (response: any) {
            // Success handler, Razorpay webhook will handle backend update
            window.location.reload()
          },
          theme: {
            color: '#4f46e5'
          }
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button 
        onClick={handleCheckout} 
        disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 focus:outline-none transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Subscribe for ₹${price}/mo`}
      </button>
    </>
  )
}
