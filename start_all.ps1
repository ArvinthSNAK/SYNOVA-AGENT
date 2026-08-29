# ========================================================
#   SYNOVA AI Insurance Platform - Startup Script (PowerShell)
# ========================================================

Write-Host "⚙️ Launching All SYNOVA Services..." -ForegroundColor Cyan

# 1. Main Backend API (Port 8000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\backend'; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 2. Automation Service (Port 8001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\automation-service'; uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

# 3. Insurer A: ICICI Lombard (Port 9001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-a'; uvicorn app.main:app --host 127.0.0.1 --port 9001 --reload"

# 4. Insurer B: ACKO Drive (Port 9002)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-b'; uvicorn app.main:app --host 127.0.0.1 --port 9002 --reload"

# 5. Insurer C: TATA AIG (Port 9003)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-c'; uvicorn app.main:app --host 127.0.0.1 --port 9003 --reload"

# 6. Insurer D: HDFC ERGO (Port 9004)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\mock-insurers\insurer-d'; uvicorn app.main:app --host 127.0.0.1 --port 9004 --reload"

# 7. Realtime Voice Agent / Advisor (Port 8011)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\synova-voice-agent'; uvicorn app.main:app --host 127.0.0.1 --port 8011 --reload"

# 8. Frontend Vite Server (Port 5173)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\apps\frontend'; npm run dev"

Write-Host "✓ All 8 services launched successfully!" -ForegroundColor Green
Write-Host "▪ Frontend Web App:        http://localhost:5173" -ForegroundColor Yellow
Write-Host "▪ Realtime Voice Agent:    http://localhost:8011" -ForegroundColor Yellow
Write-Host "▪ Backend API Docs:        http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "▪ Automation Service Docs: http://localhost:8001/docs" -ForegroundColor Yellow
