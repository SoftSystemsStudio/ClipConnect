import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Clear the auth cookie by setting it to expire immediately
  res.setHeader(
    'Set-Cookie',
    'clipconnect_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  );
  res.json({ ok: true });
}
