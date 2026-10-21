# Bankily Contest Frontend

Frontend application for Bankily Contest built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🌍 Multi-language support (Arabic/French)
- 📱 Responsive design with RTL support
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast and optimized with Next.js
- 🔒 Secure form validation
- 📊 Real-time winners display

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/              # Next.js app directory
│   ├── page.tsx      # Landing page
│   ├── register/     # Registration page
│   ├── otp1/         # First OTP verification
│   ├── otp2/         # Second OTP verification
│   └── share/         # Share page
├── components/        # React components
├── lib/              # Utilities and API service
└── public/           # Static files and locales
```

## Pages

1. **Landing Page** (`/`) - Display prizes and winners
2. **Registration** (`/register`) - Phone and entry code input
3. **OTP1** (`/otp1`) - First verification code
4. **OTP2** (`/otp2`) - Second verification code
5. **Share** (`/share`) - Social sharing options

## Build for Production

```bash
npm run build
npm start
```

## Deployment

The frontend can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any static hosting service

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable to your backend URL.
