#!/bin/bash
set -e

# Update system
echo "========================================="
echo "Updating system packages..."
echo "========================================="
apt-get update
apt-get upgrade -y

# Install Node.js 20.x
echo "========================================="
echo "Installing Node.js 20.x..."
echo "========================================="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "========================================="
echo "Installing PM2..."
echo "========================================="
npm install -g pm2

# Install Nginx
echo "========================================="
echo "Installing Nginx..."
echo "========================================="
apt-get install -y nginx

# Install Git
echo "========================================="
echo "Installing Git..."
echo "========================================="
apt-get install -y git

# Create application directory
echo "========================================="
echo "Setting up application directory..."
echo "========================================="
mkdir -p /home/ubuntu/app
chown -R ubuntu:ubuntu /home/ubuntu/app

# Configure Nginx
echo "========================================="
echo "Configuring Nginx..."
echo "========================================="
cat > /etc/nginx/sites-available/default <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Increase timeouts for slow API calls
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Increase buffer sizes
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Configure PM2 startup
echo "========================================="
echo "Configuring PM2 startup..."
echo "========================================="
su - ubuntu -c "pm2 startup systemd -u ubuntu --hp /home/ubuntu"
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Create deployment script
cat > /home/ubuntu/deploy.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "========================================="
echo "Starting deployment..."
echo "========================================="

cd /home/ubuntu/app

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo "Pulling latest code..."
    git pull
fi

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --production

# Build frontend
echo "Building frontend..."
cd client
npm install
npm run build
cd ..

# Copy environment file if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your credentials!"
fi

# Restart application with PM2
echo "Restarting application..."
pm2 delete profit-first 2>/dev/null || true
pm2 start index.js --name profit-first --time
pm2 save

echo "========================================="
echo "Deployment complete!"
echo "========================================="
DEPLOY_SCRIPT

chmod +x /home/ubuntu/deploy.sh
chown ubuntu:ubuntu /home/ubuntu/deploy.sh

# Create status check script
cat > /home/ubuntu/status.sh <<'STATUS_SCRIPT'
#!/bin/bash
echo "========================================="
echo "Application Status"
echo "========================================="
pm2 status
echo ""
echo "========================================="
echo "Application Logs (last 20 lines)"
echo "========================================="
pm2 logs profit-first --lines 20 --nostream
STATUS_SCRIPT

chmod +x /home/ubuntu/status.sh
chown ubuntu:ubuntu /home/ubuntu/status.sh

# Create helpful README
cat > /home/ubuntu/README.txt <<'README'
========================================
PROFIT FIRST APPLICATION - SERVER SETUP
========================================

IMPORTANT: Complete these steps after connecting via SSH

1. UPLOAD YOUR CODE
   - Option A: Clone from Git
     cd /home/ubuntu/app
     git clone YOUR_REPO_URL .
   
   - Option B: Upload via SCP
     scp -r -i your-key.pem ./your-app/* ubuntu@YOUR_IP:/home/ubuntu/app/

2. CONFIGURE ENVIRONMENT
   cd /home/ubuntu/app
   cp .env.example .env
   nano .env
   
   Update these variables:
   - MONGODB_URI
   - OPENAI_API_KEY
   - PINECONE_API_KEY
   - All Shopify, Meta, Shiprocket credentials

3. DEPLOY APPLICATION
   ./deploy.sh

4. CHECK STATUS
   ./status.sh

5. VIEW LOGS
   pm2 logs profit-first

6. RESTART APPLICATION
   pm2 restart profit-first

========================================
USEFUL COMMANDS
========================================

Check Nginx status:
  sudo systemctl status nginx

Restart Nginx:
  sudo systemctl restart nginx

Check application logs:
  pm2 logs profit-first

Monitor application:
  pm2 monit

Save PM2 configuration:
  pm2 save

========================================
TROUBLESHOOTING
========================================

If application won't start:
1. Check logs: pm2 logs profit-first
2. Check .env file exists and has correct values
3. Check MongoDB connection
4. Check all API keys are valid

If Nginx shows error:
1. Check Nginx logs: sudo tail -f /var/log/nginx/error.log
2. Test config: sudo nginx -t
3. Restart: sudo systemctl restart nginx

========================================
README

chown ubuntu:ubuntu /home/ubuntu/README.txt

echo "========================================="
echo "Server setup complete!"
echo "========================================="
echo "Next steps:"
echo "1. SSH into the server"
echo "2. Upload your application code"
echo "3. Configure .env file"
echo "4. Run ./deploy.sh"
echo "========================================="
