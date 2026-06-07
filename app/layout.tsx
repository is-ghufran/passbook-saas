import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingSupport } from "@/components/FloatingSupport";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { BackgroundMesh } from "@/components/ui/background-mesh";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { PostHogPageView } from "@/components/providers/PostHogPageView";

export const metadata: Metadata = {
  title: {
    default: "FinKul | Smart Bank Statement Extraction",
    template: "%s | FinKul"
  },
  description: "Securely and instantly extract transactions from your bank statements and passbooks. 100% local, private analysis with deep financial insights.",
  openGraph: {
    title: "FinKul",
    description: "Extract and analyze transactions from PDF and image statements instantly.",
    url: "https://finkul.com",
    siteName: "FinKul",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinKul",
    description: "Extract and analyze transactions from bank statements instantly.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative">
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <BackgroundMesh />
            <PostHogPageView />
            {children}
            <FloatingSupport />
            <CommandPalette />
            <CookieConsent />
            <Toaster richColors position="top-right" toastOptions={{ className: 'dark:bg-slate-900 dark:border-slate-800' }} />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
