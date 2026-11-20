@echo off
rem Inicia o site em modo desenvolvimento (evita o bloqueio de scripts do PowerShell)
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
call npm.cmd run dev -- --open
