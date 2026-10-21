import { rateLimit } from '@/utils/rateLimit';
import { validateOTP } from '@/utils/validation';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'METHOD_NOT_ALLOWED' });
  }

  if (!rateLimit(req, res)) return;

  const { phone, entryCode, otpCode } = req.body || {};

  if (!phone || !entryCode) {
    return res.status(400).json({ success: false, error: 'INVALID_REQUEST' });
  }

  const result = validateOTP(phone, otpCode);

  if (!result.valid) {
    return res.status(400).json({ success: false, error: result.error });
  }

  return res.status(200).json({ success: true });
}
