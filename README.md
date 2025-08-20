# BITSPARK - AI-Powered Social & Dating Platform for BITS Students

A comprehensive social and dating platform exclusively for BITS Pilani students across all campuses, featuring AI-powered matching, controlled messaging, and innovative social features.

## 🚀 Features

### Core Features
- **CONNECT**: AI-powered friend matching with personality compatibility
- **FIND A DATE**: Romantic connections with event-specific matching
- **SHIPPING**: Third-party matchmaking by friends
- **Smart Messaging**: 5-message limit with platform redirection
- **Daily Matches**: Algorithm-powered daily suggestions
- **Group Rooms**: Community building (coming soon)

### Key Highlights
- BITS email verification required
- AI matching with +1 (similar) or -1 (opposite) preferences
- Real-time messaging with encryption
- Cross-campus connections
- Comprehensive safety features

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **UI Components**: Custom components with Radix UI
- **Authentication**: Supabase Auth with BITS email validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- Supabase account

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bitspark
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the provided Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cbxdhezjxsysfigqutut.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieGRoZXpqeHN5c2ZpZ3F1dHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUzMTQsImV4cCI6MjA3MTIxMTMxNH0.C2tRbgSI6blgA10O-T-77_l0JV2FPgsMLtp_cWXE7Xk
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 Boilerplate Links to Replace

The following placeholders need to be replaced with actual implementations:

### External API Integrations
- **Instagram API**: Replace Instagram integration URLs and credentials
- **WhatsApp Business API**: Replace WhatsApp integration for message redirection
- **Email Service**: Replace with actual email service (SendGrid, Resend, etc.)
- **SMS Service**: Replace with Twilio or similar for OTP
- **File Storage**: Replace with Cloudinary or AWS S3 for image uploads

### Authentication & Verification
- **Student ID Verification**: Implement OCR and manual verification system
- **Profile Photo Verification**: Implement face detection and duplicate checking
- **Google Verification**: Add actual Google Search Console verification code

### Assets & Branding
- **Favicon Files**: Add actual favicon.ico, apple-touch-icon.png
- **Manifest File**: Create actual PWA manifest.json
- **OG Images**: Add social media preview images
- **Domain**: Replace bitspark.app with actual domain

### Premium Features
- **Payment Integration**: Implement Stripe for premium subscriptions
- **Premium Upgrade Page**: Create actual premium features page

### Analytics & Monitoring
- **Analytics ID**: Replace with actual Google Analytics or PostHog ID
- **Error Tracking**: Implement Sentry for error monitoring

## 📱 Database Schema

The application uses Supabase with the following main tables:
- `users` - User profiles and preferences
- `connections` - Friend and dating connections
- `messages` - Chat messages with 5-message limit
- `ships` - Third-party matchmaking records
- `daily_matches` - AI-generated daily suggestions
- `notifications` - User notifications
- `reports` - Safety and moderation reports

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- BITS email domain validation
- End-to-end message encryption
- Comprehensive reporting system
- Profile verification requirements
- Rate limiting and spam protection

## 🚀 Deployment

The application is configured for deployment on:
- **Frontend**: Vercel (recommended)
- **Database**: Supabase (already configured)
- **File Storage**: Cloudinary or AWS S3 (needs setup)

## 📖 Usage

1. **Sign Up**: Use your BITS email (@pilani.bits-pilani.ac.in)
2. **Verify**: Upload student ID and profile photo for verification
3. **Set Preferences**: Choose similarity preferences (+1 or -1)
4. **Start Connecting**: Use CONNECT for friends, FIND A DATE for romantic connections
5. **Message**: 5 messages per connection, then redirect to external platforms
6. **Daily Matches**: Check daily for AI-suggested matches

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for BITS Pilani community use only.

## 🆘 Support

For technical issues or feature requests, please contact the development team.

---

**Note**: This application is exclusively for verified BITS Pilani students across all campuses (Pilani, Goa, Hyderabad, Dubai).