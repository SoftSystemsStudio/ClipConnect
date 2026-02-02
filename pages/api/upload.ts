import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../../lib/auth';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: any }> {
  const form = new IncomingForm({
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    filter: ({ mimetype }) => {
      return ALLOWED_TYPES.includes(mimetype || '');
    },
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function handler(
  req: NextApiRequest & { user?: any },
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);

    const uploadedFile = files.file as File | File[];
    const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate public URL
    const filename = path.basename(file.filepath);
    const url = `/uploads/${filename}`;

    return res.status(201).json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.mimetype,
    });
  } catch (err: any) {
    console.error('Upload error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 5MB.' });
    }

    if (err.message?.includes('filter')) {
      return res.status(400).json({
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP',
      });
    }

    return res.status(500).json({ error: 'Upload failed' });
  }
}

export default requireAuth(handler);
