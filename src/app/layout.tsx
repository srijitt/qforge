import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font for clean UI
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/header'; // New Header component
import { AppFooter } from '@/components/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'QForge | Automated Question Paper Generator',
  description: 'QForge is an AI-powered platform for educators to effortlessly generate, customize, and manage question papers. Save time, ensure quality, and streamline your assessment process.',
  keywords: [
    'QForge',
    'question paper generator',
    'AI question paper',
    'automated exam creation',
    'education technology',
    'assessment tools',
    'teacher resources',
    'exam generator',
    'custom question papers',
    'edtech'
  ],
  authors: [{ name: 'Srijit', url: 'https://www.linkedin.com/in/srijit-chakraborty154/'}],
  creator: 'QForge',
  openGraph: {
    title: 'QForge | Automated Question Paper Generator',
    description: 'Effortlessly generate and manage question papers with QForge, the AI-powered tool for educators.',
    url: 'https://qforge.vercel.app',
    siteName: 'QForge',
    images: [
      {
        url: 'image.png',
        width: 1200,
        height: 630,
        alt: 'QForge - Automated Question Paper Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  themeColor: '#2563eb',
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <div className="flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 container mx-auto py-8 px-4 md:px-6 lg:px-8">
            {children}
          </main>
          <AppFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}

