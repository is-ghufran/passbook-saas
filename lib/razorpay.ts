import Razorpay from 'razorpay'

// Lazy init to avoid build-time errors when env vars aren't set
let _razorpay: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return _razorpay
}

// Keep backward compat as a getter
export const razorpay = new Proxy({} as Razorpay, {
  get(_, prop) {
    return (getRazorpay() as any)[prop]
  },
})
