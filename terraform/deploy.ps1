# Terraform Deployment Script for Windows

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Profit First - AWS Deployment Script                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Terraform
$terraformInstalled = $false
try {
    $null = terraform version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Terraform installed" -ForegroundColor Green
        $terraformInstalled = $true
    }
} catch {
    Write-Host "✗ Terraform not found" -ForegroundColor Red
    Write-Host "  Install from: https://www.terraform.io/downloads" -ForegroundColor Yellow
}

# Check AWS CLI
$awsInstalled = $false
try {
    $null = aws --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ AWS CLI installed" -ForegroundColor Green
        $awsInstalled = $true
    }
} catch {
    Write-Host "✗ AWS CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
}

Write-Host ""

if (-not $terraformInstalled) {
    Write-Host "Please install Terraform first!" -ForegroundColor Red
    exit 1
}

# Check AWS credentials
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
try {
    $awsIdentity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ AWS credentials configured" -ForegroundColor Green
    } else {
        Write-Host "✗ AWS credentials not configured" -ForegroundColor Red
        Write-Host "  Run: aws configure" -ForegroundColor Yellow
        Write-Host "  Region: ap-south-1" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "⚠ Could not verify AWS credentials" -ForegroundColor Yellow
    Write-Host "  Make sure to run: aws configure" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Initialize Terraform
if (-not (Test-Path ".terraform")) {
    Write-Host "Initializing Terraform..." -ForegroundColor Yellow
    terraform init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Terraform initialization failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Terraform initialized" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✓ Terraform already initialized" -ForegroundColor Green
    Write-Host ""
}

# Format files
Write-Host "Formatting Terraform files..." -ForegroundColor Yellow
terraform fmt
Write-Host ""

# Validate configuration
Write-Host "Validating configuration..." -ForegroundColor Yellow
terraform validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Configuration validation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Configuration is valid" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Show plan
Write-Host "Generating deployment plan..." -ForegroundColor Yellow
Write-Host ""
terraform plan
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Confirm deployment
Write-Host "Ready to deploy infrastructure to AWS Mumbai region" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will create:" -ForegroundColor Cyan
Write-Host "  • VPC and networking" -ForegroundColor Gray
Write-Host "  • EC2 instance (t3.micro)" -ForegroundColor Gray
Write-Host "  • Elastic IP" -ForegroundColor Gray
Write-Host "  • Security groups" -ForegroundColor Gray
Write-Host ""
Write-Host "Estimated cost: ~`$9-10/month" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host ""
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Deploy
Write-Host "Deploying infrastructure..." -ForegroundColor Yellow
Write-Host "This will take 3-5 minutes..." -ForegroundColor Gray
Write-Host ""

terraform apply -auto-approve

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Deployment successful!" -ForegroundColor Green
Write-Host ""

# Show outputs
Write-Host "Getting deployment information..." -ForegroundColor Yellow
Write-Host ""

$publicIp = terraform output -raw public_ip 2>$null
$sshCommand = terraform output -raw ssh_command 2>$null

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    DEPLOYMENT COMPLETE!                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Public IP Address: $publicIp" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 SSH Command:" -ForegroundColor Cyan
Write-Host "   $sshCommand" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Application URL:" -ForegroundColor Cyan
Write-Host "   http://$publicIp" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connect to server:" -ForegroundColor White
Write-Host "   $sshCommand" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Upload your code:" -ForegroundColor White
Write-Host "   cd /home/ubuntu/app" -ForegroundColor Gray
Write-Host "   git clone YOUR_REPO_URL ." -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configure environment:" -ForegroundColor White
Write-Host "   cp .env.example .env" -ForegroundColor Gray
Write-Host "   nano .env" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy application:" -ForegroundColor White
Write-Host "   ./deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Configure DNS (point your domain to):" -ForegroundColor White
Write-Host "   $publicIp" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see:" -ForegroundColor Yellow
Write-Host "  • DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "  • QUICK_START.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy Deploying! 🚀" -ForegroundColor Green
Write-Host ""
