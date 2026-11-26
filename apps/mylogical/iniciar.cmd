@echo off
setlocal
title MyLogical App
cd /d "%~dp0"

rem -- 1. Node.js -----------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  O Node.js nao esta instalado. Instalando agora...
  echo  Se o Windows pedir permissao, clique em Sim.
  echo.
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if errorlevel 1 (
    echo.
    echo  Nao consegui instalar sozinho. Baixe e instale o Node.js LTS em https://nodejs.org
    echo  e depois rode este arquivo de novo.
    start https://nodejs.org
    pause
    exit /b
  )
  echo.
  echo  Node.js instalado. Feche esta janela e de dois cliques em iniciar.cmd de novo.
  pause
  exit /b
)

rem -- 2. Configuracao (so na primeira vez) -----------------------
if not exist .env (
  echo.
  echo  ===== Configuracao do MyLogical App =====
  echo  Os dados estao na tela "Bancos de Dados" do MyLogical.
  echo.
  set "IP="
  set /p "IP=IP do servidor do banco - campo IP / Porta, ex.: 10.0.0.5: "
  set "SENHA="
  set /p "SENHA=Senha do Firebird [Enter = masterkey]: "
  set "PIN="
  set /p "PIN=Crie um PIN para entrar no app - minimo 4 caracteres: "
  call :gravar_env
  echo.
  echo  Configuracao salva no arquivo .env - fica so neste PC.
  echo.
)

rem -- 3. Dependencias e inicio ----------------------------------
if not exist node_modules (
  echo  Instalando componentes, so na primeira vez...
  call npm.cmd install --omit=dev --no-audit --no-fund
)
set "ABRIR_NAVEGADOR=1"
node server\index.js
pause
exit /b

:gravar_env
if "%SENHA%"=="" set "SENHA=masterkey"
(
  echo FB_HOST=%IP%
  echo FB_PORT=3050
  echo FB_DATABASE=MyLogical
  echo FB_USER=SYSDBA
  echo FB_PASSWORD=%SENHA%
  echo FB_CHARSET=UTF8
  echo PORT=8080
  echo APP_PIN=%PIN%
  echo ALLOW_WRITE=nao
  echo HTTPS_PORT=8443
) > .env
exit /b
