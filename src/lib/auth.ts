import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Authenticate user and return token
 * Throws error if authentication fails
 */
export async function authenticate(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return token;
}

/**
 * Authenticate user and return NextResponse error if fails
 * Use this for simpler error handling in API routes
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | any> {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
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
export function isAdmin(token: any): boolean {
  return token?.role === 'admin' || token?.role === 'ADMIN';
}

/**
 * Require admin authentication
 * Returns error response if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | any> {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
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
export function getUserId(token: any): number {
  return parseInt(token.sub || '0');
}
