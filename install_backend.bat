@echo off
echo ========================================
echo  Instalando Backend - Ebook Generator
echo ========================================
echo.

cd backend

echo [1/4] Criando ambiente virtual Python...
python -m venv .venv

echo.
echo [2/4] Ativando ambiente virtual...
call .venv\Scripts\activate

echo.
echo [3/4] Instalando dependências Python...
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [4/4] Instalando Playwright browsers...
playwright install chromium

echo.
echo ========================================
echo  Instalação concluída com sucesso!
echo ========================================
echo.
echo Próximos passos:
echo 1. Copiar .env.example para .env
echo 2. Adicionar chaves API no .env
echo 3. Executar: python -m uvicorn main:app --reload
echo.
pause
