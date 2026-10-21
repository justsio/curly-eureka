# تعليمات الإعداد الكاملة - Complete Setup Instructions

## 📦 الخطوة 1: تثبيت المتطلبات

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## 🗄 الخطوة 2: إعداد Supabase

1. أنشئ حساب على [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. افتح **SQL Editor**
4. شغّل `database/schema.sql` (إنشاء الجداول)
5. شغّل `database/insert_winners.sql` (إضافة بيانات الفائزين)
6. احفظ:
   - **Project URL** (مثل: `https://xxxxx.supabase.co`)
   - **Anon Key** (مفتاح عام)

---

## 🤖 الخطوة 3: إعداد Telegram Bot

1. افتح [@BotFather](https://t.me/BotFather) على Telegram
2. أرسل `/newbot`
3. اتبع التعليمات:
   - اختر اسم للبوت
   - اختر username (يجب أن ينتهي بـ `bot`)
4. احفظ **Bot Token** (مثل: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### الحصول على Chat ID

1. أرسل رسالة للبوت الذي أنشأته
2. افتح في المتصفح:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. ابحث عن `"chat":{"id":-1001234567890}`
4. احفظ **Chat ID**

---

## ⚙️ الخطوة 4: إعداد Backend

1. في مجلد `backend`، أنشئ ملف `.env`:
```env
PORT=10000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
FRONTEND_URL=http://localhost:3000
```

2. ابدأ الخادم:
```bash
npm start
# أو للتطوير
npm run dev
```

3. تحقق من أن الخادم يعمل:
   - افتح: `http://localhost:10000/health`
   - يجب أن ترى: `{"status":"ok",...}`

---

## 🎨 الخطوة 5: إعداد Frontend

1. في مجلد `frontend`، أنشئ ملف `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

2. ابدأ خادم التطوير:
```bash
npm run dev
```

3. افتح المتصفح:
   - `http://localhost:3000`

---

## ✅ الخطوة 6: الاختبار

### اختبار Landing Page
1. افتح `http://localhost:3000`
2. تحقق من:
   - ✅ عرض الجوائز
   - ✅ عرض قائمة الفائزين (تحديث كل 5 ثوان)
   - ✅ عمل زر تبديل اللغة
   - ✅ عمل زر "تسجيل الدخول / المشاركة"

### اختبار التسجيل
1. اضغط على "تسجيل الدخول / المشاركة"
2. أدخل:
   - **رقم الهاتف:** `36291234` (8 أرقام تبدأ بـ 2/3/4)
   - **رمز المشاركة:** `1234` (4 أرقام مختلفة)
3. اضغط "التسجيل"
4. تحقق من:
   - ✅ رسالة Telegram تصل
   - ✅ الانتقال إلى صفحة OTP1

### اختبار OTP1
1. أدخل رمز OTP1 (4 أرقام، مختلف عن Entry Code)
   - مثال: إذا كان Entry Code = `1234`، استخدم `5678`
2. اضغط "تحقق"
3. تحقق من:
   - ✅ رسالة Telegram تصل
   - ✅ الانتقال إلى صفحة OTP2

### اختبار OTP2
1. أدخل رمز OTP2 (4 أرقام، مختلف عن Entry Code و OTP1)
   - مثال: إذا كان Entry Code = `1234` و OTP1 = `5678`، استخدم `9012`
2. اضغط "تحقق"
3. تحقق من:
   - ✅ رسالة Telegram تصل
   - ✅ الانتقال إلى صفحة المشاركة

### اختبار المشاركة
1. اضغط على أي زر مشاركة (WhatsApp/Messenger/Snapchat)
2. تحقق من:
   - ✅ فتح نافذة المشاركة
   - ✅ تتبع المشاركة في قاعدة البيانات

---

## 🧪 اختبار حالات الخطأ

### رقم هاتف خاطئ
- أدخل رقم يبدأ بـ 1 أو 5 أو 6 → يجب أن يظهر خطأ

### رمز مشاركة خاطئ
- أدخل `1123` (أرقام مكررة) → يجب أن يظهر خطأ

### OTP1 يطابق Entry Code
- Entry Code = `1234`
- OTP1 = `1234` → يجب أن يظهر خطأ ويعيد إلى التسجيل

### OTP2 يطابق Entry Code أو OTP1
- Entry Code = `1234`
- OTP1 = `5678`
- OTP2 = `1234` أو `5678` → يجب أن يظهر خطأ ويعيد إلى التسجيل

---

## 📊 التحقق من قاعدة البيانات

1. افتح Supabase Dashboard
2. اذهب إلى **Table Editor**
3. تحقق من:
   - ✅ جدول `participants` يحتوي على بيانات
   - ✅ جدول `winners` يحتوي على 100 فائز
   - ✅ جدول `shares` يحتوي على مشاركات

---

## 🔔 التحقق من Telegram

يجب أن تصل 3 رسائل:
1. **عند التسجيل:** رقم الهاتف + رمز المشاركة
2. **عند نجاح OTP1:** رقم الهاتف + رمز المشاركة + OTP1
3. **عند نجاح OTP2:** رقم الهاتف + رمز المشاركة + OTP1 + OTP2

---

## 🚀 النشر على Production

راجع ملف `DEPLOYMENT.md` للتعليمات الكاملة.

---

## ❓ حل المشاكل الشائعة

### Backend لا يعمل
- تحقق من ملف `.env`
- تحقق من أن PORT 10000 متاح
- تحقق من Logs في Terminal

### Frontend لا يتصل بـ Backend
- تحقق من `NEXT_PUBLIC_API_URL`
- تأكد من أن Backend يعمل
- تحقق من CORS في Backend

### Telegram لا يعمل
- تحقق من Bot Token
- تحقق من Chat ID
- تأكد من إرسال رسالة للبوت أولاً

### قاعدة البيانات فارغة
- شغّل `insert_winners.sql` مرة أخرى
- تحقق من اتصال Supabase

---

## 📝 ملاحظات مهمة

1. **رقم الهاتف:** يجب أن يكون 8 أرقام بالضبط، يبدأ بـ 2 أو 3 أو 4
2. **رمز المشاركة:** يجب أن يكون 4 أرقام مختلفة
3. **OTP1:** يجب أن يكون 4 أرقام، مختلف عن Entry Code
4. **OTP2:** يجب أن يكون 4 أرقام، مختلف عن Entry Code و OTP1
5. **أي خطأ في OTP:** يعيد المستخدم لصفحة التسجيل
6. **التحديث التلقائي:** الفائزين يتحدثون كل 5 ثوان

---

## ✅ Checklist النهائي

- [ ] Backend يعمل على `http://localhost:10000`
- [ ] Frontend يعمل على `http://localhost:3000`
- [ ] قاعدة البيانات تحتوي على الجداول والبيانات
- [ ] Telegram Bot يعمل ويرسل الرسائل
- [ ] جميع الصفحات تعمل (5 صفحات)
- [ ] تبديل اللغة يعمل
- [ ] التحقق من البيانات يعمل
- [ ] حالات الخطأ تعمل
- [ ] المشاركة الاجتماعية تعمل

---

## 🎉 تهانينا!

المشروع جاهز الآن! يمكنك البدء في الاختبار والتخصيص.
