import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PantryPals - Recipe Sharing Platform',
  description: 'Learn to cook like a pro with step-by-step video guides from home cooks and professional chefs.',
  keywords: 'recipes, cooking, food, video guides, community',
  authors: [{ name: 'PantryPals Team' }],
  openGraph: {
    title: 'PantryPals - Recipe Sharing Platform',
    description: 'Learn to cook like a pro with step-by-step video guides',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PantryPals - Recipe Sharing Platform',
    description: 'Learn to cook like a pro with step-by-step video guides',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
