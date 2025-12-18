'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
});

// Export commonly used hooks and functions
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Type exports
export type { Session } from 'better-auth/types';
