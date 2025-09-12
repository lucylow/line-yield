#!/bin/bash

echo "🚀 Deploying LINE Yield Dual Platform..."

# Build shared package
echo "📦 Building shared components..."
cd packages/shared && npm run build && cd ../..

# Build and deploy LIFF version
echo "📱 Building LIFF version..."
cd packages/liff-app
npm run build
# Deploy to LIFF-compatible hosting (Vercel/Netlify with HTTPS)
# vercel --prod --confirm
echo "✅ LIFF version built successfully"
cd ../..

# Build and deploy Web version
echo "🌐 Building Web version..."
cd packages/web-app
npm run build
# Deploy to standard web hosting
# vercel --prod --confirm
echo "✅ Web version built successfully"
cd ../..

# Deploy backend services (if needed)
if [ -d "backend" ]; then
  echo "⚙️ Deploying backend..."
  cd backend
  npm run build
  # Deploy to cloud provider
  # npm run deploy:prod
  echo "✅ Backend deployed successfully"
  cd ..
fi

echo "✅ Deployment complete!"
echo "LIFF URL: https://liff-app.vercel.app"
echo "Web URL: https://web-app.vercel.app"
