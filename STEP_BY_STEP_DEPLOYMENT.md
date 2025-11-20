# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE FOR MEDIFLOW

## 📋 TABLE OF CONTENTS

1. **Option 1: Deploy on AWS (FREE - Recommended)**
2. **Option 2: Deploy on Render + Vercel (FREE - Easiest)**
3. **Option 3: Deploy on Replit (FREE - Already Running)**
4. **Option 4: Deploy on Railway (Pay-as-you-go)**

---

## ✅ OPTION 1: AWS DEPLOYMENT (Complete & Free for 12 months)

### PHASE 1: Prepare Your Code (10 minutes)

#### Step 1.1: Create GitHub Repository (Optional but recommended)
```bash
# Initialize git if not done
cd c:\Users\hp\Downloads\SmartMedicationTracker\smt updation
git init
git add .
git commit -m "Initial commit - MediFlow app"

# Create repository on GitHub
# Go to: https://github.com/new
# Name: SmartMedicationTracker
# Push your code:
git remote add origin https://github.com/YOUR_USERNAME/SmartMedicationTracker.git
git branch -M main
git push -u origin main
```

#### Step 1.2: Prepare .env File
```bash
# Create .env file with your settings
# File: c:\Users\hp\Downloads\SmartMedicationTracker\smt updation\.env

NODE_ENV=development
DATABASE_URL=postgresql://user:password@your-neon-db.neon.tech/mediflow
SESSION_SECRET=your-random-secret-key-here
PORT=5000
```

#### Step 1.3: Test Locally
```bash
cd c:\Users\hp\Downloads\SmartMedicationTracker\smt updation

# Install dependencies
npm install

# Build frontend
npm run build

# Start backend
npm run dev

# Visit http://localhost:5000
# Should see the app running
```

---

### PHASE 2: Create AWS Resources (20 minutes)

#### Step 2.1: Create EC2 Instance for Backend

**Go to:** https://console.aws.amazon.com

**Steps:**
```
1. AWS Console > EC2 > Instances > Launch Instances
2. Name: "mediflow-backend"
3. OS: Ubuntu 22.04 LTS (Free tier eligible)
4. Instance Type: t3.micro (Free tier)
5. Key Pair:
   - Click "Create new key pair"
   - Name: "mediflow-key"
   - Type: .pem (for Windows)
   - Download and SAVE securely
6. Network Settings:
   - VPC: Default
   - Auto-assign Public IP: Enable
7. Security Group:
   - Create new: "mediflow-sg"
   - Add inbound rules:
     ✓ SSH (22) - from My IP
     ✓ HTTP (80) - from 0.0.0.0/0
     ✓ HTTPS (443) - from 0.0.0.0/0
     ✓ TCP (5000) - from 0.0.0.0/0
8. Storage: 20GB (default)
9. Launch Instance
10. Wait 2-3 minutes for it to start
11. Copy Public IPv4 address (e.g., 54.123.45.67)
```

#### Step 2.2: Create RDS Database

**Steps:**
```
1. AWS Console > RDS > Create Database
2. Engine: PostgreSQL (Free tier eligible)
3. DB Instance Identifier: "mediflow-db"
4. Master Username: "admin"
5. Master Password: Create strong password (SAVE IT!)
6. DB Instance Class: db.t3.micro (Free tier)
7. Allocated Storage: 20 GB (Free tier)
8. Availability: Single AZ
9. VPC: Default VPC
10. Public Accessibility: Yes
11. Create Database
12. Wait 5-10 minutes for creation
13. Copy Endpoint: mediflow-db.xxxxx.rds.amazonaws.com
```

---

### PHASE 3: Connect & Setup EC2 Backend (20 minutes)

#### Step 3.1: Connect via SSH (Windows PowerShell)

```powershell
# Navigate to where you saved mediflow-key.pem
cd C:\Users\YourUsername\Downloads

# Fix key permissions
icacls "mediflow-key.pem" /inheritance:r
icacls "mediflow-key.pem" /grant:r "$($env:USERNAME):(F)"

# Connect to EC2
ssh -i "mediflow-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Example:
# ssh -i "mediflow-key.pem" ubuntu@54.123.45.67

# Type "yes" when asked about authenticity
```

#### Step 3.2: Install Dependencies (On EC2)

```bash
# Once connected to EC2, run these commands:

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Verify
pm2 -v
```

#### Step 3.3: Upload Project Files

**Option A: Clone from GitHub (Recommended)**
```bash
cd ~/apps
git clone https://github.com/YOUR_USERNAME/SmartMedicationTracker.git
cd SmartMedicationTracker/"smt updation"
```

