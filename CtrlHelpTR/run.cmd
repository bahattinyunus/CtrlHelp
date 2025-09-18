@echo off
setlocal
set PORT=5173
cd /d %~dp0

where py >nul 2>nul
if %errorlevel%==0 (
  start "" cmd /c "py -m http.server %PORT%"
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    start "" cmd /c "python -m http.server %PORT%"
  ) else (
    echo Python bulunamadi. index.html dogrudan aciliyor.
    start "" "index.html"
    goto :EOF
  )
)

timeout /t 1 >nul
start "" "http://localhost:%PORT%/"


