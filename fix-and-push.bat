@echo off
echo ========================================
echo Fix Git and Push to GitHub
echo ========================================
echo.

echo Step 1: Removing client/.git folder...
if exist "client\.git" (
    rmdir /s /q "client\.git"
    echo Client .git folder removed!
) else (
    echo No client .git folder found.
)

echo.
echo Step 2: Removing client/.gitignore if exists...
if exist "client\.gitignore" (
    del "client\.gitignore"
    echo Client .gitignore removed!
)

echo.
echo Step 3: Adding all files...
git add .

echo.
echo Step 4: Committing changes...
git commit -m "Initial commit: Complete Profit First application with AI features"

echo.
echo Step 5: Adding remote repository...
git remote add origin https://github.com/Aniket17200/Profitfirst.git 2>nul
if errorlevel 1 (
    echo Remote already exists, updating...
    git remote set-url origin https://github.com/Aniket17200/Profitfirst.git
)

echo.
echo Step 6: Renaming branch to main...
git branch -M main

echo.
echo Step 7: Pushing to GitHub...
git push -u origin main --force

echo.
echo ========================================
echo Done! Check https://github.com/Aniket17200/Profitfirst
echo ========================================
pause
