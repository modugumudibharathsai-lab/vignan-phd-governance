@echo off
title VFSTR University Multi-Agent Platform
cd /d "%~dp0"
set PYTHONPATH=%cd%
echo Starting VFSTR University Multi-Agent Web Platform...
python launch.py
pause
