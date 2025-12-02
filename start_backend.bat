@echo off
echo ========================================
echo  Iniciando Backend - VERSAO CORRIGIDA
echo ========================================
echo.

echo Ativando ambiente virtual...
call backend\.venv\Scripts\activate.bat

echo.
echo Verificando dependencias criticas...
pip install typing_extensions --quiet

echo.
echo Iniciando servidor FastAPI em http://localhost:8000
echo.
echo Endpoints disponiveis:
echo - Health Check: http://localhost:8000/api/health
echo - Docs: http://localhost:8000/docs
echo - Docs alternativo: http://localhost:8000/redoc
echo.

cd backend
python -m uvicorn main:app --reload --port 8000
