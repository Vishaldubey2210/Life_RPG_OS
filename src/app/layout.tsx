import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Life RPG OS',
  description: 'Treat life like a game — build habits, gain XP, level up your life',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased" style={{ background: '#08080F', color: '#F1F0FF' }}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#13131F',
              border: '1px solid #2E2E50',
              color: '#F1F0FF',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
