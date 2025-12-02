@echo off
setlocal enabledelayedexpansion

title Ebook Generator V2 Launcher

echo ===================================================
echo   INICIANDO EBOOK GENERATOR V2
echo ===================================================
echo.

:: 1. Iniciar Backend
echo [1/3] Iniciando Backend (FastAPI)...
echo    - Diretorio: backend
echo    - Porta: 8000
start "EbookGenerator Backend" /min cmd /k "cd backend && call .venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000"

:: 2. Aguardar inicialização
echo.
echo [2/3] Aguardando 8 segundos para inicializacao do Backend...
timeout /t 8 /nobreak >nul

:: 3. Iniciar Frontend
echo.
echo [3/3] Iniciando Frontend (React/Vite)...
echo    - Diretorio: frontend
echo    - URL: http://localhost:5173
cd frontend
start "EbookGenerator Frontend" /min cmd /k "npm run dev"

echo.
echo ===================================================
echo   SISTEMA INICIADO COM SUCESSO!
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000/docs
echo.
echo   Mantenha as janelas do CMD abertas.
echo ===================================================
echo.
pause
