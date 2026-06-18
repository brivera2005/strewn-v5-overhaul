@echo off

setlocal

title Strewn

cd /d "%~dp0"



where node >nul 2>&1

if errorlevel 1 (

  if exist "C:\Program Files\nodejs\node.exe" (

    set "PATH=C:\Program Files\nodejs;%PATH%"

  ) else (

    echo Node.js is required. Install from https://nodejs.org/ then run install-strewn.bat

    pause

    exit /b 1

  )

)



if not exist "node_modules\" (

  echo First launch — installing dependencies...

  call npm install

  if errorlevel 1 exit /b 1

)



if exist "release\Strewn.exe" (

  echo Launching Strewn...

  start "" "release\Strewn.exe"

  exit /b 0

)



if exist "src-tauri\target\release\strewn.exe" (

  echo Launching Strewn (Tauri build)...

  start "" "src-tauri\target\release\strewn.exe"

  exit /b 0

)



if not exist "dist\index.html" (

  echo Building Strewn...

  call npm run build

  if errorlevel 1 exit /b 1

)



echo.

echo No packaged .exe found. Starting Electron window (dev fallback)...

echo To build a standalone exe: npm run electron:build

echo Or with Rust installed: npm run tauri:build

echo.

call npm run electron:dev

