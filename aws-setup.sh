#!/bin/bash

# AWS EC2 Setup Script for MediFlow Backend
# This script automates EC2 instance setup

echo "🚀 MediFlow AWS EC2 Setup Script"
echo "================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install Node.js
echo "📥 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "🔄 Installing PM2 process manager..."
sudo npm install -g pm2

# Install Git
echo "📂 Installing Git..."
sudo apt install -y git

# Install PostgreSQL client
echo "🗄️  Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# Install Nginx (optional, for reverse proxy)
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Create app directory
echo "📁 Creating app directory..."
mkdir -p ~/apps
cd ~/apps

# Clone repository
echo "📥 Enter your GitHub repository URL (or press Enter to skip):"
read REPO_URL

if [ ! -z "$REPO_URL" ]; then
  echo "📥 Cloning repository..."
  git clone $REPO_URL
else
  echo "⏭️  Skipping git clone (you can upload files manually using SCP)"
fi

# Setup environment file template
echo "⚙️  Creating .env template..."
cat > ~/apps/.env.template << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://admin:PASSWORD@RDS_ENDPOINT:5432/mediflow
SESSION_SECRET=generate-random-secret-key-here
PORT=5000
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your database credentials:"
echo "   nano ~/apps/.env"
echo ""
echo "2. Install dependencies:"
echo "   cd ~/apps/SmartMedicationTracker/'smt updation'"
echo "   npm install"
echo ""
echo "3. Start backend with PM2:"
echo "   npm run build"
echo "   pm2 start 'npm start' --name 'mediflow-backend'"
echo ""
echo "4. Enable PM2 on restart:"
echo "   sudo pm2 startup"
echo "   pm2 save"
echo ""
echo "5. Check status:"
echo "   pm2 status"
echo "   pm2 logs mediflow-backend"
echo ""
echo "🎉 Your backend will be running on port 5000!"
