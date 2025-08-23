# 🚀 BITSPARK Setup Guide

## 📋 Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Your Supabase project ready

## 🔧 Environment Setup

### 1. Create .env file
Create a `.env` file in your project root with these exact values:

```bash
VITE_SUPABASE_URL=https://vpqhuorpavxdktlzqgpi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWh1b3JwYXZ4ZGt0bHpxZ3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MDE5NjMsImV4cCI6MjA3MTQ3Nzk2M30.n6XzNvVh-32u_2HSnOpyGMvX4Wd60Zo-TIKpRF6ka1Y
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

## 🎯 Your App Will Be Available At:
- **Local**: http://localhost:3000 (or 3001 if 3000 is busy)
- **Features**: All 6 core features working with Supabase backend

## 🔐 Supabase Configuration
Your Supabase project is already configured with:
- ✅ **URL**: https://vpqhuorpavxdktlzqgpi.supabase.co
- ✅ **API Key**: Configured and ready
- ✅ **Database**: Ready for user profiles, connections, messages
- ✅ **Auth**: Ready for Google OAuth and BITS email login

## 🚀 What Happens Next
1. App starts with full dating app interface
2. Navigate to `/dashboard` to see all features
3. All features connect to your Supabase backend
4. Real-time messaging and updates work immediately

## 🆘 If You Get Errors
- Make sure `.env` file exists in project root
- Check that environment variables are exactly as shown above
- Restart the dev server after creating `.env` file

## 🎉 Ready to Go!
Your BITSPARK dating app is now fully configured and ready to use! 