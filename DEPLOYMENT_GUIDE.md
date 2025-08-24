# 🚀 BITSPARK Deployment Guide

## 1. Supabase Setup

### Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/create_complete_schema.sql`
3. Verify all tables are created with RLS enabled

### Authentication Setup
1. Go to Authentication → Settings
2. **Site URL**: `https://your-domain.com`
3. **Redirect URLs**: Add `https://your-domain.com/auth/callback`
4. **Email Settings**: 
   - Enable email provider
   - Disable email confirmation for development
   - Enable email confirmation for production

### Google OAuth (Optional)
1. Go to Authentication → Providers
2. Enable Google provider
3. Add Google OAuth credentials from Google Cloud Console

## 2. Frontend Deployment (Vercel/Netlify)

### Environment Variables:
```bash
VITE_SUPABASE_URL=https://vpqhuorpavxdktlzqgpi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Build Settings:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18+

## 3. Backend Deployment (Render)

### Environment Variables:
```bash
DATABASE_URL=postgresql://postgres:[password]@db.vpqhuorpavxdktlzqgpi.supabase.co:5432/postgres
API_SECRET_KEY=generate-secure-random-key
JWT_SECRET_KEY=generate-secure-random-key
ALLOWED_ORIGINS=https://your-frontend-domain.com
ENVIRONMENT=production
SUPABASE_URL=https://vpqhuorpavxdktlzqgpi.supabase.co
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
```

### Render Settings:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Python Version**: 3.11

## 4. Security Configuration

### Generate Secure Keys:
```bash
# For API_SECRET_KEY and JWT_SECRET_KEY
openssl rand -hex 32
```

### CORS Origins:
- Production: Only your actual domain
- Development: localhost:3000, localhost:5173

## 5. Testing Authentication

### Create Test User:
1. Supabase Dashboard → Authentication → Users
2. Add user with BITS email: `test@pilani.bits-pilani.ac.in`
3. Set password: `testpassword123`
4. Manually confirm email

### Test Flow:
1. Visit your deployed app
2. Click "Sign In"
3. Use test credentials
4. Complete onboarding
5. Access dashboard

## 6. Production Checklist

### Security:
- ✅ RLS enabled on all tables
- ✅ JWT authentication implemented
- ✅ CORS properly configured
- ✅ Environment variables secured
- ✅ Rate limiting enabled
- ✅ Security headers added

### Performance:
- ✅ Database indexes created
- ✅ Connection pooling configured
- ✅ Local fallback algorithm
- ✅ Optimized queries

### Monitoring:
- ✅ Health check endpoint
- ✅ Error logging
- ✅ Performance metrics
- ✅ Security monitoring

Your BITSPARK app is now production-ready! 🎉