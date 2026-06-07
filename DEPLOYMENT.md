# Production Deployment Guide

## 1. Environment Variables

Before deploying to production (e.g., Vercel, Netlify), make sure you add the following environment variables to your deployment environment:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Razorpay (Required for Payments)
RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret

# Resend (Required for Contact Form)
RESEND_API_KEY=your_production_resend_api_key
CONTACT_EMAIL=your_support_email_address
```

## 2. Database Setup

To ensure your production database is set up correctly, run the SQL script located at `supabase_setup.sql` in your production Supabase SQL Editor. This script will:
- Create the `profiles`, `contact_messages`, and `analyses` tables.
- Set up Row Level Security (RLS) so users can only access their own data.
- Create a trigger to automatically provision a profile when a new user signs up.

## 3. Webhook Configuration

In your Razorpay dashboard:
1. Go to **Settings > Webhooks**.
2. Add a new webhook with your production domain: `https://your-domain.com/api/webhooks/razorpay`
3. Enter your `RAZORPAY_WEBHOOK_SECRET`.
4. Select the `payment.captured` event.

## 4. End-to-End Testing

Before announcing your launch, perform these quick sanity checks in production:
1. **Sign up / Login**: Create a new account and verify that a profile row is created in the database.
2. **Analysis**: Upload a PDF or Image statement. Verify the text extraction works and that usage increments by 1.
3. **History**: Verify that "Save to History" properly populates the History page.
4. **Payments**: Use a Razorpay test card or a small real transaction to verify the webhook receives the event and updates the user's tier to "pro" or "power".
5. **Contact Form**: Send a test message and verify it arrives in your inbox (via Resend) and the Supabase `contact_messages` table.
