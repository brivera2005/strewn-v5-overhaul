# Strewn launcher: opens standalone desktop window
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Ensure-Node {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $nodePath = 'C:\Program Files\nodejs'
    if (Test-Path "$nodePath\node.exe") {
      $env:PATH = "$nodePath;$env:PATH"
    } else {
      Write-Host 'Node.js is required. Run install-strewn.bat after installing Node.js.' -ForegroundColor Red
      Read-Host 'Press Enter to exit'
      exit 1
    }
  }
}

Ensure-Node

if (-not (Test-Path 'node_modules')) {
  Write-Host 'First launch: installing dependencies...'
  npm install
}

$portable = Join-Path $PSScriptRoot 'release\Strewn.exe'
$tauri = Join-Path $PSScriptRoot 'src-tauri\target\release\strewn.exe'
$unpacked = Join-Path $PSScriptRoot 'release\win-unpacked\Strewn.exe'

if (Test-Path $portable) {
  Write-Host 'Launching Strewn...'
  Start-Process $portable
  exit 0
}

if (Test-Path $tauri) {
  Write-Host 'Launching Strewn (Tauri)...'
  Start-Process $tauri
  exit 0
}

if (-not (Test-Path 'dist\index.html')) {
  Write-Host 'Building Strewn...'
  npm run build
}

if (Test-Path $unpacked) {
  Start-Process $unpacked
  exit 0
}

Write-Host 'No packaged exe found. Starting Electron dev window...'
Write-Host 'Build one with: npm run electron:build'
npm run electron:dev
