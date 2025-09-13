@echo off
echo 🚀 Setting up LINE Yield Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please update .env file with your Reown Project ID
    echo    Get your Project ID from: https://dashboard.reown.com
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your Reown Project ID
echo 2. Run 'npm run dev' to start the development server
echo 3. Open http://localhost:5173 in your browser
echo.
echo For more information, see README.md
pause
