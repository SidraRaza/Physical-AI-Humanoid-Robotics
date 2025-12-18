import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI Textbook - Premium Learning Platform',
  description: 'An AI-powered learning platform with interactive textbook, chatbot, and personalized dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-900`}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
