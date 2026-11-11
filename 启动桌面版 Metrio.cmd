@echo off
if not exist "%~dp0dist\Metrio\Metrio.exe" (
  echo Desktop build not found. Run scripts\build-desktop.ps1 first.
  pause
  exit /b 1
)
start "" "%~dp0dist\Metrio\Metrio.exe"
