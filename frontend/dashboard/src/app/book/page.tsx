'use client';

import { useSession } from '@/lib/auth-client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Book Page - VIP Dashboard Style
 * Physical AI & Humanoid Robotics Table of Contents
 * Premium card-based layout with animations
 */

// Chapter data for Physical AI & Humanoid Robotics
const chapters = [
  {
    id: 1,
    title: 'Introduction to Physical AI',
    description: 'Learn the fundamentals of AI systems that interact with the physical world.',
    icon: '🤖',
    color: 'from-indigo-500 to-purple-600',
    topics: ['Embodiment', 'Sensors', 'Actuators', 'Architecture'],
  },
  {
    id: 2,
    title: 'Basics of Humanoid Robotics',
    description: 'Explore mechanical design, actuators, sensors, and control systems.',
    icon: '🦾',
    color: 'from-blue-500 to-cyan-600',
    topics: ['Kinematics', 'Actuators', 'Power Systems', 'Safety'],
  },
  {
    id: 3,
    title: 'ROS 2 Fundamentals',
    description: 'Master the industry-standard framework for robot software development.',
    icon: '⚙️',
    color: 'from-emerald-500 to-teal-600',
    topics: ['Nodes', 'Topics', 'Services', 'Launch Files'],
  },
  {
    id: 4,
    title: 'Perception Systems',
    description: 'Understand vision, depth sensing, SLAM, and sensor fusion in robots.',
    icon: '👁️',
    color: 'from-amber-500 to-orange-600',
    topics: ['Computer Vision', 'LIDAR', 'SLAM', 'Sensor Fusion'],
  },
  {
    id: 5,
    title: 'Motion Planning & Control',
    description: 'Learn how humanoid robots plan, balance, and move safely.',
    icon: '🚶',
    color: 'from-rose-500 to-pink-600',
    topics: ['Path Planning', 'Balance', 'Locomotion', 'MPC'],
  },
  {
    id: 6,
    title: 'Learning for Robotics',
    description: 'Apply machine learning and reinforcement learning to physical agents.',
    icon: '🧠',
    color: 'from-violet-500 to-purple-600',
    topics: ['Imitation Learning', 'RL', 'Sim-to-Real', 'Foundation Models'],
  },
  {
    id: 7,
    title: 'Real-World Deployment & Ethics',
    description: 'Challenges, safety, ethics, and future of humanoid AI systems.',
    icon: '🌍',
    color: 'from-slate-500 to-gray-600',
    topics: ['Safety Standards', 'Ethics', 'Regulations', 'Future Trends'],
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function BookPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login?redirect=/book');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading content...</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Interactive Textbook
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Physical AI & Humanoid Robotics
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              A comprehensive guide to building intelligent physical systems
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-2xl">📚</span>
                <span>7 Chapters</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-2xl">⏱️</span>
                <span>~20 Hours</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-2xl">🎯</span>
                <span>Hands-on Exercises</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Table of Contents
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Master the fundamentals of Physical AI through structured chapters
          </p>
        </motion.div>

        {/* Chapter Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {chapters.map((chapter) => (
            <motion.div
              key={chapter.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <Link href={`http://localhost:3000/docs/chapter${chapter.id}`}>
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`h-2 bg-gradient-to-r ${chapter.color}`} />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Chapter {chapter.id}
                      </span>
                      <motion.span
                        className="text-3xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {chapter.icon}
                      </motion.span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {chapter.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                      {chapter.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {chapter.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300"
                        >
                          {topic}
                        </span>
                      ))}
                      {chapter.topics.length > 3 && (
                        <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400">
                          +{chapter.topics.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Read Chapter</span>
                      <svg
                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Start Learning?</h3>
              <p className="text-indigo-100">
                Begin your journey into Physical AI and humanoid robotics today.
              </p>
            </div>
            <Link href="http://localhost:3000/docs/chapter1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Chapter 1
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
