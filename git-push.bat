@echo off
echo ========================================
echo Git Push to GitHub
echo ========================================
echo.

echo Step 1: Adding all files...
git add .

echo.
echo Step 2: Committing changes...
set /p commit_message="Enter commit message: "
git commit -m "%commit_message%"

echo.
echo Step 3: Adding remote (if not exists)...
git remote add origin https://github.com/Aniket17200/Profitfirst.git 2>nul
if errorlevel 1 (
    echo Remote already exists, skipping...
) else (
    echo Remote added successfully!
)

echo.
echo Step 4: Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Push complete!
echo ========================================
pause
