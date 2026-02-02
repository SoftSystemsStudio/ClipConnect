import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-dev-secret';
const CSRF_COOKIE_NAME = 'clipconnect_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Generate CSRF token
export function generateCsrfToken(): string {
  const randomValue = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${randomValue}.${timestamp}`;
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

// Verify CSRF token
export function verifyCsrfToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [randomValue, timestamp, signature] = parts;
  const payload = `${randomValue}.${timestamp}`;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) return false;

  // Check if token is expired (24 hours)
  const tokenTime = parseInt(timestamp, 10);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (now - tokenTime > maxAge) return false;

  return true;
}

// CSRF protection middleware
export function csrfProtection(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
      return handler(req, res);
    }

    // Get token from header or cookie
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];

    // For form submissions, also check body
    const bodyToken = req.body?._csrf;

    const token = headerToken || bodyToken;

    // Verify token matches cookie
    if (!token || !cookieToken || token !== cookieToken) {
      // Also verify the token is valid
      if (!verifyCsrfToken(token)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    }

    return handler(req, res);
  };
}

// Get or create CSRF token for a request
export function getCsrfToken(req: NextApiRequest, res: NextApiResponse): string {
  // Check if token exists in cookie
  const existingToken = req.cookies[CSRF_COOKIE_NAME];
  if (existingToken && verifyCsrfToken(existingToken)) {
    return existingToken;
  }

  // Generate new token
  const token = generateCsrfToken();

  // Set cookie
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${CSRF_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${24 * 60 * 60}; SameSite=Strict${secure}`
  );

  return token;
}

// API endpoint to get CSRF token
export async function csrfTokenHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getCsrfToken(req, res);
  return res.json({ csrfToken: token });
}
