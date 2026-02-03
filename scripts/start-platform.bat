@echo off
REM SLO Platform Startup Script for Windows
REM This script starts the complete platform with all services

echo 🚀 Starting SLO Platform...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo 📥 Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo ✅ Docker is available!

REM Start infrastructure services
echo 🐳 Starting Docker services (PostgreSQL, Prometheus)...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check if PostgreSQL is ready
echo 🔍 Checking PostgreSQL connection...
:check_postgres
docker-compose exec -T postgres pg_isready -U slo_user -d slo_platform >nul 2>&1
if %errorlevel% neq 0 (
    echo PostgreSQL not ready, waiting...
    timeout /t 2 /nobreak >nul
    goto check_postgres
)

echo ✅ PostgreSQL is ready!

REM Start backend
echo 🔧 Starting Go backend...
cd backend
start "SLO Backend" cmd /k "go run main.go"
cd ..

REM Wait for backend to be ready
echo ⏳ Waiting for backend to be ready...
timeout /t 5 /nobreak >nul

REM Check backend health
:check_backend
curl -s http://localhost:8080/api/v1/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Backend not ready, waiting...
    timeout /t 2 /nobreak >nul
    goto check_backend
)

echo ✅ Backend is ready!

REM Seed data
echo 🌱 Seeding sample data...
if exist "scripts\seed-data.sh" (
    echo ⚠️  Seed data script requires Git Bash or WSL. Please run manually after startup.
) else (
    echo ⚠️  Seed data script not found, skipping...
)

REM Start frontend
echo 🎨 Starting React frontend...
cd frontend
start "SLO Frontend" cmd /k "npm start"
cd ..

echo.
echo 🎉 SLO Platform is now running!
echo.
echo 📊 Access Points:
echo    🌐 Frontend Dashboard: http://localhost:3000
echo    🔧 Backend API: http://localhost:8080/api/v1
echo    📈 Prometheus: http://localhost:9090
echo    🗄️  Database: localhost:5432
echo.
echo 🛑 To stop the platform:
echo    Close the terminal windows to stop backend/frontend
echo    Run 'docker-compose down' to stop infrastructure
echo.
echo 📚 Documentation: .\docs\DEVELOPMENT.md
echo.
echo 🌐 Opening dashboard in browser...
start http://localhost:3000

pause
