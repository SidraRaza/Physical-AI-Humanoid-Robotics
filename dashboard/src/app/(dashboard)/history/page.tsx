'use client';

import Link from 'next/link';

export default function HistoryPage() {
  // Placeholder - in a real app, this would fetch from the backend
  const conversations: any[] = [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Chat History
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Review your previous conversations with the AI assistant
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl mb-4 block">📭</span>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No conversations yet
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Start chatting with the AI to see your history here
          </p>
          <Link href="/chat" className="btn-primary btn-md">
            Start a Conversation
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv, idx) => (
            <div key={idx} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    {conv.title || 'Conversation'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {conv.preview || 'No preview available'}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {conv.date || 'Just now'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
