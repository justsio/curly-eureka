import fs from 'fs';
import path from 'path';
import { rateLimit } from '@/utils/rateLimit';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  if (!rateLimit(req, res, { max: 30 })) return;

  try {
    const filePath = path.join(process.cwd(), 'data', 'winners.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const winners = JSON.parse(fileContents);

    return res.status(200).json({ success: true, winners });
  } catch (error) {
    console.error('Winners API Error:', error);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
  }
}
