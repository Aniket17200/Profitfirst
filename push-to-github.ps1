# Push to GitHub Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Push Entire Folder to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove client/.git folder
Write-Host "Step 1: Removing client/.git folder..." -ForegroundColor Yellow
if (Test-Path "client/.git") {
    Remove-Item -Recurse -Force "client/.git"
    Write-Host "✓ Client .git folder removed!" -ForegroundColor Green
} else {
    Write-Host "✓ No client .git folder found." -ForegroundColor Green
}

# Step 2: Remove client/.gitignore if exists
Write-Host ""
Write-Host "Step 2: Removing client/.gitignore..." -ForegroundColor Yellow
if (Test-Path "client/.gitignore") {
    Remove-Item "client/.gitignore"
    Write-Host "✓ Client .gitignore removed!" -ForegroundColor Green
} else {
    Write-Host "✓ No client .gitignore found." -ForegroundColor Green
}

# Step 3: Add all files
Write-Host ""
Write-Host "Step 3: Adding all files..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files added!" -ForegroundColor Green

# Step 4: Commit
Write-Host ""
Write-Host "Step 4: Committing changes..." -ForegroundColor Yellow
git commit -m "Initial commit: Complete Profit First D2C Analytics Platform with AI features"
Write-Host "✓ Changes committed!" -ForegroundColor Green

# Step 5: Add remote
Write-Host ""
Write-Host "Step 5: Adding remote repository..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote already exists, updating..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/Aniket17200/Profitfirst.git
} else {
    git remote add origin https://github.com/Aniket17200/Profitfirst.git
}
Write-Host "✓ Remote configured!" -ForegroundColor Green

# Step 6: Rename branch to main
Write-Host ""
Write-Host "Step 6: Renaming branch to main..." -ForegroundColor Yellow
git branch -M main
Write-Host "✓ Branch renamed!" -ForegroundColor Green

# Step 7: Push to GitHub
Write-Host ""
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Push Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your repository is now at:" -ForegroundColor White
Write-Host "https://github.com/Aniket17200/Profitfirst" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
