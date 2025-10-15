@echo off
echo ========================================
echo Starting ProfitFirst Application
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
cd client
call npm install
cd ..

echo.
echo [2/3] Starting Backend Server...
start cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo [3/3] Starting Frontend...
cd client
start cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo ✓ Backend running on http://localhost:3000
echo ✓ Frontend running on http://localhost:5173
echo ✓ Auto-sync enabled (every 30 minutes)
echo ========================================
echo.
pause
