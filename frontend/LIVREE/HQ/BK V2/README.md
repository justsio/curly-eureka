# مسابقة Bankily الكبرى - Bankily Grand Contest

مشروع كامل لمسابقة جوائز من Bankily يتكون من Frontend و Backend مع تكامل Telegram Bot.

## 📁 هيكل المشروع

```
BK V2/
├── backend/          # Backend API (Node.js + Express)
├── frontend/         # Frontend (Next.js + TypeScript)
└── database/         # SQL scripts for Supabase
```

## 🚀 البدء السريع

### Backend Setup

1. انتقل إلى مجلد backend:
```bash
cd backend
npm install
```

2. أنشئ ملف `.env`:
```env
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
FRONTEND_URL=http://localhost:3000
```

3. قم بإعداد قاعدة البيانات في Supabase:
   - شغّل `database/schema.sql`
   - شغّل `database/insert_winners.sql`

4. ابدأ الخادم:
```bash
npm start
```

### Frontend Setup

1. انتقل إلى مجلد frontend:
```bash
cd frontend
npm install
```

2. أنشئ ملف `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

3. ابدأ خادم التطوير:
```bash
npm run dev
```

4. افتح [http://localhost:3000](http://localhost:3000)

## 📱 الواجهات

1. **Landing Page** (`/`) - صفحة الجوائز والفائزين
2. **Registration** (`/register`) - تسجيل رقم الهاتف ورمز المشاركة
3. **OTP1** (`/otp1`) - إدخال رمز التحقق الأول
4. **OTP2** (`/otp2`) - إدخال رمز التحقق الثاني
5. **Share** (`/share`) - مشاركة الرابط على وسائل التواصل

## 🔐 قواعد التحقق

### رقم الهاتف
- 8 أرقام بالضبط
- يبدأ بـ 2 أو 3 أو 4
- Pattern: `^[234][0-9]{7}$`

### رمز المشاركة
- 4 أرقام بالضبط
- جميع الأرقام يجب أن تكون مختلفة

### OTP1
- 4 أرقام بالضبط
- يجب ألا يطابق رمز المشاركة

### OTP2
- 4 أرقام بالضبط
- يجب ألا يطابق رمز المشاركة
- يجب ألا يطابق OTP1

## 📊 قاعدة البيانات

### الجداول

1. **participants** - بيانات المشاركين
2. **winners** - قائمة الفائزين للعرض
3. **shares** - تتبع المشاركات الاجتماعية

## 🔔 Telegram Bot

يتم إرسال 3 رسائل:
1. عند التسجيل
2. عند نجاح OTP1
3. عند نجاح OTP2 (التحقق النهائي)

## 🌍 اللغات

- العربية (RTL)
- Français (LTR)

## 🛠 التقنيات المستخدمة

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- Telegram Bot API
- Rate Limiting
- Input Validation

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- RTL Support
- Multi-language

## 📦 النشر

### Backend على Render
1. اربط مستودع GitHub
2. اضبط متغيرات البيئة
3. Build Command: `npm install`
4. Start Command: `npm start`

### Frontend على Vercel
1. اربط مستودع GitHub
2. اضبط `NEXT_PUBLIC_API_URL`
3. Deploy تلقائي

## 📝 ملاحظات

- جميع شروط التحقق مخفية عن المستخدم
- أي خطأ في OTP1 أو OTP2 يعيد المستخدم لصفحة التسجيل
- التحديث التلقائي للفائزين كل 5 ثوان
- Rate limiting: 5 محاولات كل 15 دقيقة

## 📄 الترخيص

هذا المشروع مملوك لـ Bankily.
