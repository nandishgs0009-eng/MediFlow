# MediFlow - Complete Deployment Guide

## 🚀 Deployment Overview

MediFlow can be deployed in multiple ways:

1. **Web Application** (Already running locally)
2. **Mobile App** (iOS & Android via Expo)
3. **Backend Server** (Node.js hosting)
4. **Database** (PostgreSQL)

---

## 📋 Prerequisites

- Node.js v22+ installed
- npm or yarn package manager
- Git account (GitHub)
- Mobile devices or emulators for testing
- Hosting accounts (choose based on your preference)

---

## PART 1: Backend Deployment (Node.js Server)

### Option A: Deploy to Render (Recommended - Free Tier Available)

#### Step 1: Prepare Backend
```bash
# 1. Create a .env.production file in root
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_random_secret_key_here
NODE_ENV=production
PORT=5000
```

#### Step 2: Create Render Account
- Go to https://render.com
- Sign up with GitHub account
- Connect your GitHub repository

#### Step 3: Deploy on Render
```
1. Click "New +" > "Web Service"
2. Connect to your GitHub repository
3. Configure:
   - Name: mediflow-api
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm run build && node dist/server/index.js
   - Publish Port: 5000
4. Add Environment Variables:
   - DATABASE_URL: (from Neon)
   - SESSION_SECRET: (generate random)
   - NODE_ENV: production
5. Click "Create Web Service"
```

#### Step 4: Get Your Backend URL
```
Your API will be available at:
https://mediflow-api.onrender.com
```

### Option B: Deploy to Heroku

```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create mediflow-api

# 4. Set environment variables
heroku config:set DATABASE_URL="your_database_url"
heroku config:set SESSION_SECRET="your_secret"
heroku config:set NODE_ENV="production"

# 5. Deploy
git push heroku main
```

### Option C: Deploy to Railway.app (Simplest)

```
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL database
6. Set environment variables
7. Deploy
```

---

## PART 2: Database Deployment

### Option A: Neon PostgreSQL (Already Configured)

Your database is likely already on Neon. If not:

```bash
# 1. Go to https://console.neon.tech
# 2. Create new project
# 3. Copy DATABASE_URL
# 4. Use in your backend deployment
```

### Option B: Supabase (Alternative)

```
1. Go to https://supabase.com
2. Create new project
3. Get connection string
4. Use in backend deployment
```

---

## PART 3: Web Application Deployment

### Option A: Deploy to Vercel (Recommended for React/Vite)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Go to client directory
cd client

# 3. Deploy
vercel

# 4. During deployment:
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
# - Environment: Production
```

Or use GitHub integration:
```
1. Go to https://vercel.com
2. Import project from GitHub
3. Configure:
   - Framework: Vite
   - Build: npm run build
   - Output: dist
4. Set environment variables:
   - VITE_API_URL=https://your-backend-url.com
5. Deploy
```

### Option B: Deploy to Netlify

```bash
# 1. Go to https://netlify.com
# 2. Click "Add new site" > "Import an existing project"
# 3. Connect GitHub
# 4. Configure:
#    - Build command: npm run build
#    - Publish directory: dist
# 5. Add environment variables:
#    - VITE_API_URL=https://your-backend-url.com
# 6. Deploy
```

### Option C: Deploy to GitHub Pages

```bash
# 1. Update vite.config.ts
# Change base: '/'

# 2. Build
npm run build

# 3. Deploy to gh-pages
npm run build
git add .
git commit -m "Deploy"
git push origin main
```

---

## PART 4: Mobile App Deployment

### iOS Deployment

#### Step 1: Build for iOS
```bash
cd mobile

# Install dependencies
npm install

# Build iOS app
eas build --platform ios
```

#### Step 2: Submit to App Store
```bash
# Setup Apple Developer Account
# - Go to https://developer.apple.com
# - Create developer account ($99/year)
# - Create app bundle ID
# - Create certificates

# Submit app
eas submit --platform ios

# Or do it manually:
# 1. Open Xcode
# 2. Archive the app
# 3. Upload to App Store Connect
```

### Android Deployment

#### Step 1: Build for Android
```bash
cd mobile

# Install dependencies
npm install

# Build Android app (APK)
eas build --platform android --type apk

# Or build AAB (for Play Store)
eas build --platform android --type app-bundle
```

#### Step 2: Submit to Play Store
```bash
# Setup Google Play Account
# - Go to https://play.google.com/console
# - Create developer account ($25 one-time)
# - Create app

# Submit app
eas submit --platform android

# Or do it manually:
# 1. Go to Google Play Console
# 2. Create new app
# 3. Fill app details
# 4. Upload AAB file
# 5. Submit for review
```

### Using Expo for Quick Testing

```bash
# 1. Build APK directly (no app store)
eas build --platform android --type apk

# 2. Download APK
# 3. Install on Android device via email or file transfer

