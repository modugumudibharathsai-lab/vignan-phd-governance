@echo off
:: Batch script to allow incoming traffic on port 8000 through Windows Firewall
echo ======================================================================
echo   VFSTR Platform: Enabling Phone and Network Access on Port 8000
echo ======================================================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges to add firewall rule...
    powershell -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall firewall add rule name=\"VFSTR Port 8000\" dir=in action=allow protocol=TCP localport=8000 profile=any & pause' -Verb RunAs"
    exit /b
)

echo Adding Windows Firewall rule for Port 8000...
netsh advfirewall firewall delete rule name="VFSTR Port 8000" >nul 2>&1
netsh advfirewall firewall add rule name="VFSTR Port 8000" dir=in action=allow protocol=TCP localport=8000 profile=any

echo.
echo ======================================================================
echo [SUCCESS] Port 8000 is now accessible to all devices on your Wi-Fi!
echo Open this URL on your phone or other laptops:
echo.
powershell -Command "$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi*').IPAddress; Write-Host ('  --> http://' + $ip + ':8000') -ForegroundColor Green"
echo ======================================================================
pause
