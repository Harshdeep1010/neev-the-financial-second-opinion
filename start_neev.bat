@echo off
echo ========================================================
echo Starting Neev - Your Financial Second Opinion...
echo "Before you commit, understand."
echo ========================================================

echo Launching FastAPI Backend on port 8000...
start "Neev Backend (FastAPI)" cmd /k "python -m uvicorn backend.app.main:app --reload --port 8000"

echo Launching React/Vite Frontend on port 5173...
start "Neev Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Frontend will be accessible at: http://localhost:5173
echo Backend API Docs at:          http://127.0.0.1:8000/docs
echo ========================================================
