# Terraform Validation Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Terraform Configuration Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Terraform is installed
Write-Host "Checking Terraform installation..." -ForegroundColor Yellow
$terraformVersion = terraform version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Terraform is installed" -ForegroundColor Green
    Write-Host $terraformVersion[0] -ForegroundColor Gray
} else {
    Write-Host "✗ Terraform is not installed" -ForegroundColor Red
    Write-Host "Install from: https://www.terraform.io/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Format Terraform files
Write-Host "Formatting Terraform files..." -ForegroundColor Yellow
terraform fmt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Files formatted successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Format failed" -ForegroundColor Red
}

Write-Host ""

# Check if initialized
if (Test-Path ".terraform") {
    Write-Host "✓ Terraform is initialized" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Validating configuration..." -ForegroundColor Yellow
    terraform validate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Configuration is valid" -ForegroundColor Green
    } else {
        Write-Host "✗ Validation failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠ Terraform not initialized yet" -ForegroundColor Yellow
    Write-Host "Run: terraform init" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Validation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. terraform init    (if not done)" -ForegroundColor Gray
Write-Host "2. terraform plan    (review changes)" -ForegroundColor Gray
Write-Host "3. terraform apply   (deploy)" -ForegroundColor Gray
Write-Host ""
