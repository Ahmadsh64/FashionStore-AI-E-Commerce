# ============================================================
# FashionStore - Automatic installer for Windows PowerShell
# ============================================================
# Usage:
#   .\install.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  FashionStore - Installer" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "    Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "    ERROR: Node.js is not installed. Download from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "    npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "    ERROR: npm not found" -ForegroundColor Red
    exit 1
}

Write-Host "[3/4] Installing dependencies (may take a few minutes)..." -ForegroundColor Yellow
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
    Write-Host "    ERROR: Installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "    All dependencies installed" -ForegroundColor Green

Write-Host "[4/4] Checking .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "    .env.local already exists - skipping" -ForegroundColor Green
} elseif (Test-Path ".env.local.example") {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "    Created .env.local from template" -ForegroundColor Green
    Write-Host "    WARNING: Edit it and add your Supabase keys!" -ForegroundColor Yellow
} else {
    Write-Host "    .env.local.example not found - skipping" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Installation completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit .env.local and add your Supabase keys"
Write-Host "  2. Run supabase/schema.sql in Supabase SQL Editor"
Write-Host "  3. Run: npm run dev"
Write-Host "  4. Open: http://localhost:3000"
Write-Host ""
