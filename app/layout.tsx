import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NIBBBLE - The Dribbble for Food Creators',
  description: 'SNACK. SHARE. SAVOR. Where TikTok meets Pinterest for food lovers. Share your recipes, discover amazing dishes, and build your culinary community.',
  keywords: 'food, recipes, cooking, social media, food creators, community, video, sharing',
  authors: [{ name: 'NIBBBLE Team' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'NIBBBLE - The Dribbble for Food Creators',
    description: 'SNACK. SHARE. SAVOR. Where TikTok meets Pinterest for food lovers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NIBBBLE - The Dribbble for Food Creators',
    description: 'SNACK. SHARE. SAVOR. Where TikTok meets Pinterest for food lovers.',
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
        <SpeedInsights />
      </body>
    </html>
  )
}
