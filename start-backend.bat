@echo off
echo Starting Oil Tank Management Backend...
echo.
echo Make sure you have:
echo 1. Node.js installed
echo 2. PostgreSQL database running
echo 3. Database credentials configured
echo.
cd backend
echo Installing dependencies...
npm install
echo.
echo Starting server...
npm run dev
