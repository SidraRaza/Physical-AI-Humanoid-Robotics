'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { motion } from 'framer-motion';

/**
 * Home Page - Premium landing page with animated hero section and feature cards
 */
export default function HomePage() {
  const { data: session, isPending } = useSession();

  const features = [
    {
      title: 'Interactive Textbook',
      description: 'Access our comprehensive textbook with interactive elements and AI-powered explanations.',
      icon: '📚',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'AI Chatbot',
      description: 'Get instant answers to your questions with our AI-powered learning assistant.',
      icon: '🤖',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Progress Tracking',
      description: 'Track your learning progress and save your favorite content in your personal dashboard.',
      icon: '📊',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-10 blur-3xl"
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
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 opacity-5 blur-3xl"
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              <span className="block">AI-Powered Learning</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
                Textbook Experience
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-md mx-auto text-base text-slate-600 dark:text-slate-400 sm:text-lg md:text-xl md:max-w-3xl"
            >
              Explore our comprehensive textbook, engage with the AI chatbot, and track your learning progress in your personalized dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                href={session ? "/book" : "/login?redirect=/book"}
                className="px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Learning
              </Link>
              <Link
                href="/chatbot"
                className="px-8 py-4 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/30 md:py-4 md:text-lg md:px-10 transition-all duration-200"
              >
                Try Chatbot
              </Link>
            </motion.div>

            {!session && !isPending && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-4 text-sm text-slate-500 dark:text-slate-400"
              >
                Sign in to access the full textbook content and personalized features.
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to learn AI
            </h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Our platform combines comprehensive learning materials with cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-hover relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`} />
                <div className="relative p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white text-2xl mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to start your AI journey?
            </h2>
            <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
              Join thousands of learners who are already advancing their AI knowledge with our platform.
            </p>
            <div className="mt-8">
              <Link
                href={session ? "/dashboard" : "/signup"}
                className="inline-block px-8 py-4 border border-transparent text-base font-medium rounded-xl text-indigo-600 bg-white hover:bg-slate-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {session ? "Go to Dashboard" : "Create Account"}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
