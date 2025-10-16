# Simple Deployment Script - Upload and Deploy Everything
# Run this from your project root directory

$ServerIP = "3.108.210.145"
$KeyFile = "terraform\profit-first-key.pem"
$LocalPath = "."
$RemotePath = "/home/ubuntu/app"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Profit First - Complete Deployment Script                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server IP: $ServerIP" -ForegroundColor Yellow
Write-Host "Deploying from: $LocalPath" -ForegroundColor Yellow
Write-Host ""

# Check if key file exists
if (-not (Test-Path $KeyFile)) {
    Write-Host "✗ SSH key not found: $KeyFile" -ForegroundColor Red
    Write-Host "  Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ SSH key found" -ForegroundColor Green
Write-Host ""

# Step 1: Upload files
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 1: Uploading files to server..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 5-10 minutes depending on your internet speed..." -ForegroundColor Gray
Write-Host ""

# Create exclude list
$excludeItems = @(
    "node_modules",
    ".git",
    "terraform",
    ".terraform",
    "*.log",
    ".env.local",
    "dist",
    "build"
)

Write-Host "Uploading files (excluding node_modules, .git, etc.)..." -ForegroundColor Yellow
Write-Host ""

# Use SCP to upload files
# Note: This requires Git Bash or WSL. If using PowerShell, install OpenSSH
try {
    # Upload all files except excluded ones
    scp -i $KeyFile -r `
        --exclude=node_modules `
        --exclude=.git `
        --exclude=terraform `
        --exclude=.terraform `
        --exclude=*.log `
        --exclude=dist `
        --exclude=build `
        * ubuntu@${ServerIP}:${RemotePath}/
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Files uploaded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Upload completed with warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Upload failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Try using Git Bash or WSL instead of PowerShell" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Configure environment
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 2: Configuring environment..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠ IMPORTANT: You need to configure .env file!" -ForegroundColor Yellow
Write-Host ""
Write-Host "After this script completes, run:" -ForegroundColor White
Write-Host "  ssh -i $KeyFile ubuntu@$ServerIP" -ForegroundColor Gray
Write-Host "  cd /home/ubuntu/app" -ForegroundColor Gray
Write-Host "  nano .env" -ForegroundColor Gray
Write-Host ""
Write-Host "Update these variables:" -ForegroundColor White
Write-Host "  • MONGODB_URI" -ForegroundColor Gray
Write-Host "  • OPENAI_API_KEY" -ForegroundColor Gray
Write-Host "  • PINECONE_API_KEY" -ForegroundColor Gray
Write-Host "  • JWT_SECRET" -ForegroundColor Gray
Write-Host "  • All Shopify, Meta, Shiprocket credentials" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "Have you already configured .env on the server? (yes/no)"

if ($response -ne "yes") {
    Write-Host ""
    Write-Host "Please configure .env first, then run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or continue and configure it manually after deployment" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Continue anyway? (yes/no)"
    if ($continue -ne "yes") {
        Write-Host "Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""

# Step 3: Deploy application
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 3: Deploying application..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will take 5-10 minutes..." -ForegroundColor Gray
Write-Host ""

# SSH and run deployment
$deployCommands = @"
cd /home/ubuntu/app && \
if [ ! -f .env ]; then cp .env.example .env; fi && \
chmod +x deploy.sh && \
./deploy.sh
"@

Write-Host "Running deployment on server..." -ForegroundColor Yellow
ssh -i $KeyFile ubuntu@$ServerIP $deployCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Deployment completed successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠ Deployment completed with warnings" -ForegroundColor Yellow
    Write-Host "Check logs on server for details" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Check status
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 4: Checking application status..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

ssh -i $KeyFile ubuntu@$ServerIP "cd /home/ubuntu/app && ./status.sh"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your application is available at:" -ForegroundColor White
Write-Host "   http://$ServerIP" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 To check status:" -ForegroundColor White
Write-Host "   ssh -i $KeyFile ubuntu@$ServerIP" -ForegroundColor Gray
Write-Host "   ./status.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor White
Write-Host "   ssh -i $KeyFile ubuntu@$ServerIP" -ForegroundColor Gray
Write-Host "   pm2 logs profit-first" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 To update code:" -ForegroundColor White
Write-Host "   Run this script again: .\deploy-to-server.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy Deploying! 🚀" -ForegroundColor Green
Write-Host ""
