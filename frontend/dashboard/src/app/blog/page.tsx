'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Blog Page - VIP Dashboard Style
 * Physical AI & Humanoid Robotics Blog
 * Premium card-based layout with animations
 */

// Physical AI themed blog posts
const blogPosts = [
  {
    id: 1,
    title: 'The Rise of Humanoid Robots in 2024',
    excerpt: 'From Boston Dynamics to Tesla Optimus, humanoid robots are making unprecedented strides. We explore the breakthroughs that are bringing sci-fi to reality.',
    date: 'Dec 15, 2024',
    author: 'Dr. Sarah Chen',
    readTime: '8 min read',
    category: 'Industry Trends',
    icon: '🤖',
    color: 'from-indigo-500 to-purple-600',
    featured: true,
  },
  {
    id: 2,
    title: 'Understanding Sim-to-Real Transfer in Robotics',
    excerpt: 'How domain randomization and progressive transfer are solving the reality gap problem for robot learning.',
    date: 'Dec 10, 2024',
    author: 'Prof. James Liu',
    readTime: '12 min read',
    category: 'Research',
    icon: '🎮',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 3,
    title: 'ROS 2 Humble: A Complete Migration Guide',
    excerpt: 'Step-by-step guide to migrating your robotics projects from ROS 1 to ROS 2 Humble LTS.',
    date: 'Dec 5, 2024',
    author: 'Alex Martinez',
    readTime: '15 min read',
    category: 'Tutorial',
    icon: '⚙️',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 4,
    title: 'SLAM Algorithms Compared: ORB-SLAM3 vs RTAB-Map',
    excerpt: 'An in-depth comparison of popular visual SLAM implementations for humanoid robot navigation.',
    date: 'Nov 28, 2024',
    author: 'Dr. Emily Park',
    readTime: '10 min read',
    category: 'Technical Deep-Dive',
    icon: '🗺️',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 5,
    title: 'Building Safe Human-Robot Interaction Systems',
    excerpt: 'Best practices for implementing safety-rated controls and collision avoidance in collaborative robots.',
    date: 'Nov 20, 2024',
    author: 'Dr. Michael Torres',
    readTime: '9 min read',
    category: 'Safety',
    icon: '🛡️',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 6,
    title: 'Reinforcement Learning for Bipedal Locomotion',
    excerpt: 'How PPO and SAC are enabling humanoid robots to walk, run, and recover from falls.',
    date: 'Nov 15, 2024',
    author: 'Prof. David Kim',
    readTime: '11 min read',
    category: 'Machine Learning',
    icon: '🚶',
    color: 'from-violet-500 to-purple-600',
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

export default function BlogPage() {
  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

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
              Research & Insights
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Physical AI Blog
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
              Insights, tutorials, and research updates from the world of humanoid robotics
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-2xl">📝</span>
                <span>{blogPosts.length} Articles</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-2xl">👥</span>
                <span>Expert Authors</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-2xl">🔬</span>
                <span>Cutting-Edge Research</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Featured Article
            </h2>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <Link href={`http://localhost:3000/blog/${featuredPost.id}`}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`h-2 bg-gradient-to-r ${featuredPost.color}`} />
                  <div className="md:flex">
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                          {featuredPost.category}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                          {featuredPost.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <motion.span
                          className="text-4xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {featuredPost.icon}
                        </motion.span>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {featuredPost.title}
                        </h3>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span>By {featuredPost.author}</span>
                          <span>{featuredPost.readTime}</span>
                        </div>
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Read Article</span>
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

                    <div className="md:w-1/2 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-8 flex items-center justify-center">
                      <motion.div
                        className="text-9xl"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        {featuredPost.icon}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Latest Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Latest Articles
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Stay updated with the latest in Physical AI and robotics
          </p>
        </motion.div>

        {/* Article Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16"
        >
          {regularPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <Link href={`http://localhost:3000/blog/${post.id}`}>
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`h-2 bg-gradient-to-r ${post.color}`} />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {post.category}
                      </span>
                      <motion.span
                        className="text-3xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {post.icon}
                      </motion.span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {post.readTime}
                      </span>
                      <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:gap-2 transition-all">
                        <span>Read</span>
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
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Stay Ahead in Physical AI</h3>
              <p className="text-indigo-100">
                Get weekly insights on humanoid robotics, tutorials, and research updates.
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 rounded-l-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-slate-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-indigo-600 rounded-r-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Browse by Category
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Research', 'Tutorial', 'Industry Trends', 'Technical Deep-Dive', 'Safety', 'Machine Learning'].map(
              (category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === 'All'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {category}
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
