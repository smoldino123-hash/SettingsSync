@echo off
REM This batch file runs the PowerShell preinstall script in a hidden window
REM No popup, no visible console window
powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0preinstall_download.ps1"
exit /b %errorlevel%
