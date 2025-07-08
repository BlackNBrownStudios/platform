import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pick a Number',
  description: 'A simple number guessing game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}