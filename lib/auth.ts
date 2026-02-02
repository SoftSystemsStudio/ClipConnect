import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface JwtPayload {
  userId: number;
  role?: string;
}

export async function getUserFromRequest(req: NextApiRequest) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match = cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('clipconnect_token='));
  if (!match) return null;
  const token = match.split('=')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  } catch {
    return null;
  }
}

interface AuthenticatedRequest extends NextApiRequest {
  user?: { id: number; role: string; email: string; name: string | null };
}

export function requireAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    return handler(req, res);
  };
}

export function optionalAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const user = await getUserFromRequest(req);
    if (user) {
      req.user = user;
    }
    return handler(req, res);
  };
}

export function requireRole(roles: string[]) {
  return (handler: NextApiHandler): NextApiHandler => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const user = await getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      return handler(req, res);
    };
  };
}
