@echo off
echo ========================================================
echo   Starting SYNOVA Autonomous AI Insurance Platform
echo ========================================================

REM 1. Main Backend API (Port 8000)
start "SYNOVA Backend (8000)" cmd /k "cd apps\backend && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM 2. Automation Service (Port 8001)
start "SYNOVA Automation Service (8001)" cmd /k "cd apps\automation-service && uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload"

REM 3. Insurer A: ICICI Lombard (Port 9001)
start "Insurer A - ICICI Lombard (9001)" cmd /k "cd apps\mock-insurers\insurer-a && uvicorn app.main:app --host 127.0.0.1 --port 9001 --reload"

REM 4. Insurer B: ACKO Drive (Port 9002)
start "Insurer B - ACKO (9002)" cmd /k "cd apps\mock-insurers\insurer-b && uvicorn app.main:app --host 127.0.0.1 --port 9002 --reload"

REM 5. Insurer C: TATA AIG (Port 9003)
start "Insurer C - TATA AIG (9003)" cmd /k "cd apps\mock-insurers\insurer-c && uvicorn app.main:app --host 127.0.0.1 --port 9003 --reload"

REM 6. Insurer D: HDFC ERGO (Port 9004)
start "Insurer D - HDFC ERGO (9004)" cmd /k "cd apps\mock-insurers\insurer-d && uvicorn app.main:app --host 127.0.0.1 --port 9004 --reload"

REM 7. Frontend Vite Dev Server (Port 5173)
start "SYNOVA Frontend (5173)" cmd /k "cd apps\frontend && npm run dev"

echo All services started in separate windows!
echo Frontend:           http://localhost:5173
echo Backend API:        http://localhost:8000/docs
echo Automation Service: http://localhost:8001/docs
