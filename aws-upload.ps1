# AWS EC2 Upload Script for MediFlow
# This script uploads your project files to EC2 instance

Write-Host "🚀 MediFlow AWS EC2 File Upload Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get EC2 details
$keyPath = Read-Host "Enter path to your mediflow-key.pem file"
$ec2IP = Read-Host "Enter your EC2 Public IP address (e.g., 54.123.45.67)"
$ec2User = "ubuntu"

# Verify key file exists
if (-not (Test-Path $keyPath)) {
    Write-Host "❌ Key file not found: $keyPath" -ForegroundColor Red
    exit
}

# Fix key permissions (Windows)
Write-Host "🔐 Fixing key file permissions..." -ForegroundColor Yellow
icacls $keyPath /inheritance:r
icacls $keyPath /grant:r "$($env:USERNAME):(F)"

Write-Host "✅ Permissions fixed" -ForegroundColor Green
Write-Host ""

# Test connection
Write-Host "🧪 Testing SSH connection..." -ForegroundColor Yellow
ssh -i $keyPath -o ConnectTimeout=5 $ec2User@$ec2IP "echo 'Connection successful'" 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to EC2 instance" -ForegroundColor Red
    Write-Host "Please check:"
    Write-Host "  - EC2 instance is running"
    Write-Host "  - Public IP is correct"
    Write-Host "  - Security group allows SSH (port 22)"
    Write-Host "  - Key file is correct"
    exit
}

Write-Host "✅ Connection successful" -ForegroundColor Green
Write-Host ""

# Upload project files
Write-Host "📤 Uploading project files to EC2..." -ForegroundColor Yellow

$folders = @("client", "server", "shared")

foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "  📁 Uploading $folder..." -ForegroundColor Cyan
        scp -i $keyPath -r $folder $ec2User@$ec2IP`:~/apps/
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ $folder uploaded" -ForegroundColor Green
        } else {
            Write-Host "    ❌ Failed to upload $folder" -ForegroundColor Red
        }
    }
}

# Upload configuration files
Write-Host ""
Write-Host "📤 Uploading configuration files..." -ForegroundColor Yellow

$configFiles = @("package.json", "tsconfig.json", "vite.config.ts")

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "  📄 Uploading $file..." -ForegroundColor Cyan
        scp -i $keyPath $file $ec2User@$ec2IP`:~/apps/
    }
}

Write-Host ""
Write-Host "✅ All files uploaded!" -ForegroundColor Green
Write-Host ""

# Run setup script
$runSetup = Read-Host "Run setup script on EC2? (y/n)"

if ($runSetup -eq "y" -or $runSetup -eq "Y") {
    Write-Host "🚀 Running setup script..." -ForegroundColor Yellow
    
    scp -i $keyPath aws-setup.sh $ec2User@$ec2IP`:~/
    ssh -i $keyPath $ec2User@$ec2IP "chmod +x ~/aws-setup.sh && ~/aws-setup.sh"
    
    Write-Host "✅ Setup complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH into your instance:"
Write-Host "   ssh -i $keyPath $ec2User@$ec2IP"
Write-Host ""
Write-Host "2. Create .env file with your database credentials:"
Write-Host "   nano ~/apps/.env"
Write-Host ""
Write-Host "3. Install dependencies and start:"
Write-Host "   cd ~/apps"
Write-Host "   npm install"
Write-Host "   npm run build"
Write-Host "   pm2 start 'npm start' --name 'mediflow-backend'"
Write-Host ""
Write-Host "4. Check your backend is running:"
Write-Host "   curl http://$ec2IP`:5000"
Write-Host ""
Write-Host "🎉 Done! Your backend will be live on http://$ec2IP`:5000" -ForegroundColor Green
