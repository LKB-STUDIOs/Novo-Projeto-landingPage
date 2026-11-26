@echo off
rem Inicia o MyLogical App (evita o bloqueio de scripts do PowerShell)
cd /d "%~dp0"
if not exist .env (
  copy .env.example .env >nul
  echo.
  echo  Criei o arquivo .env. Abra ele no Bloco de Notas, preencha FB_PASSWORD e APP_PIN,
  echo  salve e rode este arquivo de novo.
  echo.
  notepad .env
  pause
  exit /b
)
if not exist node_modules call npm.cmd install --omit=dev
node server\index.js
pause
