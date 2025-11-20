# 🚀 Deploy MediFlow on AWS Free Tier

## 📊 AWS Free Tier Benefits (12 Months)

| Service | Free Tier Amount | What We Use |
|---------|------------------|------------|
| **EC2** | 750 hours/month | Backend server |
| **RDS** | 750 hours/month + 20GB storage | Database (PostgreSQL) |
| **S3** | 5GB storage | File storage |
| **CloudFront** | 50GB transfer | CDN for frontend |
| **Lambda** | 1 million requests/month | Optional serverless |
| **Elastic Beanstalk** | Included with EC2 | Easy deployment |
| **Route 53** | $0.50/query (paid) | Domain management |
| **CloudWatch** | Included | Monitoring |

**Total Cost: $0/month for 12 months** ✅

---

## 🎯 AWS DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                    USERS (Web & Mobile)             │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
   │CloudFront│  │Route 53 │  │Direct   │
   │(CDN)     │  │(Domain) │  │Upload   │
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
        │ ┌──────────┼────────────┘
        │ │
   ┌────▼─▼───────────────────┐
   │   S3 (Frontend Files)     │
   │   - React build (web)     │
   │   - Static assets         │
   └──────────────────────────┘
   
   
   ┌─────────────────────────────┐
   │   EC2 Instance (Backend)    │
   │   - Node.js/Express         │
   │   - Runs on t3.micro        │
   │   - Port 5000               │
   │   - Free tier: 750 hrs/mo   │
   └────────────┬────────────────┘
                │
   ┌────────────▼────────────┐
   │  RDS PostgreSQL         │
   │  - Database (Neon alt)  │
   │  - db.t3.micro          │
   │  - 20GB storage free    │
   │  - 750 hrs/mo free      │
   └─────────────────────────┘
```

---

## ✅ STEP-BY-STEP DEPLOYMENT GUIDE

### STEP 1: Create AWS Account & EC2 Instance (10 minutes)

#### 1a. Sign in to AWS Console
```
1. Go to: https://console.aws.amazon.com
2. Sign in with your free tier account
3. Select region: Choose closest to you (e.g., us-east-1, ap-south-1)
```

#### 1b. Create EC2 Instance
```
1. Go to: Services > EC2
2. Click "Instances" > "Launch Instances"
3. Name: "mediflow-backend"
4. OS Image: Select "Ubuntu Server 22.04 LTS (Free tier eligible)"
5. Instance Type: Select "t3.micro" (Free tier)
6. Key Pair: 
   - Click "Create new key pair"
   - Name: "mediflow-key"
   - File type: .pem
   - Download and SAVE securely
7. Network Settings:
   - VPC: Default VPC
   - Subnet: Default subnet
   - Auto-assign Public IP: Enable
8. Security Group:
   - Create new security group
   - Name: "mediflow-backend-sg"
   - Add inbound rules:
     * Type: SSH (22) - Source: Your IP
     * Type: HTTP (80) - Source: 0.0.0.0/0
     * Type: HTTPS (443) - Source: 0.0.0.0/0
     * Type: Custom TCP (5000) - Source: 0.0.0.0/0
9. Storage: Keep default 20GB (Free tier)
10. Click "Launch Instance"
11. Wait 2-3 minutes for instance to start
```

#### 1c. Get Your Instance Details
```
1. Go to Instances
2. Click on your instance
3. Copy "Public IPv4 address" (e.g., 54.123.45.67)
4. This is your backend server address
```

---

### STEP 2: Connect to EC2 Instance & Deploy Backend (20 minutes)

#### 2a. Connect via SSH (Windows)
```
Windows PowerShell:

1. Navigate to where you saved mediflow-key.pem
2. Run:
   
   # Fix key permissions
   icacls "mediflow-key.pem" /inheritance:r
   icacls "mediflow-key.pem" /grant:r "$($env:USERNAME):(F)"
   
   # Connect to instance
   ssh -i mediflow-key.pem ubuntu@YOUR_PUBLIC_IPv4_ADDRESS
   
   # Example:
   ssh -i mediflow-key.pem ubuntu@54.123.45.67
   
3. Type "yes" when asked about authenticity
```

#### 2b. Install Dependencies on EC2
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js & npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install PostgreSQL client (optional, for connecting to RDS)
sudo apt install -y postgresql-client

# Verify installations
node -v
npm -v
pm2 -v
```

#### 2c. Clone Your Repository
```bash
# Create a directory for the app
mkdir -p ~/apps
cd ~/apps

# Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/SmartMedicationTracker.git
cd SmartMedicationTracker/"smt updation"

# Or manually upload files using SCP
# From your local machine:
# scp -i mediflow-key.pem -r client ubuntu@54.123.45.67:~/apps/
# scp -i mediflow-key.pem -r server ubuntu@54.123.45.67:~/apps/
# scp -i mediflow-key.pem -r shared ubuntu@54.123.45.67:~/apps/
```

