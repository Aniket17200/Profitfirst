@echo off
echo ========================================
echo AI Market Question Testing Suite
echo ========================================
echo.
echo This will test the AI's ability to answer:
echo - Current data questions
echo - Past data questions  
echo - Future data predictions
echo - Mixed timeframe questions
echo.
echo Starting server...
start "Backend Server" cmd /k "node index.js"
echo Waiting for server to start...
timeout /t 5 /nobreak >nul
echo.
echo Running tests...
node test-ai-market-questions.js
echo.
echo Tests complete! Press any key to exit...
pause >nul
