import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/app/components/common/error-boundary'
import HotjarScript from '@/app/components/common/hotjar-script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

// Add or edit your "generateMetadata" to include the Sentry trace data:
export function generateMetadata(): Metadata {
  return {
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
    other: {
      ...Sentry.getTraceData()
    }
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          {children}
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        
        {/* Hotjar Analytics Script with Error Handling */}
        <HotjarScript />
      </body>
    </html>
  )
}
