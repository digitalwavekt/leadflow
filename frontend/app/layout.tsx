import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-head',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'LeadFlow for Designers — Buy Verified Design Leads',
  description:
    'The only marketplace where designers get pre-qualified, AI-analyzed leads delivered in real-time. Stop chasing clients. Buy verified leads instantly.',
  keywords: 'design leads, interior design leads, UI UX leads, logo design leads, designer marketplace',
  openGraph: {
    title: 'LeadFlow for Designers',
    description: 'Stop chasing clients. Buy verified leads instantly.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} dark`}>
      <body className="bg-bg text-white font-body antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
