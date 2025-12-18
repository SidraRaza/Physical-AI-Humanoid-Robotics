'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Auth Layout - Premium design with animated gradient background
 * Features:
 * - Animated gradient orbs in background
 * - Glassmorphism card effect
 * - Smooth page transitions
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orb */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-30 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Secondary gradient orb */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-20 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Tertiary gradient orb */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header - Back link */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 p-6 z-10"
      >
        <Link
          href={process.env.NEXT_PUBLIC_DOCUSAURUS_URL || 'http://localhost:3000'}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform duration-300"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </motion.svg>
          <span className="text-sm font-medium">Back to Textbook</span>
        </Link>
      </motion.header>

      {/* Main content */}
      <main className="relative flex min-h-screen items-center justify-center px-4 py-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-slate-500 dark:text-slate-500 z-10"
      >
        &copy; {new Date().getFullYear()} Physical AI Textbook. All rights reserved.
      </motion.footer>
    </div>
  );
}
