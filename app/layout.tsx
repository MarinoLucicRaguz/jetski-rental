import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionDataProvider } from '@/components/wrapper/SessionDataWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JetskiRentalOrganizer',
  description: 'Created by Marino',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionDataProvider>{children}</SessionDataProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}
