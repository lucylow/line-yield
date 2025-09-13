#!/bin/bash

# LINE Yield Frontend Setup Script
echo "🚀 Setting up LINE Yield Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your Reown Project ID"
    echo "   Get your Project ID from: https://dashboard.reown.com"
else
    echo "✅ .env file already exists"
fi

# Check if Reown Project ID is set
if grep -q "your_project_id_here" .env; then
    echo "⚠️  Please update VITE_REOWN_PROJECT_ID in .env file"
    echo "   Get your Project ID from: https://dashboard.reown.com"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Reown Project ID"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For more information, see README.md"
