@echo off

setlocal

cd /d "%~dp0"



set "EXE=%~dp0release\Strewn.exe"

if not exist "%EXE%" (

  set "EXE=%~dp0release\win-unpacked\Strewn.exe"

)

if not exist "%EXE%" (

  echo Build Strewn first: install-strewn.bat

  pause

  exit /b 1

)



set "SHORTCUT=%USERPROFILE%\Desktop\Strewn.lnk"

powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT%'); $s.TargetPath = '%EXE%'; $s.WorkingDirectory = '%~dp0release'; $s.IconLocation = '%~dp0assets\icon.ico'; $s.Description = 'STREWN: Pain Routing Roguelite'; $s.Save()"



echo Desktop shortcut created: %SHORTCUT%

echo Points to: %EXE%

pause

