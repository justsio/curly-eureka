const rateLimitMap = new Map();

export function rateLimit(req, res, options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown';

  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);

  if (record.count > max) {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'تم تجاوز عدد المحاولات المسموحة',
    });
    return false;
  }

  return true;
}
