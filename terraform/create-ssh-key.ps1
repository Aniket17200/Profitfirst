# PowerShell script to create SSH key pair in AWS

$KeyName = "profit-first-key"
$Region = "ap-south-1"
$OutputFile = "profit-first-key.pem"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Creating SSH Key Pair in AWS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Key Name: $KeyName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Output File: $OutputFile" -ForegroundColor Yellow
Write-Host ""

# Check if AWS CLI is available
try {
    $null = aws --version 2>&1
    Write-Host "✓ AWS CLI found" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if key already exists
Write-Host "Checking if key already exists..." -ForegroundColor Yellow
$existingKey = aws ec2 describe-key-pairs --region $Region --key-names $KeyName 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "⚠ Key pair '$KeyName' already exists!" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to delete and recreate it? (yes/no)"
    
    if ($response -eq "yes") {
        Write-Host ""
        Write-Host "Deleting existing key pair..." -ForegroundColor Yellow
        aws ec2 delete-key-pair --region $Region --key-name $KeyName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Existing key deleted" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to delete key" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "Keeping existing key. Make sure you have the private key file!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "If you lost the private key file, you must:" -ForegroundColor Yellow
        Write-Host "1. Delete the key in AWS Console" -ForegroundColor Gray
        Write-Host "2. Run this script again" -ForegroundColor Gray
        Write-Host ""
        exit 0
    }
}

Write-Host ""
Write-Host "Creating new key pair..." -ForegroundColor Yellow

# Create key pair and save to file
try {
    $keyMaterial = aws ec2 create-key-pair `
        --region $Region `
        --key-name $KeyName `
        --query 'KeyMaterial' `
        --output text 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        # Save to file
        $keyMaterial | Out-File -FilePath $OutputFile -Encoding ASCII -NoNewline
        
        Write-Host "✓ Key pair created successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "Key Details" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Key Name: $KeyName" -ForegroundColor White
        Write-Host "Region: $Region" -ForegroundColor White
        Write-Host "Private Key File: $OutputFile" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠ IMPORTANT:" -ForegroundColor Yellow
        Write-Host "  • Save this file securely!" -ForegroundColor Gray
        Write-Host "  • You cannot download it again!" -ForegroundColor Gray
        Write-Host "  • Keep a backup in a safe location!" -ForegroundColor Gray
        Write-Host ""
        
        # Check file was created
        if (Test-Path $OutputFile) {
            $fileSize = (Get-Item $OutputFile).Length
            Write-Host "✓ Private key saved to: $OutputFile ($fileSize bytes)" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to save private key file" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host "Next Steps" -ForegroundColor Cyan
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Verify key exists:" -ForegroundColor White
        Write-Host "   aws ec2 describe-key-pairs --region $Region --key-names $KeyName" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Deploy infrastructure:" -ForegroundColor White
        Write-Host "   terraform apply" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. After deployment, connect to server:" -ForegroundColor White
        Write-Host "   ssh -i $OutputFile ubuntu@YOUR_IP" -ForegroundColor Gray
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✓ Ready to deploy!" -ForegroundColor Green
        Write-Host ""
        
    } else {
        Write-Host "✗ Failed to create key pair" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $keyMaterial -ForegroundColor Gray
        Write-Host ""
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  • Check AWS credentials: aws configure" -ForegroundColor Gray
        Write-Host "  • Verify region is correct: $Region" -ForegroundColor Gray
        Write-Host "  • Check IAM permissions for EC2" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host "✗ Error creating key pair" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Gray
    exit 1
}
