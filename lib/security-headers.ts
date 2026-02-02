import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

export function securityHeaders(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline and unsafe-eval
        "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
        "img-src 'self' data: blob: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }

    return handler(req, res);
  };
}

// Middleware for Next.js pages (use in next.config.js)
export const securityHeadersConfig = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