# For iOS, you need Apple Developer account
```

---

## PART 5: Configuration Updates

### Update API URL in Frontend

After backend deployment, update your frontend:

**File: `client/src/lib/queryClient.ts`**
```typescript
// Change from localhost to your deployed backend
const API_BASE_URL = 'https://mediflow-api.onrender.com';
```

**File: `mobile/src/services/auth.ts`**
```typescript
const API_URL = 'https://mediflow-api.onrender.com';
```

### Update Environment Variables

**For Web:**
```bash
# .env.production
VITE_API_URL=https://mediflow-api.onrender.com
```

**For Mobile:**
Update `expo.json` or create `.env.production`:
```
API_URL=https://mediflow-api.onrender.com
```

---

## PART 6: Complete Deployment Checklist

### Pre-Deployment
- [ ] Test all features locally
- [ ] Run: `npm run build` (check for errors)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user seeded

### Backend Deployment
- [ ] Render/Heroku/Railway account created
- [ ] GitHub repository connected
- [ ] Environment variables set
- [ ] Database URL configured
- [ ] Backend URL obtained
- [ ] Test API endpoints with Postman

### Web Deployment
- [ ] Vercel/Netlify account created
- [ ] Build command configured
- [ ] Output directory set to `dist`
- [ ] Environment variables updated
- [ ] Test web app works

### Mobile Deployment
- [ ] EAS account created (via Expo)
- [ ] Apple Developer account (for iOS) - Optional
- [ ] Google Developer account (for Android) - $25
- [ ] Build successful
- [ ] App tested on devices

---

## PART 7: Quick Start Deployment Steps

### For Development/Testing (Free - Recommended First)

```bash
# 1. Deploy Backend to Render (Free Tier)
# Go to https://render.com and follow Option A above

# 2. Deploy Frontend to Vercel (Free)
# Go to https://vercel.com and follow Option A above

# 3. Build Mobile APK for Android (Free)
cd mobile
eas build --platform android --type apk

# 4. Share APK link for Android testing
# Users can download and install directly
```

### For Production (Requires Payment)

```bash
# 1. Backend: Render (paid) / Heroku
# Cost: $7-12/month

# 2. Frontend: Vercel (free with pro features)
# Cost: Free tier available

# 3. Database: Neon PostgreSQL (free tier available)
# Cost: Free tier available

# 4. Mobile App Store
# iOS: $99/year + Apple Developer
# Android: $25 one-time + Google Developer
```

---

## PART 8: Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| Backend (Render) | Limited | $7/month |
| Frontend (Vercel) | Yes | $20/month (optional) |
| Database (Neon) | Yes | $0.25/month (optional) |
| iOS App Store | ❌ | $99/year |
| Android Play Store | ❌ | $25 one-time |
| **Total/Month** | **Free** | **$7-12** |
| **Total/Year** | **Free** | **$84-150+** |

---

## PART 9: Post-Deployment Steps

### 1. Test Everything
```bash
# Test web app
curl https://your-frontend-url.com

# Test API
curl https://your-backend-url.com/api/auth/me

# Test mobile app
# Install APK and test all features
```

### 2. Monitor Performance
- Set up error tracking (Sentry)
- Monitor database (Neon dashboard)
- Check server logs (Render/Heroku dashboard)

### 3. User Access
Share these links:
- **Web**: `https://your-frontend-url.com`
- **Mobile (Android)**: APK download link
- **Mobile (iOS)**: App Store link (after approval)

---

## PART 10: Troubleshooting

### API Not Connecting
```bash
# 1. Check backend URL is correct
# 2. Check CORS is enabled in backend
# 3. Check environment variables are set
# 4. Check database connection
# 5. Verify API endpoints exist
```

### Database Connection Error
```bash
# 1. Verify DATABASE_URL is correct
# 2. Check PostgreSQL is running
# 3. Test connection: psql $DATABASE_URL
# 4. Run migrations
```

### Mobile App Won't Install
```bash
# For Android APK
# 1. Enable "Unknown Sources" in settings
# 2. Check Android version compatibility
# 3. Check if APK is corrupted (re-download)

# For iOS
# 1. Check Apple Developer account is active
# 2. Verify certificate is not expired
# 3. Check provisioning profile
```

---

## PART 11: Recommended Quick Deploy Path

### Fastest Way to Deploy (30 minutes)

1. **Backend to Render**
   - Go to https://render.com
   - Click "New Web Service"
   - Connect GitHub repo
   - Set environment variables
   - Deploy (takes 5 minutes)

2. **Frontend to Vercel**
   - Go to https://vercel.com
   - Import from GitHub
   - Set build settings
   - Deploy (takes 2 minutes)

3. **Mobile to TestFlight (iOS) / Google Play Console (Android)**
   - Build with EAS
   - TestFlight link for iOS testers
   - Play Store Internal Testing for Android

4. **Share with Users**
   - Web: Direct link
   - Mobile: TestFlight/Play Store link or APK

---

## Next Steps

1. Choose your deployment option
2. Follow the specific guide above
3. Test thoroughly
4. Share with users
5. Monitor for issues

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
