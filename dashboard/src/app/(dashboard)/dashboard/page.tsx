'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

const quickActions = [
  {
    title: 'Start Chatting',
    description: 'Ask questions about deep learning concepts',
    href: '/chat',
    icon: '💬',
    color: 'bg-primary-50 dark:bg-primary-900/20',
  },
  {
    title: 'View History',
    description: 'Review your previous conversations',
    href: '/history',
    icon: '📜',
    color: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    title: 'Read Textbook',
    description: 'Continue learning from where you left off',
    href: process.env.NEXT_PUBLIC_DOCUSAURUS_URL || 'http://localhost:3000',
    icon: '📖',
    color: 'bg-emerald-50 dark:bg-emerald-900/20',
    external: true,
  },
];

const learningStats = [
  { label: 'Questions Asked', value: '0', icon: '❓' },
  { label: 'Chapters Read', value: '0', icon: '📚' },
  { label: 'Days Active', value: '1', icon: '🔥' },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
          {greeting()}, {session?.user?.name?.split(' ')[0] || 'Learner'}! 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Ready to continue your AI learning journey?
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {learningStats.map((stat) => (
          <div
            key={stat.label}
            className="card flex flex-col items-center text-center py-5"
          >
            <span className="text-2xl mb-2">{stat.icon}</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </span>
            <span className="text-xs text-slate-500 mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) =>
          action.external ? (
            <a
              key={action.title}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:shadow-md transition-shadow group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-2">
                {action.title}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {action.description}
              </p>
            </a>
          ) : (
            <Link
              key={action.title}
              href={action.href}
              className="card hover:shadow-md transition-shadow group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}
              >
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {action.description}
              </p>
            </Link>
          )
        )}
      </div>

      {/* Recent activity placeholder */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Recent Activity
      </h2>
      <div className="card">
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🎯</span>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            No activity yet
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Start a conversation with the AI to see your activity here
          </p>
          <Link href="/chat" className="btn-primary btn-md">
            Start Chatting
          </Link>
        </div>
      </div>
    </div>
  );
}
