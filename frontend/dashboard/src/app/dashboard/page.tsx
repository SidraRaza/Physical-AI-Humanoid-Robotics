'use client';

import { useSession } from '@/lib/auth-client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

/**
 * Dashboard Page - Premium admin-style layout with cards, stats, and charts placeholders
 */
export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login?redirect=/dashboard');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <motion.div
            className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect effect will handle this
  }

  // Mock data for dashboard stats
  const stats = [
    {
      title: 'Learning Progress',
      value: '42%',
      icon: '📚',
      gradient: 'from-blue-500 to-blue-600',
      change: '+5% this week'
    },
    {
      title: 'Chat History',
      value: '24',
      icon: '💬',
      gradient: 'from-green-500 to-green-600',
      change: '+3 new conversations'
    },
    {
      title: 'Bookmarks',
      value: '17',
      icon: '🔖',
      gradient: 'from-purple-500 to-purple-600',
      change: '+2 new bookmarks'
    },
    {
      title: 'Learning Streak',
      value: '7 days',
      icon: '🔥',
      gradient: 'from-indigo-500 to-indigo-600',
      change: 'Keep it up!'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      icon: '✓',
      title: 'Chapter 3 Completed',
      description: 'Neural Networks Fundamentals',
      time: '2 hours ago',
      color: 'indigo'
    },
    {
      id: 2,
      icon: '🔖',
      title: 'New Bookmark',
      description: 'Backpropagation algorithm explanation',
      time: '1 day ago',
      color: 'yellow'
    },
    {
      id: 3,
      icon: '💬',
      title: 'Chat Session',
      description: 'Understanding activation functions',
      time: '3 days ago',
      color: 'blue'
    }
  ];

  const learningGoals = [
    { id: 1, title: 'Complete Neural Networks', progress: 65, color: 'indigo' },
    { id: 2, title: 'Finish Deep Learning', progress: 30, color: 'green' },
    { id: 3, title: 'Master NLP Concepts', progress: 15, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Dashboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome back, <span className="font-semibold">{session.user?.name || session.user?.email}</span>!
            Track your learning progress and achievements.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="card-hover relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.change}</p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: stat.value.includes('%') ? stat.value : '100%' }}
                      transition={{ duration: 1, delay: 0.2 * index, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <span className="mr-3">📊</span>
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 bg-${activity.color}-100 dark:bg-${activity.color}-900/30 rounded-full flex items-center justify-center mr-4`}>
                    <span className={`text-${activity.color}-600 dark:text-${activity.color}-300`}>{activity.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{activity.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{activity.description}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Learning Goals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
              <span className="mr-3">🎯</span>
              Learning Goals
            </h2>
            <div className="space-y-6">
              {learningGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{goal.title}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full bg-gradient-to-r from-${goal.color}-500 to-${goal.color}-600`}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, delay: 0.2 * index, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recommended Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"
            >
              <h3 className="font-medium text-slate-900 dark:text-white mb-3">Recommended Next</h3>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-200">Chapter 4: Computer Vision</h4>
                <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-2">
                  Start learning about image processing and CNNs
                </p>
                <motion.button
                  className="mt-4 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-lg transition-all hover:shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Chapter
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Additional Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="card-hover">
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Time Spent</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">18h 32m</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">This week</p>
            </div>
          </div>

          <div className="card-hover">
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Chapters Read</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12/24</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">In progress</p>
            </div>
          </div>

          <div className="card-hover">
            <div className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Achievements</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">8</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Badges earned</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
