# ========================================================
#   SYNOVA AI Insurance Platform - Core Startup Script
#   Frontend + Backend + Mock Insurers A, B, C
# ========================================================

Write-Host "🚀 Launching SYNOVA Core Services..." -ForegroundColor Cyan

# 1. Main Backend API (Port 8000)
Write-Host "Starting Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\backend'; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Insurer A: ICICI Lombard (Port 9001)
Write-Host "Starting Mock Insurer A..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-a'; uvicorn app.main:app --host 127.0.0.1 --port 9001 --reload"

# 3. Insurer B: ACKO Drive (Port 9002)
Write-Host "Starting Mock Insurer B..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-b'; uvicorn app.main:app --host 127.0.0.1 --port 9002 --reload"

# 4. Insurer C: TATA AIG (Port 9003)
Write-Host "Starting Mock Insurer C..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-c'; uvicorn app.main:app --host 127.0.0.1 --port 9003 --reload"

# 5. Frontend Vite Server (Port 5173)
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\frontend'; npm run dev"

Write-Host "✅ All 5 services launched successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend Web App:       http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API Docs:       http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Insurer A (ICICI):      http://localhost:9001" -ForegroundColor White
Write-Host "   Insurer B (ACKO):       http://localhost:9002" -ForegroundColor White
Write-Host "   Insurer C (TATA AIG):   http://localhost:9003" -ForegroundColor White
