import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'
import { Toaster } from '@/components/ui/toaster'

// Load the Inter font
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sampark - Admin Panel',
  description: 'AI Voice Agent Platform for Municipal Corporation of Delhi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster />
      </body>
    </html>
  )
}
