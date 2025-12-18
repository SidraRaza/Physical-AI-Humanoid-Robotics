'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DOCUSAURUS_URL = 'http://localhost:3000';

/**
 * Premium Navbar Component
 * - Sticky with glassmorphism effect
 * - Smooth hover animations on links
 * - Mobile hamburger menu with slide animation
 * - Active link highlighting
 */
const Navbar = () => {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll for navbar background opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const internalLinks = [
    { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { name: 'Chat', path: '/chatbot', requiresAuth: false },
    { name: 'Book', path: '/book', requiresAuth: true },
    { name: 'Blog', path: '/blog', requiresAuth: false },
  ];

  const externalLinks = [
    { name: 'Textbook', url: `${DOCUSAURUS_URL}/docs/chapter1` },
  ];

  const isActiveLink = (path: string) => pathname === path;

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-lg'
            : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <motion.a
              href={DOCUSAURUS_URL}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-white text-lg font-bold">AI</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                Textbook
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {/* External links */}
              {externalLinks.map((link) => (
                <motion.a
                  key={link.url}
                  href={link.url}
                  className="relative px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-1.5">
                    {link.name}
                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                  {/* Hover underline animation */}
                  <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </motion.a>
              ))}

              {/* Internal links */}
              {internalLinks
                .filter(link => !link.requiresAuth || session)
                .map((link) => (
                  <Link key={link.path} href={link.path}>
                    <motion.span
                      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 block ${
                        isActiveLink(link.path)
                          ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.name}
                      {/* Active indicator dot */}
                      {isActiveLink(link.path) && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"
                        />
                      )}
                    </motion.span>
                  </Link>
                ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {isPending ? (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : session ? (
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow-md">
                      {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                  </div>
                  <motion.button
                    onClick={() => signOut()}
                    className="text-sm px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign out
                  </motion.button>
                </div>
              ) : (
                <Link href="/login">
                  <motion.span
                    className="btn-primary btn-sm shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign in
                  </motion.span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* External links */}
                {externalLinks.map((link, index) => (
                  <motion.a
                    key={link.url}
                    href={link.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-medium">{link.name}</span>
                    <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </motion.a>
                ))}

                {/* Internal links */}
                {internalLinks
                  .filter(link => !link.requiresAuth || session)
                  .map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + externalLinks.length) * 0.1 }}
                    >
                      <Link
                        href={link.path}
                        className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                          isActiveLink(link.path)
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}

                {/* Mobile user info */}
                {session && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-md">
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
