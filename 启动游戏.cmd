@echo off
setlocal
chcp 65001 >nul
title Moon Chase Adventure - Local Game
cd /d "%~dp0"
set "MOON_GAME_NODE="
for /f "delims=" %%I in ('where node.exe 2^>nul') do if not defined MOON_GAME_NODE set "MOON_GAME_NODE=%%I"
if not defined MOON_GAME_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "MOON_GAME_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined MOON_GAME_NODE (
  echo 请先安装 Node.js 24 或更新版本：https://nodejs.org/
  echo 安装后重新双击此文件即可，不需要 npm install。
  pause
  exit /b 1
)
"%MOON_GAME_NODE%" "%~dp0launcher.js"
if errorlevel 1 (
  echo.
  echo 请保留上面的错误信息，方便排查。
  pause
  exit /b 1
)
exit /b 0
