Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Neev — Your Financial Second Opinion..." -ForegroundColor Cyan
Write-Host '"Before you commit, understand."' -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "Launching FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --reload --port 8000"

Write-Host "Launching React/Vite Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "Servers started successfully:" -ForegroundColor Green
Write-Host "  Frontend URL:     http://localhost:5173" -ForegroundColor Yellow
Write-Host "  Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
