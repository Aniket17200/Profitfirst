# PowerShell script to add required IAM permissions for Terraform deployment
# Run this with admin AWS credentials

$UserName = "Aniket17"
$AccountId = "078109852021"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Adding IAM Permissions for Terraform" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "User: $UserName" -ForegroundColor Yellow
Write-Host "Account: $AccountId" -ForegroundColor Yellow
Write-Host ""

# Check if AWS CLI is available
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✓ AWS credentials verified" -ForegroundColor Green
    Write-Host "  Current user: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host "✗ AWS credentials not configured or invalid" -ForegroundColor Red
    Write-Host "  Run: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Adding EC2 Full Access policy..." -ForegroundColor Yellow

try {
    aws iam attach-user-policy `
        --user-name $UserName `
        --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ EC2 Full Access added" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add EC2 Full Access" -ForegroundColor Red
        Write-Host "  You may not have admin permissions" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error adding EC2 Full Access" -ForegroundColor Red
}

Write-Host ""
Write-Host "Adding VPC Full Access policy..." -ForegroundColor Yellow

try {
    aws iam attach-user-policy `
        --user-name $UserName `
        --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ VPC Full Access added" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add VPC Full Access" -ForegroundColor Red
        Write-Host "  You may not have admin permissions" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error adding VPC Full Access" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verifying permissions..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $policies = aws iam list-attached-user-policies --user-name $UserName | ConvertFrom-Json
    
    Write-Host "Attached policies:" -ForegroundColor Yellow
    foreach ($policy in $policies.AttachedPolicies) {
        Write-Host "  • $($policy.PolicyName)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Could not list policies" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "User $UserName should now have the required permissions." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test permissions: aws ec2 describe-images --region ap-south-1" -ForegroundColor Gray
Write-Host "2. Run Terraform: terraform apply" -ForegroundColor Gray
Write-Host ""
