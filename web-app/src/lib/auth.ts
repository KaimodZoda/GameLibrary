import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

export type AuthToken = JWT & {
  sub?: string;
};

const getAuthToken = async (request: NextRequest): Promise<AuthToken | null> => {
  let token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token'
  });

  if (!token) {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: '__Secure-next-auth.session-token'
    });
  }

  return token as AuthToken | null;
};

/**
 * Authenticate user and return token
 * Throws error if authentication fails
 */
export async function authenticate(request: NextRequest): Promise<AuthToken> {
  const token = await getAuthToken(request);

  if (!token) {
    throw new Error('Authentication required');
  }

  return token;
}

/**
 * Authenticate user and return NextResponse error if fails
 * Use this for simpler error handling in API routes
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | AuthToken> {
  const token = await getAuthToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  return token;
}

/**
 * Check if user has admin role
 */
export function isAdmin(token: AuthToken): boolean {
  return token.role === 'ADMIN';
}

/**
 * Require admin authentication
 * Returns error response if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | AuthToken> {
  const token = await getAuthToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!isAdmin(token)) {
    return NextResponse.json(
      { success: false, message: 'Admin access required' },
      { status: 403 }
    );
  }

  return token;
}

/**
 * Get current user ID from token
 */
export function getUserId(token: AuthToken): number {
  return parseInt(token.sub || '0');
}
