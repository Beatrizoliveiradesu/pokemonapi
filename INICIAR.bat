@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==============================================
echo   Pagina de consumo de APIs - iniciando...
echo ==============================================

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org
  echo e depois de dois cliques neste arquivo de novo.
  pause
  exit /b 1
)

if exist .env goto install
echo.
echo Chave da OMDb: gere em https://www.omdbapi.com/apikey.aspx e valide pelo e-mail.
set /p OMDB_KEY=Cole sua chave aqui e tecle Enter (ou so Enter para pular): 
if "%OMDB_KEY%"=="" goto install
>.env echo VITE_OMDB_API_KEY=%OMDB_KEY%

:install
if exist node_modules goto run
echo.
echo Instalando dependencias (so na primeira vez)...
call npm.cmd install
if errorlevel 1 (
  echo Falha no npm install.
  pause
  exit /b 1
)

:run
echo.
echo Abrindo o site no navegador. Para parar, feche esta janela.
call npm.cmd run dev -- --open
pause
