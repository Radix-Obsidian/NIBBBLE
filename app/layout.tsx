import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './layout.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'

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
        {children}
        <Analytics />
        <SpeedInsights />
        
        {/* Hotjar Analytics Script */}
        <Script
          id="hotjar-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6512561,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
            `,
          }}
        />
      </body>
    </html>
  )
}
