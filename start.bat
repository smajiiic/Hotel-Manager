@echo off
title Hotel Manager Launcher
echo Starting Hotel Manager...
echo.

start "Hotel Manager - MongoDB" cmd /k "mongod"
timeout /t 4 /nobreak >nul

start "Hotel Manager - Backend" cmd /k "cd /d %~dp0backend && node app.js"
timeout /t 3 /nobreak >nul

start "Hotel Manager - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 3000"
timeout /t 6 /nobreak >nul

start "" "http://localhost:3000"

echo.
echo All three servers are starting in separate windows.
echo Browser will open to http://localhost:3000 shortly.
echo To stop everything, close each window or press Ctrl+C in each.
echo.
pause
