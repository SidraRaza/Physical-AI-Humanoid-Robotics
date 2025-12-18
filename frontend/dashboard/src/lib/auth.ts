import { betterAuth } from 'better-auth';
import Database from 'better-sqlite3';
import path from 'path';

// Create SQLite database for local development
const db = new Database(path.join(process.cwd(), 'auth.db'));

export const auth = betterAuth({
  // Database configuration using better-sqlite3
  database: db,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false, // Set to true in production with email service
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },

  // User configuration
  user: {
    additionalFields: {
      name: {
        type: 'string',
        required: false,
      },
    },
  },

  // Advanced options
  advanced: {
    cookiePrefix: 'ai-textbook',
    generateId: () => crypto.randomUUID(),
  },

  // Trusted origins for CORS
  trustedOrigins: [
    'http://localhost:3000', // Docusaurus
    'http://localhost:3001', // Dashboard
    process.env.NEXT_PUBLIC_DOCUSAURUS_URL || '',
    process.env.NEXT_PUBLIC_DASHBOARD_URL || '',
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
