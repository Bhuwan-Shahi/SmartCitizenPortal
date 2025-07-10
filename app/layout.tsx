import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart Citizen Portal',
  description: 'Techthon 1.0',
  generator: 'Bhuwan Shahi',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
