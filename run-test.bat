@echo off
echo ========================================
echo AI Market Questions Test
echo ========================================
echo.
echo Step 1: Starting server...
echo.
start "Server" cmd /k "node index.js"
echo Waiting 10 seconds for server to start...
timeout /t 10 /nobreak
echo.
echo Step 2: Running tests...
echo.
node test-ai-market-questions.js
echo.
echo ========================================
echo Tests complete!
echo ========================================
pause
