import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

// Simple in-memory rate limiter
// In production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: NextApiRequest) => string;
}

export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 60, // 60 requests per minute default
    message = 'Too many requests. Please try again later.',
    keyGenerator = (req) => {
      // Use IP address or forwarded IP
      const forwarded = req.headers['x-forwarded-for'];
      const ip = typeof forwarded === 'string'
        ? forwarded.split(',')[0]
        : req.socket?.remoteAddress || 'unknown';
      return ip;
    },
  } = options;

  return function rateLimitMiddleware(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const key = keyGenerator(req);
      const now = Date.now();

      let entry = rateLimitStore.get(key);

      if (!entry || entry.resetTime < now) {
        // Create new entry
        entry = {
          count: 1,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      } else {
        entry.count++;
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

      if (entry.count > max) {
        return res.status(429).json({
          success: false,
          error: message,
        });
      }

      return handler(req, res);
    };
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour (for sensitive operations like password reset)
});
