# ✅ AWS DEPLOYMENT CHECKLIST

## 🎯 PRE-DEPLOYMENT (5 minutes)

- [ ] AWS free tier account created at aws.amazon.com
- [ ] Logged into AWS Console
- [ ] Selected appropriate region (closest to your location)
- [ ] Project code ready on local machine
- [ ] `.env` file template created
- [ ] GitHub repository ready (optional, for easier deployment)

---

## 🚀 EC2 SETUP (15 minutes)

### Create Instance
- [ ] Navigated to EC2 Dashboard
- [ ] Clicked "Launch Instances"
- [ ] Named instance: "mediflow-backend"
- [ ] Selected Ubuntu 22.04 LTS (Free tier eligible)
- [ ] Selected t3.micro instance type (Free tier)
- [ ] Created new key pair: "mediflow-key"
- [ ] Downloaded .pem file and saved securely
- [ ] Created security group "mediflow-backend-sg"
- [ ] Added inbound rules:
  - [ ] SSH (22) from My IP
  - [ ] HTTP (80) from 0.0.0.0/0
  - [ ] HTTPS (443) from 0.0.0.0/0
  - [ ] TCP (5000) from 0.0.0.0/0
- [ ] Kept default 20GB storage
- [ ] Launched instance
- [ ] Waited for instance to start (2-3 minutes)
- [ ] Copied Public IPv4 address

### Connect to Instance
- [ ] Fixed key file permissions (Windows: icacls command)
- [ ] Connected via SSH successfully
- [ ] Tested connection: `whoami` returns "ubuntu"

---

## 📦 INSTALL DEPENDENCIES (10 minutes)

- [ ] Ran `sudo apt update && sudo apt upgrade -y`
- [ ] Installed Node.js: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -`
- [ ] Installed npm: `sudo apt install -y nodejs`
- [ ] Installed PM2: `sudo npm install -g pm2`
- [ ] Installed Git: `sudo apt install -y git`
- [ ] Verified Node version: `node -v`
- [ ] Verified npm version: `npm -v`
- [ ] Verified PM2 version: `pm2 -v`

---

## 📤 UPLOAD PROJECT FILES (10 minutes)

Choose one method:

### Method 1: Git Clone
- [ ] Navigated to ~/apps directory
- [ ] Cloned repository: `git clone [repo-url]`
- [ ] Verified files downloaded

### Method 2: SCP Upload (Windows PowerShell)
- [ ] Ran: `aws-upload.ps1` script
- [ ] Confirmed all files uploaded

### Method 3: Manual Upload
- [ ] Created ~/apps directory
- [ ] Manually uploaded client, server, shared folders
- [ ] Uploaded package.json and config files

---

## 🗄️ DATABASE SETUP (20 minutes)

### Create RDS Instance
- [ ] Went to RDS Console
- [ ] Clicked "Create database"
- [ ] Selected PostgreSQL engine
- [ ] Set identifier: "mediflow-db"
- [ ] Set master username: "admin"
- [ ] Set strong master password
- [ ] Selected db.t3.micro (Free tier)
- [ ] Set storage: 20GB with autoscaling OFF
- [ ] Selected single AZ
- [ ] Enabled "Publicly accessible"
- [ ] Created database
- [ ] Waited for creation (5-10 minutes)

### Get Database Credentials
- [ ] Copied endpoint: `[your-db-endpoint].rds.amazonaws.com`
- [ ] Noted port: 5432
- [ ] Noted username: admin
- [ ] Noted password: [your-password]

### Create Database
- [ ] Connected to RDS from EC2:
  ```bash
  psql -h [endpoint] -U admin -d postgres
  ```
- [ ] Created mediflow database:
  ```sql
  CREATE DATABASE mediflow;
  ```
- [ ] Exited psql

### Update Security Group
- [ ] Found RDS security group
- [ ] Added inbound rule:
  - [ ] Type: PostgreSQL (5432)
  - [ ] Source: EC2 instance security group

---

## ⚙️ BACKEND CONFIGURATION (10 minutes)

### Setup Environment
- [ ] Navigated to project directory
- [ ] Created `.env` file:
  ```bash
  nano .env
  ```
- [ ] Added variables:
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://admin:[password]@[endpoint]:5432/mediflow
  SESSION_SECRET=[generate-random-secret]
  PORT=5000
  ```
- [ ] Saved file (Ctrl+X, Y, Enter)
- [ ] Verified `.env` created

### Install Dependencies
- [ ] Ran: `npm install`
- [ ] Verified all packages installed
- [ ] Ran: `npm run build`
- [ ] Verified build successful

### Run Migrations
- [ ] Ran: `npm run db:migrate` (or your migration command)
- [ ] Verified migrations completed

### Start Backend
- [ ] Started with PM2: `pm2 start "npm start" --name "mediflow-backend"`
- [ ] Verified running: `pm2 status`
- [ ] Checked logs: `pm2 logs mediflow-backend`
- [ ] Enabled auto-restart:
  ```bash
  sudo pm2 startup
  pm2 save
  ```

### Test Backend
- [ ] Tested locally on EC2: `curl http://localhost:5000`
- [ ] Tested from local machine: `curl http://[EC2-IP]:5000`
- [ ] Backend is responding

