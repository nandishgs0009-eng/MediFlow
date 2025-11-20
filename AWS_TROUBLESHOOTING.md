# 🔧 AWS DEPLOYMENT TROUBLESHOOTING GUIDE

## 🚨 Common Issues & Solutions

---

## 1. SSH Connection Issues

### Problem: "Permission denied (publickey)"

**Cause:** Key file permissions or wrong key

**Solution:**
```powershell
# Windows PowerShell - Fix permissions
icacls "path\to\mediflow-key.pem" /inheritance:r
icacls "path\to\mediflow-key.pem" /grant:r "$($env:USERNAME):(F)"

# Then try connecting again
ssh -i "path\to\mediflow-key.pem" ubuntu@YOUR_EC2_IP
```

### Problem: "Connection timed out"

**Cause:** Security group doesn't allow SSH

**Solution:**
1. Go to EC2 > Security Groups
2. Click your security group
3. Edit inbound rules
4. Add: SSH (22) from 0.0.0.0/0 or your IP
5. Wait 30 seconds and try again

### Problem: "No matching host key type found"

**Cause:** Old SSH version

**Solution:**
```bash
ssh -i mediflow-key.pem -o HostKeyAlgorithms=+ssh-rsa ubuntu@YOUR_EC2_IP
```

---

## 2. Backend Startup Issues

### Problem: "npm command not found"

**Cause:** Node.js not installed

**Solution:**
```bash
# SSH into EC2 first, then:
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### Problem: Backend crashes immediately

**Cause:** Check logs

**Solution:**
```bash
# View PM2 logs
pm2 logs mediflow-backend

# View recent errors
pm2 logs mediflow-backend --err

# Restart and watch
pm2 restart mediflow-backend && pm2 logs mediflow-backend
```

### Problem: "DATABASE_URL must be set"

**Cause:** Environment variables not loaded

**Solution:**
```bash
# Check .env file exists
cat ~/.env

# If not, create it
nano ~/.env

# Add:
# NODE_ENV=production
# DATABASE_URL=postgresql://...
# SESSION_SECRET=...
# PORT=5000

# Source it
source ~/.env

# Start again
pm2 start "npm start" --name "mediflow-backend"
```

### Problem: Port 5000 already in use

**Cause:** Another process using port

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill it (get PID from above)
kill -9 PID

# Or just use different port
PORT=5001 pm2 start "npm start"
```

### Problem: Out of memory

**Cause:** Not enough RAM on t3.micro

**Solution:**
```bash
# Check memory
free -h

# Enable swap (temporary relief)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Or upgrade to t3.small (paid)
```

---

## 3. Database Connection Issues

### Problem: "Cannot connect to database"

**Cause:** Several possibilities

**Solution - Step by step:**

```bash
# 1. Check PostgreSQL client installed
which psql

# 2. Verify database URL format
echo $DATABASE_URL

# 3. Test connection directly
psql -h your-db-endpoint.rds.amazonaws.com \
     -U admin \
     -d mediflow \
     -c "SELECT 1;"

# 4. If timeout, check security group
# Go to RDS > Databases > mediflow-db > Security
# Verify port 5432 is open from EC2 security group
```

### Problem: "FATAL: password authentication failed"

**Cause:** Wrong password

**Solution:**
```bash
# Check password in .env
grep DATABASE_URL ~/.env

# Reset RDS password:
# 1. Go to RDS Console
# 2. Click mediflow-db
# 3. Modify > Master password
# 4. Update .env file
# 5. Restart backend
pm2 restart mediflow-backend
```

### Problem: "Cannot drop table (permission denied)"

**Cause:** Running migrations as wrong user

**Solution:**
```bash
# Connect as admin (which you should)
psql -h endpoint -U admin -d mediflow

# Or check migrations file has correct permissions
npm run db:migrate -- --force
```

### Problem: RDS instance won't start

**Cause:** Usually temporary

**Solution:**
1. Go to RDS Console
2. Click mediflow-db
3. Click Reboot database
4. Wait 2-3 minutes
5. Try connecting again

---

## 4. Frontend/S3 Issues

### Problem: "403 Forbidden" when accessing S3 website

**Cause:** Permissions or not publicly accessible

**Solution:**
```bash
# 1. Check bucket policy
# Go to S3 > bucket > Permissions > Bucket policy
# Should allow GetObject

# Add this policy if missing:
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}

# 2. Ensure static website hosting enabled
# Properties > Static website hosting > Enable

# 3. Clear CloudFront cache (if using)
```

### Problem: Frontend loads but API calls fail

**Cause:** Backend URL is wrong or CORS issue

**Solution:**
```bash
# 1. Update backend URL in frontend code
# File: client/src/lib/queryClient.ts
# Change API_URL to correct EC2 IP

# 2. Rebuild and redeploy
npm run build
aws s3 sync ./client/build s3://your-bucket-name --delete

# 3. Add CORS headers to backend
# In server/index.ts add:
app.use(cors({
  origin: 'http://your-s3-url',
  credentials: true
}));
```

### Problem: "Blank page" when opening S3 website

**Cause:** index.html not found or routing issue

**Solution:**
```bash
# 1. Verify index.html in S3
aws s3 ls s3://your-bucket-name/

# 2. Set error document to index.html
# S3 > bucket > Properties > Static website hosting
# Error document: index.html

# 3. Rebuild with correct homepage
# client/package.json: "homepage": "http://s3-url"
npm run build
aws s3 sync ./client/build s3://your-bucket-name --delete
```

