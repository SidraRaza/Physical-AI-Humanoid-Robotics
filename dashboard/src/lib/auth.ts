import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  // Database configuration - using in-memory for demo, configure for production
  database: {
    provider: 'sqlite',
    url: './auth.db', // SQLite file for local development
  },

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false, // Set to true in production
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
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