#### 2d. Install Backend Dependencies
```bash
cd ~/apps/SmartMedicationTracker/"smt updation"

# Install npm packages
npm install

# Install TypeScript globally
sudo npm install -g typescript
```

#### 2e. Setup Environment Variables
```bash
# Create .env file in server directory
nano .env

# Add these variables:
NODE_ENV=production
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/mediflow
SESSION_SECRET=your-random-secret-key-here
PORT=5000

# Save: Ctrl+X, Y, Enter
```

#### 2f. Build and Start Backend with PM2
```bash
# Build TypeScript
npm run build

# Start backend with PM2
cd server
pm2 start "npm start" --name "mediflow-backend"

# Check status
pm2 status

# View logs
pm2 logs mediflow-backend

# Make PM2 start on server restart
sudo pm2 startup
pm2 save
```

---

### STEP 3: Setup RDS PostgreSQL Database (15 minutes)

#### 3a. Create RDS Instance
```
1. Go to: Services > RDS
2. Click "Create database"
3. Engine: PostgreSQL (Free tier eligible)
4. Version: 14.7 or latest
5. DB instance identifier: "mediflow-db"
6. Master username: "admin"
7. Master password: Create strong password (save it!)
8. DB instance class: db.t3.micro (Free tier)
9. Storage: 
   - Type: gp2
   - Allocated: 20 GB (Free tier)
   - Enable autoscaling: OFF (to stay in free tier)
10. Availability: Single AZ (Free tier)
11. VPC: Default VPC
12. Publicly accessible: Yes (for now)
13. Create database
14. Wait 5-10 minutes for creation
```

#### 3b. Get RDS Connection Details
```
1. Go to RDS > Databases
2. Click "mediflow-db"
3. Copy these details:
   - Endpoint (e.g., mediflow-db.xxxxx.rds.amazonaws.com)
   - Port (5432)
   - Master username (admin)
   - Database name (create during setup or create new)
4. Security Group: 
   - Click the security group link
   - Add inbound rule:
     * Type: PostgreSQL (5432)
     * Source: EC2 instance security group
```

#### 3c. Initialize Database
```bash
# From EC2 instance:

# Connect to PostgreSQL
psql -h mediflow-db.xxxxx.rds.amazonaws.com \
     -U admin \
     -d postgres \
     -c "CREATE DATABASE mediflow;"

# Run migrations (from your project directory)
npm run db:migrate
```

---

### STEP 4: Deploy Frontend to S3 + CloudFront (15 minutes)

#### 4a. Build Frontend
```bash
# From your local machine (in project directory)

# Build React app
cd client
npm run build

# This creates build/ folder with optimized files
```

#### 4b. Create S3 Bucket
```
1. Go to: Services > S3
2. Click "Create bucket"
3. Bucket name: "mediflow-web-app" (must be globally unique, add date)
4. Region: Same as EC2
5. Block all public access: UNCHECK (for hosting)
6. Create bucket
```

#### 4c. Upload Frontend Files
```bash
# Option 1: Using AWS CLI (recommended)

# Install AWS CLI (if not installed)
# Windows: Download from https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter: Access Key ID
# Enter: Secret Access Key
# Enter: Region (e.g., us-east-1)
# Enter: Default output format (json)

# Upload build files
aws s3 sync ./client/build s3://mediflow-web-app --delete

# Or manually:
# 1. Go to S3 > mediflow-web-app
# 2. Click "Upload"
# 3. Drag & drop build folder contents
# 4. Upload
```

#### 4d. Enable Static Website Hosting
```
1. Go to S3 > mediflow-web-app
2. Properties > Static website hosting
3. Enable: "Edit"
4. Hosting type: Host a static website
5. Index document: index.html
6. Error document: index.html (for React routing)
7. Save changes
8. Copy website endpoint URL
```

#### 4e. Update Backend URL in Frontend
```bash
# Before building, update backend URL in client code:

# File: client/src/lib/queryClient.ts
# Change API_URL to: http://YOUR_EC2_PUBLIC_IP:5000

# Then rebuild:
npm run build
aws s3 sync ./client/build s3://mediflow-web-app --delete
```

---

### STEP 5: Setup Custom Domain (Optional - 5 minutes)

#### 5a. Use Route 53 (if you have a domain)
```
1. Go to: Services > Route 53
2. Click "Hosted zones"
3. Create hosted zone for your domain
4. Add records:
   - Type: A record
   - Name: example.com
   - Value: Your S3 website endpoint
   - Routing: Simple
5. Update domain registrar nameservers
```

#### 5b. Or Use Direct IP
```
Simply use: http://YOUR_EC2_PUBLIC_IP:5000 (for backend)
            http://YOUR_S3_WEBSITE_URL (for frontend)
```

---

## 🧪 TESTING YOUR DEPLOYMENT

### Test Backend
```bash
# From any terminal:

# Test health check
curl http://YOUR_EC2_PUBLIC_IP:5000/api/health

# Or from browser:
http://YOUR_EC2_PUBLIC_IP:5000

# Should see: Connected or similar message
```

