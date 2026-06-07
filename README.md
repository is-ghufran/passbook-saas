# FinKul 💳

FinKul (formerly Passbook Analyzer) is a secure, privacy-first SaaS platform designed to instantly extract and analyze transactions from bank statements and physical passbooks. 

Unlike traditional financial tools, FinKul processes sensitive financial documents **entirely locally in the user's browser** using advanced OCR and PDF parsing. No financial data is ever uploaded to a server, ensuring 100% user privacy.

![FinKul Dashboard Banner](https://via.placeholder.com/1200x600?text=FinKul+Dashboard)

## ✨ Key Features

* **🔒 Privacy-First Architecture**: Parses PDFs and images locally using `pdf.js` and `Tesseract.js` via Web Workers.
* **📊 Deep Financial Insights**: Automatically categorizes transactions, visualizes cash flow, and identifies top spending categories using Recharts.
* **🔐 Seamless Authentication**: Powered by Supabase Auth, featuring seamless Google and GitHub OAuth integrations.
* **💳 SaaS Billing Integration**: Fully automated tiered subscriptions (Free, Pro, Power) powered by Razorpay and Webhooks.
* **📈 Telemetry & Monitoring**: Out-of-the-box integration with PostHog (Product Analytics) and Sentry (Error Tracking).
* **📨 Automated Support**: Integrated contact and bug-reporting flows utilizing Resend for transactional emails.

## 🛠 Tech Stack

**Frontend:**
* [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
* [React 19](https://react.dev/)
* [Tailwind CSS v4](https://tailwindcss.com/)
* [Shadcn UI](https://ui.shadcn.com/) & Radix Primitives

**Backend & Infrastructure:**
* [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth)
* [Razorpay](https://razorpay.com/) (Payments & Subscriptions)
* [PostHog](https://posthog.com/) (Analytics)
* [Sentry](https://sentry.io/) (Error Monitoring)
* [Resend](https://resend.com/) (Emails)
* [Upstash Redis](https://upstash.com/) (Rate Limiting)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v20+) and `npm` installed.

### 1. Clone & Install
```bash
git clone https://github.com/is-ghufran/passbook-saas.git
cd passbook-saas
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory and populate it with the required keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_PLAN_PRO_ID=plan_pro_id
NEXT_PUBLIC_RAZORPAY_PLAN_POWER_ID=plan_power_id

# Resend Configuration (Contact Form Emails)
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_email@domain.com

# PostHog Configuration (Analytics)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com

# Sentry Configuration (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 3. Database Setup
Execute the `supabase_setup.sql` script located in the root of the project inside your Supabase Cloud SQL Editor. This will:
* Create the `profiles`, `contact_messages`, `analyses`, and `bug_reports` tables.
* Configure strict PostgreSQL Row Level Security (RLS) policies.
* Set up automated database triggers for new user signups.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 📦 Deployment
FinKul is optimized for deployment on [Vercel](https://vercel.com/). 
1. Import the repository into Vercel.
2. Add all environment variables from your `.env.local` file.
3. Deploy!

## 📄 License
This project is proprietary and confidential. All rights reserved.
