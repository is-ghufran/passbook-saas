import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, message } = schema.parse(body)

    // Store message in Supabase using service role to bypass RLS
    const supabase = createAdminClient()
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({ email, message })

    if (dbError) {
      console.error('Failed to store contact message:', dbError)
    }

    // Try sending via Resend if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        const escapeHtml = (unsafe: string) => {
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
        
        const safeMessage = escapeHtml(message)

        await resend.emails.send({
          from: 'Contact Form <onboarding@resend.dev>',
          to: process.env.CONTACT_EMAIL || 'support@finkul.com',
          subject: `New contact from ${email}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
              <p><strong>From:</strong> ${email}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p style="white-space: pre-wrap; color: #334155;">${safeMessage}</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">Sent from FinKul Contact Form</p>
            </div>
          `,
          replyTo: email,
        })
      } catch (emailErr) {
        console.error('Resend email failed:', emailErr)
        // Don't fail the request — message is already saved in DB
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
