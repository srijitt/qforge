import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font for clean UI
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppHeader } from '@/components/header'; // New Header component

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'QForge',
  description: 'Automated Question Paper Generator',
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
        </div>
        <Toaster />
      </body>
    </html>
  );
}

