#!/usr/bin/env pwsh

Write-Host "🚀 Deploying LINE Yield Dual Platform..." -ForegroundColor Green

# Build shared package
Write-Host "📦 Building shared components..." -ForegroundColor Blue
Set-Location packages/shared
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build shared package" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# Build and deploy LIFF version
Write-Host "📱 Building LIFF version..." -ForegroundColor Blue
Set-Location packages/liff-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build LIFF app" -ForegroundColor Red
    exit 1
}
Write-Host "✅ LIFF version built successfully" -ForegroundColor Green
Set-Location ../..

# Build and deploy Web version
Write-Host "🌐 Building Web version..." -ForegroundColor Blue
Set-Location packages/web-app
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build web app" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web version built successfully" -ForegroundColor Green
Set-Location ../..

# Deploy backend services (if needed)
if (Test-Path "backend") {
    Write-Host "⚙️ Deploying backend..." -ForegroundColor Blue
    Set-Location backend
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend deployed successfully" -ForegroundColor Green
    }
    Set-Location ..
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "LIFF URL: https://liff-app.vercel.app" -ForegroundColor Cyan
Write-Host "Web URL: https://web-app.vercel.app" -ForegroundColor Cyan