**Option B: Upload via SCP (Windows PowerShell)**
```powershell
# From your local machine, in project directory:

# Create directory on EC2
ssh -i "mediflow-key.pem" ubuntu@YOUR_EC2_IP "mkdir -p ~/apps"

# Upload files
scp -i "medifilm-key.pem" -r client ubuntu@YOUR_EC2_IP:~/apps/
scp -i "mediflow-key.pem" -r server ubuntu@YOUR_EC2_IP:~/apps/
scp -i "mediflow-key.pem" -r shared ubuntu@YOUR_EC2_IP:~/apps/
scp -i "mediflow-key.pem" package.json ubuntu@YOUR_EC2_IP:~/apps/
```

#### Step 3.4: Install Project Dependencies & Start Backend

```bash
# SSH into EC2
ssh -i "mediflow-key.pem" ubuntu@YOUR_EC2_IP

# Navigate to project
cd ~/apps/SmartMedicationTracker/"smt updation"

# Create .env file
nano .env

# Paste this (replace with your values):
NODE_ENV=production
DATABASE_URL=postgresql://admin:YOUR_PASSWORD@mediflow-db.xxxxx.rds.amazonaws.com:5432/mediflow
SESSION_SECRET=$(openssl rand -base64 32)
PORT=5000

# Save: Ctrl+X, then Y, then Enter

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start "npm start" --name "mediflow-backend"

# Enable auto-restart
sudo pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs mediflow-backend
```

#### Step 3.5: Setup Database

```bash
# Create database
psql -h mediflow-db.xxxxx.rds.amazonaws.com \
     -U admin \
     -c "CREATE DATABASE mediflow;"

# Run migrations
npm run db:push
```

#### Step 3.6: Test Backend

```bash
# From your local machine:

# Test from terminal
curl http://YOUR_EC2_IP:5000

# Or open in browser:
http://YOUR_EC2_IP:5000

# Should see response or app
```

---

### PHASE 4: Deploy Frontend to S3 (15 minutes)

#### Step 4.1: Build Frontend

```bash
# On your local machine:

cd c:\Users\hp\Downloads\SmartMedicationTracker\smt updation\client

# Update backend URL first!
# File: client/src/lib/queryClient.ts
# Change: const API_URL = 'http://YOUR_EC2_IP:5000'

# Build
npm run build

# Creates: client/build/ folder
```

#### Step 4.2: Create S3 Bucket

**Steps:**
```
1. AWS Console > S3 > Create Bucket
2. Bucket Name: "mediflow-web-YYYYMMDD"
3. Region: Same as EC2
4. Block all public access: UNCHECK
5. Create Bucket
```

#### Step 4.3: Upload to S3

**Using AWS CLI:**
```bash
# Install AWS CLI (if not installed)
# Download: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter: Access Key ID
# Enter: Secret Access Key
# Enter: Region (same as EC2)
# Enter: Output format (json)

# Upload files
cd c:\Users\hp\Downloads\SmartMedicationTracker\smt updation
aws s3 sync client/build s3://mediflow-web-YYYYMMDD --delete

# Done!
```

#### Step 4.4: Enable Static Website Hosting

**Steps:**
```
1. S3 > mediflow-web-xxx > Properties
2. Static website hosting > Edit
3. Enable: "Host a static website"
4. Index document: index.html
5. Error document: index.html
6. Save
7. Copy Website endpoint URL
```

---

### PHASE 5: Build & Deploy Mobile App (30-45 minutes)

#### Step 5.1: Build APK

```bash
# On your local machine:

# Install Expo CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK
cd c:\Users\hp\Downloads\SmartMedicationTracker\smt updation\client
eas build --platform android --type apk

# Wait 30-45 minutes for build
# Download APK file
```

#### Step 5.2: Share APK with Users

```
1. Upload APK to file hosting (Google Drive, Dropbox, etc.)
2. Share download link
3. Users download on Android phone
4. Enable Unknown Sources: Settings > Security
5. Install APK
6. Open app and login
```

---

### PHASE 6: Test Everything (15 minutes)

#### Step 6.1: Test Backend API

```bash
# From terminal or Postman:

# Test health check
curl http://YOUR_EC2_IP:5000

# Test login
curl -X POST http://YOUR_EC2_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"gsnandish@gmail.com","password":"Gsnandish"}'
```

#### Step 6.2: Test Frontend Web

```
1. Open browser
2. Go to: http://your-s3-website-endpoint
3. See the app loading
4. Try to login with credentials
5. Dashboard should load
```

#### Step 6.3: Test Mobile App

```
1. Install APK on Android phone
2. Open app
3. Login with credentials
4. Test features
5. Test notifications
```

---

## ✅ OPTION 2: RENDER + VERCEL (Easiest, Completely Free)