---

## 🌐 FRONTEND DEPLOYMENT (15 minutes)

### Build Frontend
- [ ] Local machine: `cd client`
- [ ] Updated backend URL to EC2 IP (if hardcoded)
- [ ] Ran: `npm run build`
- [ ] Verified build/ folder created

### Create S3 Bucket
- [ ] Went to S3 Console
- [ ] Clicked "Create bucket"
- [ ] Named bucket: "mediflow-web-[date]"
- [ ] Same region as EC2
- [ ] Unchecked "Block all public access"
- [ ] Created bucket

### Upload Frontend Files
- [ ] Installed AWS CLI (or used console)
- [ ] Configured AWS CLI: `aws configure`
- [ ] Uploaded files: `aws s3 sync ./client/build s3://mediflow-web-[date]`
- [ ] Verified files in S3 bucket

### Enable Static Website Hosting
- [ ] Selected bucket in S3
- [ ] Properties > Static website hosting
- [ ] Enabled hosting
- [ ] Index document: index.html
- [ ] Error document: index.html
- [ ] Copied website endpoint URL

### Test Frontend
- [ ] Opened S3 website URL in browser
- [ ] App loaded successfully
- [ ] Login page visible

---

## 📱 MOBILE APP (10 minutes)

### Build APK
- [ ] Local machine: `npm install -g eas-cli`
- [ ] Logged in: `eas login`
- [ ] Built APK: `eas build --platform android --type apk`
- [ ] Waited for build (30-45 minutes)
- [ ] Downloaded APK file

### Test on Mobile
- [ ] Downloaded APK to Android phone
- [ ] Enabled "Unknown Sources" in settings
- [ ] Installed APK
- [ ] Opened app
- [ ] Tested login and basic features

---

## 🔒 SECURITY & MONITORING (10 minutes)

### Billing Alerts
- [ ] Went to AWS Billing
- [ ] Set budget alert at $1
- [ ] Enabled email notifications
- [ ] Verified email confirmation

### Monitor Resources
- [ ] Checked EC2 dashboard
- [ ] Verified instance is running
- [ ] Checked estimated hours used
- [ ] Verified within free tier limits

### Security Setup
- [ ] Enabled MFA on AWS account
- [ ] Created backup of database
- [ ] Verified SSH key is secure
- [ ] Reviewed security group rules

---

## 🧪 TESTING (15 minutes)

### Backend Tests
- [ ] [ ] Backend API responding on EC2 IP
- [ ] [ ] Admin login works
- [ ] [ ] Patient signup works
- [ ] [ ] Database operations working
- [ ] [ ] Logout working

### Frontend Tests
- [ ] [ ] Web app loads from S3
- [ ] [ ] Login page displays
- [ ] [ ] Can login with credentials
- [ ] [ ] Dashboard loads
- [ ] [ ] API calls working

### Mobile Tests
- [ ] [ ] APK installs on phone
- [ ] [ ] App launches
- [ ] [ ] Can login
- [ ] [ ] Can view treatments
- [ ] [ ] Notifications working

---

## 📊 MONITORING (Ongoing)

- [ ] Setup CloudWatch monitoring
- [ ] Check EC2 CPU usage daily
- [ ] Monitor database connections
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database weekly

---

## 💾 BACKUP CHECKLIST

### Database Backups
- [ ] Created RDS snapshot
- [ ] Named snapshot: "mediflow-backup-[date]"
- [ ] Set automated backups to 7 days
- [ ] Tested restore procedure

### Code Backups
- [ ] Pushed code to GitHub
- [ ] Verified all commits pushed
- [ ] Created release tag

### Configuration Backups
- [ ] Downloaded .env file locally
- [ ] Downloaded SSH key backup
- [ ] Stored securely offline

---

## ✅ FINAL VERIFICATION

### All Systems Go?
- [ ] Backend running and accessible
- [ ] Frontend loading from S3
- [ ] Database connected
- [ ] Mobile app working
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Security setup complete
- [ ] Billing alerts active

### User Access
- [ ] Admin can login
- [ ] Patient can signup
- [ ] Patient can login
- [ ] Dashboard loads correctly
- [ ] All features working

---

## 🎉 DEPLOYMENT COMPLETE!

Your MediFlow application is now live on AWS Free Tier!

**Endpoints:**
- Backend: `http://[Your-EC2-IP]:5000`
- Frontend: `http://[Your-S3-Website-URL]`
- Mobile: Download APK file

**Share with users:**
```
Visit: http://[Your-S3-Website-URL]
Download mobile app: [APK-download-link]

Demo credentials:
Email: gsnandish@gmail.com
Password: Gsnandish
```

---

## 📞 SUPPORT

If you encounter issues:

1. **Backend not running:**
   ```bash
   ssh -i key.pem ubuntu@[IP]
   pm2 logs mediflow-backend
   ```

2. **Database connection error:**
   ```bash
   psql -h [endpoint] -U admin -d mediflow
   ```

3. **Frontend not loading:**
   Check S3 bucket policies and CloudFront settings

4. **Security group issues:**
   Verify inbound rules for ports 22, 80, 443, 5000

---

**Congratulations! 🎊 Your MediFlow app is now deployed on AWS!**
