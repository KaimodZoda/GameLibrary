// In-memory rate limiting utility
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export const rateLimit = (
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: newEntry.resetTime
    };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: limit - entry.count,
    resetTime: entry.resetTime
  };
};

// Get client IP from request
export const getClientIp = (request: Request): string => {
  // Try to get IP from headers (common proxy headers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown';
};