### PHASE 1: Deploy Backend to Render (10 minutes)

#### Step 1.1: Prepare Repository

```bash
cd c:\Users\hp\Downloads\SmartMedicationTracker\smt updation

# Push to GitHub
git push origin main
```

#### Step 1.2: Create Render Account

```
1. Go to: https://render.com
2. Sign up with GitHub
3. Connect GitHub account
```

#### Step 1.3: Create Web Service

```
1. Dashboard > New > Web Service
2. Connect repository: SmartMedicationTracker
3. Name: "mediflow-backend"
4. Environment: Node
5. Build Command: npm run build
6. Start Command: npm start
7. Environment Variables:
   - NODE_ENV: production
   - DATABASE_URL: (from Neon)
   - SESSION_SECRET: (generate random)
   - PORT: 5000
8. Create Web Service
9. Wait for deployment (5 minutes)
10. Copy URL: https://mediflow-backend.onrender.com
```

---

### PHASE 2: Deploy Frontend to Vercel (5 minutes)

#### Step 2.1: Create Vercel Account

```
1. Go to: https://vercel.com
2. Sign up with GitHub
```

#### Step 2.2: Import Project

```
1. Dashboard > New Project
2. Import Git Repository
3. Select: SmartMedicationTracker
4. Framework: Vite
5. Root Directory: client
6. Environment Variables:
   - VITE_API_URL: https://mediflow-backend.onrender.com
7. Deploy
8. Wait for deployment (3 minutes)
9. Copy URL: https://mediflow-web.vercel.app
```

---

## ✅ OPTION 3: REPLIT (Already Running)

Your app is already running on Replit! Just share the URL:

```
Frontend: https://your-replit-url.replit.dev
Backend: https://your-replit-url.replit.dev:5000
```

---

## 📱 STEP-BY-STEP MOBILE DEPLOYMENT

### If Using Google Play Store

#### Step 1: Create Google Play Developer Account
```
1. Go to: https://play.google.com/console
2. Pay: $25 one-time
3. Create account
```

#### Step 2: Upload Build
```
1. Play Console > Create app
2. Fill app details
3. Upload APK
4. Fill store listing
5. Submit for review
6. Wait 2-4 hours for approval
```

#### Step 3: Publish
```
1. After approval
2. Click "Publish"
3. App appears in Play Store
4. Users can download
```

---

## 🎯 RECOMMENDED DEPLOYMENT PATH

### For Beginners (Easiest):
```
1. Deploy Backend to Render (10 min)
2. Deploy Frontend to Vercel (5 min)
3. Build APK and share (45 min)
Total: 60 minutes
Cost: $0
```

### For Production (Best):
```
1. Deploy to AWS (covered above) - 90 minutes
2. Setup Route 53 for domain - 10 minutes
3. Publish to Google Play Store - 2 weeks
Total: 2 weeks + some work
Cost: $0-20/month
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Change all default passwords
- [ ] Store API keys in environment variables
- [ ] Enable HTTPS everywhere
- [ ] Setup firewall rules
- [ ] Enable MFA on accounts
- [ ] Regular backups
- [ ] Monitor costs

---

## 📊 DEPLOYMENT COMPARISON

| Platform | Ease | Cost | Time | Support |
|----------|------|------|------|---------|
| **AWS** | Medium | $0-20/mo | 90 min | Excellent |
| **Render+Vercel** | Easy | $0 | 15 min | Good |
| **Replit** | Very Easy | $0 | Now | Good |
| **Railway** | Medium | $5-15/mo | 20 min | Good |
| **Heroku** | Easy | $7+/mo | 20 min | Good |

---

## ✨ AFTER DEPLOYMENT

### Share with Users:

**Web App:**
```
Visit: https://your-frontend-url
Email: gsnandish@gmail.com
Password: Gsnandish
```

**Mobile App:**
```
Download APK: [link]
Same credentials as web
```

**Admin Access:**
```
Role: admin
Email: gsnandish@gmail.com
Password: Gsnandish
```

---

## 🆘 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Backend not running | Check PM2 logs: `pm2 logs` |
| Database connection error | Verify DATABASE_URL in .env |
| Frontend shows 404 | Check S3 static website hosting |
| Mobile app crashes | Check API_URL in code |
| Slow performance | Check resource usage |

---

## 📞 NEXT STEPS

**Choose your deployment option:**

1. **AWS** → Follow PHASE 1-6 above (complete setup)
2. **Render+Vercel** → Follow OPTION 2 (quick & easy)
3. **Keep on Replit** → Already working! (share URL)

**Most Recommended:** AWS for production, Render+Vercel for quick testing

---

**Start with Step 1 and work through! You've got this! 🚀**
