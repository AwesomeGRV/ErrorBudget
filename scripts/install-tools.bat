@echo off
REM Tool Installation Script for Windows
REM This script checks for and guides installation of required tools

echo 🔧 SLO Platform - Tool Installation Check
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is installed
    node --version
) else (
    echo ❌ Node.js is not installed
    echo 📥 Please download and install from: https://nodejs.org/
    echo    Choose the LTS version for Windows
)

echo.

REM Check npm
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm is installed
    npm --version
) else (
    echo ❌ npm is not installed
    echo 📥 Usually comes with Node.js, please reinstall Node.js
)

echo.

REM Check Docker
echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker is installed
    docker --version
) else (
    echo ❌ Docker is not installed
    echo 📥 Please download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo    Restart your computer after installation
)

echo.

REM Check Go
echo Checking Go...
go version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Go is installed
    go version
) else (
    echo ❌ Go is not installed
    echo 📥 Please download and install from: https://golang.org/dl/
    echo    Choose the Windows installer
    echo    Restart your terminal after installation
)

echo.
echo 📋 Installation Summary:
echo    Node.js: Required for frontend development
echo    Docker: Required for PostgreSQL and Prometheus
echo    Go: Required for backend API
echo.
echo 🔄 After installing tools, please restart your terminal and run:
echo    scripts\start-platform.bat
echo.
pause
