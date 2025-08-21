'use client'

import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap'
})

const metadata: Metadata = {
  title: 'BITSPARK - Connect with BITS Students | AI-Powered Social & Dating App',
  description: 'Join BITSPARK - the exclusive social and dating platform for BITS Pilani students. AI matching, meaningful conversations, and genuine connections across all BITS campuses.',
  keywords: 'BITS dating app, BITS social network, college dating, student connections, AI matching, BITS Pilani, BITS Goa, BITS Hyderabad, BITS Dubai',
  authors: [{ name: 'BITSPARK Team' }],
  openGraph: {
    title: 'BITSPARK - Find Your Perfect Connection at BITS Pilani',
    description: 'The exclusive platform for BITS students to discover friendships, dates, and meaningful connections through AI-powered matching.',
    url: 'https://bitspark.vercel.app',
    siteName: 'BITSPARK',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BITSPARK - Connect with BITS Students',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BITSPARK - Connect with BITS Students',
    description: 'AI-powered matching for BITS Pilani students across all campuses.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'bitspark-verification-2025',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}