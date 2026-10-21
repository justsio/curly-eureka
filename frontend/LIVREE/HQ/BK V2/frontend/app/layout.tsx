import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'arabic'] })

export const metadata: Metadata = {
  title: 'مسابقة Bankily الكبرى',
  description: 'فرصتك للفوز بجوائز قيمة من Bankily',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
