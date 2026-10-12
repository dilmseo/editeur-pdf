@echo off
setlocal
cd /d "%~dp0"
set "NODE=node"
where node >nul 2>nul || set "NODE=C:\Users\Home\Documents\claude\node\node.exe"
if not exist "%NODE%" if "%NODE%" NEQ "node" (
  echo Node introuvable. Ouvre index.html directement : tout marche sauf l'OCR.
  pause
  exit /b 1
)
"%NODE%" serveur.js
pause
