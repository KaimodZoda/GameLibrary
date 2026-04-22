import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// Rate limiting store for login attempts (in production, use Redis/Database)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const isAccountLocked = (email: string): boolean => {
  const attempts = loginAttempts.get(email);
  if (!attempts) return false;

  if (Date.now() > attempts.resetTime) {
    loginAttempts.delete(email);
    return false;
  }

  return attempts.count >= MAX_ATTEMPTS;
};

const recordFailedAttempt = (email: string): void => {
  const attempts = loginAttempts.get(email);
  if (!attempts) {
    loginAttempts.set(email, { count: 1, resetTime: Date.now() + LOCKOUT_DURATION });
  } else {
    attempts.count++;
  }
};

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        // IP-based rate limiting: 10 login attempts per 15 minutes
        const ip = req?.headers ? getClientIp(req as any) : 'unknown';
        const rateLimitResult = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);

        if (!rateLimitResult.success) {
          throw new Error('Too many login attempts from this IP. Please try again later.');
        }

        // Check account lockout
        if (isAccountLocked(email)) {
          throw new Error('Account temporarily locked due to too many failed attempts. Please try again later.');
        }

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          recordFailedAttempt(email);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          recordFailedAttempt(email);
          return null;
        }

        // Clear failed attempts on successful login
        loginAttempts.delete(email);

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || '';
        (session.user as any).role = (token.role as string) || '';
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin?error=true',
    signOut: '/'
  },
  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };
