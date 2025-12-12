import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6">
        <Link
          href={process.env.NEXT_PUBLIC_DOCUSAURUS_URL || 'http://localhost:3000'}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="text-sm font-medium">Back to Textbook</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Physical AI Textbook. All rights reserved.
      </footer>
    </div>
  );
}
