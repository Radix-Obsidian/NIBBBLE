import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/app/components/common/error-boundary'
import { HighlightInit } from '@highlight-run/next/client'
import HighlightAuthIntegration from '@/app/components/common/highlight-auth-integration'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export function generateMetadata(): Metadata {
  return {
    title: 'NIBBBLE - Social Platform for Food Creators',
    description: 'SNACK. SHARE. SAVOR. Where TikTok meets Pinterest for food lovers. Share your recipes, discover amazing dishes, and build your culinary community.',
    keywords: 'food, recipes, cooking, social media, food creators, community, video, sharing',
    authors: [{ name: 'NIBBBLE Team' }],
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    openGraph: {
      title: 'NIBBBLE - Social Platform for Food Creators',
      description: 'SNACK. SHARE. SAVOR. Where TikTok meets Pinterest for food lovers.',
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'NIBBBLE - Social Platform for Food Creators',
      description: 'SNACK. SHARE. SAVOR. Where TikTok meets Pinterest for food lovers.',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HighlightInit
        projectId={'ve6yn6ng'}
        serviceName="nibbble-alpha"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
          urlBlocklist: [
            // Block sensitive URLs from being recorded
            '/api/auth',
            '/api/stripe/webhook',
          ],
        }}
        enableStrictPrivacy={false}
        enableCanvasRecording={false}
        enablePerformanceRecording={true}
      />
      
      <html lang="en" className={inter.variable}>
        <body className={`${inter.className} antialiased`}>
          <HighlightAuthIntegration />
          <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
            {children}
          </ErrorBoundary>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </>
  )
}
