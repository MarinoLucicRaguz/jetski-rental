import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionDataProvider } from '@/components/wrapper/SessionDataWrapper'
import { auth } from '@/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jetski application',
  description: 'Created by Marino',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionDataProvider>
          {children}
          </SessionDataProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  )
}