### Test Frontend
```bash
# Open in browser:
http://YOUR_S3_WEBSITE_ENDPOINT

# Or custom domain if set up:
https://example.com
```

### Test Full App
```
1. Open frontend URL
2. Try to sign up
3. Check database for new user
4. Try to login
5. Access patient/admin dashboard
```

---

## 📱 DEPLOY MOBILE APP

### Build APK for Mobile Users
```bash
# From your local machine:

# Install Expo CLI if not already
npm install -g expo-cli eas-cli

# Login to Expo
eas login

# Build APK
cd client
eas build --platform android --type apk

# This creates APK file (30-45 minutes)
# Download and share with users
# Users can install directly on Android phone
```

---

## 💰 COST TRACKING

### Free Tier Calculator
```
Monthly calculation:
- EC2 t3.micro: 750 hours included (24 * 30 = 720 hours)
- RDS db.t3.micro: 750 hours included
- S3 storage: 5GB free
- Data transfer: First 1GB free

Status: ✅ COMPLETELY FREE (if under limits)

To monitor:
1. Go to AWS Billing Dashboard
2. Set up budget alerts ($0 monthly)
3. Receive email if approaching limits
```

### Setup Billing Alerts
```
1. Go to: Services > Billing > Billing Preferences
2. Alert preferences:
   - Enable: Receive CloudWatch Alerts
   - Create alert for: $1 (safe buffer)
3. Email confirmation sent
4. You're protected!
```

---

## 🔒 SECURITY BEST PRACTICES

### Set Up Security
```
1. Enable MFA on AWS account
2. Create IAM user for app (not root)
3. Restrict EC2 security group to your IP
4. Use strong database passwords
5. Enable encryption at rest (RDS)
6. Use environment variables for secrets
7. Regular backups of RDS
```

### Create RDS Backup
```
1. Go to RDS > Databases > mediflow-db
2. Click "Actions" > "Create snapshot"
3. Name: "mediflow-backup-[date]"
4. Create snapshot
5. Can restore anytime
```

---

## 🚨 TROUBLESHOOTING

### Can't Connect to EC2
```
Problem: SSH connection refused
Solution: 
1. Check security group allows SSH (port 22)
2. Check IP address is correct
3. Check key file permissions
4. Verify key pair is .pem format
```

### Backend Not Starting
```
Problem: Backend won't start or crashes
Solution:
1. Check PM2 logs: pm2 logs mediflow-backend
2. Check environment variables: cat .env
3. Check database connection
4. Check port 5000 is open in security group
```

### Frontend Not Loading
```
Problem: S3 website shows error
Solution:
1. Check index.html uploaded to S3
2. Check static website hosting enabled
3. Check error document is index.html
4. Wait for DNS to propagate
5. Clear browser cache
```

### Database Connection Error
```
Problem: Can't connect to RDS
Solution:
1. Check database is running (RDS console)
2. Check security group allows port 5432
3. Check DATABASE_URL is correct
4. Check password is correct
5. Verify public accessibility is enabled
```

---

## 📈 SCALING (When You Grow)

### From Free Tier to Paid
```
When approaching limits:
1. Upgrade EC2: t3.micro → t3.small ($0.0208/hour)
2. Upgrade RDS: 20GB → more storage ($0.10/GB/month)
3. Add more instances with load balancer
4. Consider using Lambda for serverless
5. Add CloudFront for CDN ($0.085/GB)

Estimated cost: $5-15/month for small app
```

---

## 📚 HELPFUL LINKS

| Resource | Link |
|----------|------|
| AWS Console | https://console.aws.amazon.com |
| EC2 Docs | https://docs.aws.amazon.com/ec2 |
| RDS Docs | https://docs.aws.amazon.com/rds |
| S3 Docs | https://docs.aws.amazon.com/s3 |
| Route 53 Docs | https://docs.aws.amazon.com/route53 |
| AWS CLI | https://aws.amazon.com/cli |
| Free Tier Info | https://aws.amazon.com/free |

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] EC2 instance created and running
- [ ] SSH access working
- [ ] Node.js and npm installed
- [ ] Backend code deployed
- [ ] RDS database created
- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] Backend running with PM2
- [ ] Frontend built locally
- [ ] S3 bucket created
- [ ] Frontend files uploaded
- [ ] Static website hosting enabled
- [ ] Security groups configured
- [ ] Billing alerts set up
- [ ] Test login working
- [ ] Mobile APK built and tested

---

## 🎯 QUICK REFERENCE

```
YOUR DEPLOYMENT ENDPOINTS:

Backend API:
  http://YOUR_EC2_IP:5000
  
Frontend Web:
  http://YOUR_S3_WEBSITE_URL
  
Database:
  postgresql://admin:PASSWORD@RDS_ENDPOINT:5432/mediflow
  
Mobile App:
  [APK file for direct install]
  
Admin Login:
  Email: gsnandish@gmail.com
  Password: Gsnandish
  
Patient Test:
  [Create via signup]
```

---

**Questions? Check AWS documentation or contact AWS support (included free with account)** 🚀
