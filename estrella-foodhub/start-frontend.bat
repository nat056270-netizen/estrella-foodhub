@echo off
title Estrella Foodhub - Frontend
cd /d "%~dp0frontend"
echo Starting the frontend using this copy's .env configuration.
call npm.cmd run dev
pause

