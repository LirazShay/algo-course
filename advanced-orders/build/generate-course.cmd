@echo off
setlocal
cd /d "%~dp0\..\.."

echo [Advanced Order Mastery] Generating deterministic master...
node advanced-orders\build\assemble.mjs --write
if errorlevel 1 exit /b %errorlevel%

echo [Advanced Order Mastery] Verifying deterministic equality...
node advanced-orders\build\assemble.mjs --check
if errorlevel 1 exit /b %errorlevel%

echo [Advanced Order Mastery] GENERATION_AND_CHECK_OK
endlocal
