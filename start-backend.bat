@echo off
title Estrella Foodhub - Backend
cd /d "%~dp0backend"
echo Starting the API using this copy's .env configuration.
call npm.cmd run dev
pause

