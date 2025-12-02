@echo off
echo ========================================
echo  Corrigindo Instalacao Backend
echo ========================================
echo.

echo [1/5] Removendo ambiente virtual antigo...
if exist backend\.venv rmdir /s /q backend\.venv

echo.
echo [2/5] Criando novo ambiente virtual...
python -m venv backend\.venv

echo.
echo [3/5] Atualizando pip...
backend\.venv\Scripts\python.exe -m pip install --upgrade pip --quiet

echo.
echo [4/5] Instalando dependencias (isso pode demorar)...
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt

echo.
echo [5/5] Instalando Playwright browsers...
backend\.venv\Scripts\playwright.exe install chromium --with-deps

echo.
echo ========================================
echo  Instalacao concluida!
echo ========================================
echo.
echo Proximos passos:
echo 1. Copiar .env.example para .env:  copy .env.example .env
echo 2. Adicionar chaves API no .env
echo 3. Executar: .\start_backend.bat
echo.
pause
