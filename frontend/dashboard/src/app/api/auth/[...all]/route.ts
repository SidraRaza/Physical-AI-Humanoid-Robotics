import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Use Node.js runtime for better database compatibility
// Edge runtime doesn't support SQLite
export const runtime = 'nodejs';

export const { GET, POST } = toNextJsHandler(auth);
