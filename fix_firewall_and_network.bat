@echo off
title VFSTR Platform - Firewall Unblocker
echo =========================================================
echo Requesting Administrator privileges to unblock Port 8000...
echo =========================================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -Command "Start-Process -Verb RunAs -FilePath '%~f0'"
    exit /b
)

echo [1/2] Setting active Wi-Fi profile to Private...
powershell -Command "Set-NetConnectionProfile -Name 'Bharathsai' -NetworkCategory Private -ErrorAction SilentlyContinue"

echo [2/2] Adding inbound firewall rule for Port 8000...
netsh advfirewall firewall delete rule name="VFSTR Port 8000" >nul 2>&1
netsh advfirewall firewall add rule name="VFSTR Port 8000" dir=in action=allow protocol=TCP localport=8000 profile=any >nul 2>&1

echo.
echo =========================================================
echo   SUCCESS! Windows Firewall has unlocked Port 8000!
echo.
echo   On your phone connected to Wi-Fi 'Bharathsai', open:
echo.
echo     http://192.168.31.141:8000
echo.
echo =========================================================
echo.
pause
