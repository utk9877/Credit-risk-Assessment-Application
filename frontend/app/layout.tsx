import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"
import { Geist_Mono } from 'next/font/google'

// Initialize fonts
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Credit Risk Assessment | MVP",
  description: "AI-powered credit risk assessment dashboard with explainable decisions",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.className} font-mono antialiased`}>
        <ThemeProvider storageKey="credit-risk-theme">
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
