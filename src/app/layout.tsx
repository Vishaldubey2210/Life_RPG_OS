import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppShell } from '@/components/AppShell'
import { AnnouncementBanner } from '@/components/ui/AnnouncementBanner'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7C3AED',
}

export const metadata: Metadata = {
  title: 'Life RPG OS — Treat Life Like a Game',
  description: 'Gamify your habits, earn XP, level up your life stats, and compete with friends. The ultimate life operating system.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Life RPG OS',
  },
  openGraph: {
    title: 'Life RPG OS',
    description: 'Your life. Gamified.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ background: '#08080F', color: '#F1F0FF' }}>
        <AnnouncementBanner />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
