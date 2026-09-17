@echo off
title Push Project to GitHub - VFSTR University Platform
echo ======================================================================
echo    Pushing code to https://github.com/modugumudibharathsai-lab/vignan-phd-governance
echo ======================================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ==================================================================
    echo   SUCCESS! All project files pushed to GitHub successfully!
    echo ==================================================================
) else (
    echo ==================================================================
    echo   Push encountered an issue. See message above.
    echo ==================================================================
)
echo.
pause
