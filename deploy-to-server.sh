#!/bin/bash
# Simple Deployment Script - Upload and Deploy Everything

SERVER_IP="3.108.210.145"
KEY_FILE="terraform/profit-first-key.pem"
LOCAL_PATH="."
REMOTE_PATH="/home/ubuntu/app"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Profit First - Complete Deployment Script                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Server IP: $SERVER_IP"
echo "Deploying from: $LOCAL_PATH"
echo ""

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "✗ SSH key not found: $KEY_FILE"
    echo "  Make sure you're in the project root directory"
    exit 1
fi

echo "✓ SSH key found"
echo ""

# Set correct permissions
chmod 400 "$KEY_FILE"

# Step 1: Upload files
echo "════════════════════════════════════════════════════════════════"
echo "Step 1: Uploading files to server..."
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This may take 5-10 minutes depending on your internet speed..."
echo ""

# Upload files excluding node_modules, .git, etc.
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='terraform' \
    --exclude='.terraform' \
    --exclude='*.log' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.env.local' \
    -e "ssh -i $KEY_FILE" \
    ./ ubuntu@$SERVER_IP:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Files uploaded successfully"
else
    echo ""
    echo "✗ Upload failed"
    exit 1
fi

echo ""

# Step 2: Configure environment
echo "════════════════════════════════════════════════════════════════"
echo "Step 2: Configuring environment..."
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "⚠ IMPORTANT: You need to configure .env file!"
echo ""
echo "After this script completes, run:"
echo "  ssh -i $KEY_FILE ubuntu@$SERVER_IP"
echo "  cd /home/ubuntu/app"
echo "  nano .env"
echo ""
echo "Update these variables:"
echo "  • MONGODB_URI"
echo "  • OPENAI_API_KEY"
echo "  • PINECONE_API_KEY"
echo "  • JWT_SECRET"
echo "  • All Shopify, Meta, Shiprocket credentials"
echo ""

read -p "Have you already configured .env on the server? (yes/no): " response

if [ "$response" != "yes" ]; then
    echo ""
    echo "Please configure .env first, then run this script again"
    echo ""
    echo "Or continue and configure it manually after deployment"
    echo ""
    read -p "Continue anyway? (yes/no): " continue_response
    if [ "$continue_response" != "yes" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi

echo ""

# Step 3: Deploy application
echo "════════════════════════════════════════════════════════════════"
echo "Step 3: Deploying application..."
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This will take 5-10 minutes..."
echo ""

# SSH and run deployment
ssh -i "$KEY_FILE" ubuntu@$SERVER_IP << 'ENDSSH'
cd /home/ubuntu/app
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠ Created .env from .env.example - Please update it!"
fi
chmod +x deploy.sh
chmod +x status.sh
./deploy.sh
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Deployment completed successfully"
else
    echo ""
    echo "⚠ Deployment completed with warnings"
    echo "Check logs on server for details"
fi

echo ""

# Step 4: Check status
echo "════════════════════════════════════════════════════════════════"
echo "Step 4: Checking application status..."
echo "════════════════════════════════════════════════════════════════"
echo ""

ssh -i "$KEY_FILE" ubuntu@$SERVER_IP "cd /home/ubuntu/app && ./status.sh"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Deployment Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your application is available at:"
echo "   http://$SERVER_IP"
echo ""
echo "📊 To check status:"
echo "   ssh -i $KEY_FILE ubuntu@$SERVER_IP"
echo "   ./status.sh"
echo ""
echo "📝 To view logs:"
echo "   ssh -i $KEY_FILE ubuntu@$SERVER_IP"
echo "   pm2 logs profit-first"
echo ""
echo "🔄 To update code:"
echo "   Run this script again: ./deploy-to-server.sh"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Happy Deploying! 🚀"
echo ""
