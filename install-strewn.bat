@echo off
setlocal
title Strewn: Install
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  ) else (
    echo Node.js is required. Download LTS from https://nodejs.org/
    pause
    exit /b 1
  )
)

echo Installing Strewn dependencies...
call npm install
if errorlevel 1 exit /b 1

echo Generating icon...
call npm run generate-icon
if errorlevel 1 exit /b 1

echo Building frontend...
call npm run build
if errorlevel 1 exit /b 1

echo.
echo Building Windows portable exe (Electron)...
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm run electron:build
if errorlevel 1 (
  echo.
  echo Electron build failed. You can still run: launch-strewn.bat
  pause
  exit /b 1
)

echo.
echo Creating desktop shortcut...
call create-desktop-shortcut.bat

echo.
echo Done! Double-click the Strewn shortcut on your Desktop, or run release\Strewn.exe
pause