---

## 5. Cost/Billing Issues

### Problem: Charges appearing (not free tier)

**Cause:** Over free tier limits

**Solution:**
```
Go to Billing Dashboard and check:
1. EC2 hours used (should be <750/month)
2. RDS hours used (should be <750/month)
3. S3 storage (should be <5GB)
4. Data transfer (should be <1GB outbound)

If over:
- Reduce instances
- Delete unnecessary services
- Stop running instances when not needed
```

### Problem: Can't see what's costing money

**Solution:**
```
1. AWS Console > Billing > Bills
2. Click current month
3. Expand services used
4. See itemized charges
5. Set alerts: Billing > Budgets > Create budget
```

---

## 6. Performance Issues

### Problem: Slow response times

**Cause:** Could be several things

**Solution:**
```bash
# 1. Check EC2 resource usage
top
df -h
free -h

# 2. Check database performance
# From RDS Console: Look at CPU, connections
# If high, query optimization needed

# 3. Check backend logs for slow queries
pm2 logs mediflow-backend | grep slow

# 4. If needed, upgrade instance
# EC2 > Instances > Stop > Change instance type
# Select t3.small (paid but more powerful)
```

### Problem: High database connections

**Cause:** Connection pool exhausted

**Solution:**
```bash
# In server/db.ts, check connection pool size
// Reduce number of connections:
export const pool = new Pool({
  max: 10, // Reduce this
  min: 2,
  idle_in_transaction_session_timeout: 30000,
});

// Restart backend
pm2 restart mediflow-backend
```

---

## 7. Deployment Issues

### Problem: "git clone" says permission denied

**Cause:** SSH key for GitHub not configured

**Solution:**
```bash
# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub:
# 1. Go to GitHub > Settings > SSH keys
# 2. Click "New SSH key"
# 3. Add public key contents

# Then clone
git clone git@github.com:username/repo.git
```

### Problem: "npm install" hangs or times out

**Cause:** Slow internet or packages

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try with different registry
npm install --registry https://registry.npmmirror.com

# Or just wait (sometimes npm is slow)
```

### Problem: Build fails with memory error

**Cause:** Not enough RAM for build

**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=512 npm run build

# Or simplify build
# Remove unused dependencies
# Don't build unnecessary things
```

---

## 8. Security Issues

### Problem: "Unauthorized" errors in logs

**Cause:** Session or authentication failed

**Solution:**
```bash
# Check SESSION_SECRET in .env
echo $SESSION_SECRET

# Should be set and not empty
# If empty, set it:
SESSION_SECRET=$(openssl rand -base64 32)
echo "SESSION_SECRET=$SESSION_SECRET" >> .env

# Restart
pm2 restart mediflow-backend
```

### Problem: Database password visible in logs

**Cause:** Debug logging

**Solution:**
```bash
# Never log sensitive data
# Check code - remove console.log of DATABASE_URL
# Instead use: console.log("Database connected")

# Review code for secrets exposure
grep -r "password\|secret" server/ --exclude-dir=node_modules
```

---

## 9. Mobile App Issues

### Problem: APK won't install

**Cause:** Unknown sources not enabled or incompatible

**Solution:**
1. Phone Settings > Security
2. Enable "Unknown Sources" or "Install from unknown sources"
3. Try installing again
4. If still fails, check Android version requirement

### Problem: App connects to localhost instead of server

**Cause:** API URL hardcoded to localhost

**Solution:**
```typescript
// In mobile app services
const API_URL = 'http://YOUR_EC2_IP:5000'

// Not:
const API_URL = 'http://localhost:5000'

// Rebuild APK with correct URL
```

---

## 10. When Nothing Works

### Nuclear Option (Start Fresh)

```bash
# 1. Stop everything
pm2 stop all
pm2 delete all

# 2. Check disk space
df -h

# 3. Clear temp files
rm -rf ~/.npm
rm -rf node_modules
npm cache clean --force

# 4. Reinstall everything
npm install
npm run build

# 5. Start again
pm2 start "npm start" --name "mediflow-backend"

# 6. Check status
pm2 status
pm2 logs
```

### Last Resort - Rebuild Instance

```
1. Create new EC2 instance
2. Follow deployment guide again
3. Delete old instance
4. Redeploy frontend
5. Update URL endpoints
```

---

## 📞 Getting Help

### AWS Support Options

1. **AWS Forum:** https://forums.aws.amazon.com
2. **AWS Support Center:** https://console.aws.amazon.com/support
3. **AWS Documentation:** https://docs.aws.amazon.com
4. **Stack Overflow:** Tag with [amazon-aws] [ec2] [rds]

### Community Help

1. **Server Fault:** https://serverfault.com (server issues)
2. **Stack Overflow:** https://stackoverflow.com (general code)
3. **Reddit:** r/aws, r/webdev
4. **GitHub Issues:** Your project issues page

---

## 📋 Useful Commands

```bash
# Backend health check
curl http://YOUR_EC2_IP:5000/health

# Database connection test
psql -h endpoint -U admin -d mediflow -c "SELECT NOW();"

# Check running processes
pm2 status
pm2 list

# View system resources
top
htop # if installed

# Check ports
lsof -i -P -n

# Disk usage
du -sh *
df -h

# Network
netstat -an
ss -an
```

---

**Still stuck? Describe the exact error message and check AWS documentation first!** 🔍
