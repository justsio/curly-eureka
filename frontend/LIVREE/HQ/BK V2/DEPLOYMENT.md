# دليل النشر - Deployment Guide

## 📋 متطلبات النشر

### Backend (Render)
- حساب على [Render.com](https://render.com)
- حساب Supabase
- Telegram Bot Token

### Frontend (Vercel/Netlify)
- حساب على Vercel أو Netlify
- Backend URL (من Render)

---

## 🚀 نشر Backend على Render

### 1. إعداد Supabase

1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. افتح SQL Editor
3. شغّل `database/schema.sql`
4. شغّل `database/insert_winners.sql`
5. احفظ:
   - Project URL
   - Anon/Public Key

### 2. إعداد Telegram Bot

1. افتح [@BotFather](https://t.me/BotFather) على Telegram
2. أرسل `/newbot`
3. اتبع التعليمات لإنشاء البوت
4. احفظ Bot Token
5. أرسل رسالة للبوت
6. افتح: `https://api.telegram.org/bot<TOKEN>/getUpdates`
7. احفظ `chat.id` من الاستجابة

### 3. نشر على Render

1. سجّل الدخول إلى [Render](https://render.com)
2. اضغط "New" → "Web Service"
3. اربط مستودع GitHub
4. اختر المستودع
5. اضبط الإعدادات:
   - **Name:** `bankily-contest-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free أو Paid

6. اضبط Environment Variables:
```
PORT=10000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
FRONTEND_URL=https://your-frontend.vercel.app
```

7. اضغط "Create Web Service"
8. انتظر حتى يكتمل النشر
9. احفظ Backend URL (مثل: `https://bankily-backend.onrender.com`)

---

## 🌐 نشر Frontend على Vercel

### 1. إعداد Vercel

1. سجّل الدخول إلى [Vercel](https://vercel.com)
2. اضغط "New Project"
3. اربط مستودع GitHub
4. اختر المستودع
5. اضبط الإعدادات:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. اضبط Environment Variables:
```
NEXT_PUBLIC_API_URL=https://bankily-backend.onrender.com
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend.vercel.app
```

7. اضغط "Deploy"
8. انتظر حتى يكتمل النشر

### 2. تحديث Backend URL

بعد نشر Frontend، حدّث `FRONTEND_URL` في Render:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🔧 اختبار النشر

### 1. اختبار Backend

افتح في المتصفح:
```
https://your-backend.onrender.com/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX..."
}
```

### 2. اختبار Frontend

1. افتح `https://your-frontend.vercel.app`
2. تحقق من:
   - عرض Landing Page
   - عرض قائمة الفائزين
   - عمل زر التسجيل
   - تبديل اللغة

### 3. اختبار التدفق الكامل

1. اذهب إلى `/register`
2. أدخل رقم هاتف صحيح (8 أرقام تبدأ بـ 2/3/4)
3. أدخل رمز مشاركة (4 أرقام مختلفة)
4. تحقق من:
   - رسالة Telegram عند التسجيل
   - الانتقال إلى صفحة OTP1
   - عمل التحقق من OTP1
   - عمل التحقق من OTP2
   - صفحة المشاركة

---

## 🐛 حل المشاكل

### Backend لا يعمل

1. تحقق من Environment Variables في Render
2. تحقق من Logs في Render Dashboard
3. تأكد من أن Supabase متاح
4. تأكد من صحة Telegram Token

### Frontend لا يتصل بـ Backend

1. تحقق من `NEXT_PUBLIC_API_URL`
2. تحقق من CORS في Backend
3. تأكد من أن Backend يعمل

### Telegram لا يعمل

1. تحقق من Bot Token
2. تحقق من Chat ID
3. تأكد من إرسال رسالة للبوت أولاً

### قاعدة البيانات فارغة

1. تحقق من Supabase Connection
2. شغّل `insert_winners.sql` مرة أخرى
3. تحقق من Indexes

---

## 📝 ملاحظات مهمة

- **Free Tier على Render:** قد ينام الخادم بعد 15 دقيقة من عدم الاستخدام
- **CORS:** تأكد من إضافة Frontend URL في Backend
- **Environment Variables:** لا تشاركها علنًا
- **Database:** احفظ نسخة احتياطية من Supabase

---

## 🔄 التحديثات

### تحديث Backend

1. ادفع التغييرات إلى GitHub
2. Render سيعيد النشر تلقائيًا

### تحديث Frontend

1. ادفع التغييرات إلى GitHub
2. Vercel سيعيد النشر تلقائيًا

---

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من Logs في Render/Vercel
2. تحقق من Console في المتصفح
3. راجع الوثائق:
   - [Render Docs](https://render.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
