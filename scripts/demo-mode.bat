@echo off
REM Demo Mode - Frontend Only
REM This script runs the frontend with mock data for demonstration

echo 🎨 SLO Platform - Demo Mode (Frontend Only)
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is available
node --version

REM Create mock API service
echo 🔄 Creating mock API service...
cd frontend

REM Create a simple mock server
echo import express from 'express'; > mock-server.js
echo import cors from 'cors'; >> mock-server.js
echo const app = express(); >> mock-server.js
echo app.use(cors()); >> mock-server.js
echo app.use(express.json()); >> mock-server.js
echo. >> mock-server.js
echo // Mock services data >> mock-server.js
echo const mockServices = [ >> mock-server.js
echo   { id: 1, name: 'user-service', owner_team: 'platform-team', environment: 'prod', version: 'v2.1.0', description: 'User authentication and profile management' }, >> mock-server.js
echo   { id: 2, name: 'payment-service', owner_team: 'fintech-team', environment: 'prod', version: 'v1.8.3', description: 'Payment processing and billing' }, >> mock-server.js
echo   { id: 3, name: 'notification-service', owner_team: 'platform-team', environment: 'prod', version: 'v3.2.1', description: 'Email and push notifications' }, >> mock-server.js
echo   { id: 4, name: 'api-gateway', owner_team: 'platform-team', environment: 'prod', version: 'v4.0.0', description: 'API gateway and routing' } >> mock-server.js
echo ]; >> mock-server.js
echo. >> mock-server.js
echo // Mock SLO statuses >> mock-server.js
echo const mockSLOStatuses = { >> mock-server.js
echo   1: [ >> mock-server.js
echo     { id: 1, slo_id: 1, slo_name: 'API Availability', status: 'healthy', current_sli: 0.9995, target: 0.999, remaining_budget: 87.5, burn_rate: 1.2, last_updated: new Date().toISOString() }, >> mock-server.js
echo     { id: 2, slo_id: 2, slo_name: 'Login Latency', status: 'degraded', current_sli: 0.92, target: 0.95, remaining_budget: 65.0, burn_rate: 1.8, last_updated: new Date().toISOString() } >> mock-server.js
echo   ], >> mock-server.js
echo   2: [ >> mock-server.js
echo     { id: 3, slo_id: 3, slo_name: 'Transaction Success Rate', status: 'healthy', current_sli: 0.9997, target: 0.9995, remaining_budget: 92.0, burn_rate: 0.8, last_updated: new Date().toISOString() } >> mock-server.js
echo   ], >> mock-server.js
echo   3: [ >> mock-server.js
echo     { id: 4, slo_id: 4, slo_name: 'Email Delivery Rate', status: 'breached', current_sli: 0.975, target: 0.99, remaining_budget: 15.0, burn_rate: 3.5, last_updated: new Date().toISOString() } >> mock-server.js
echo   ], >> mock-server.js
echo   4: [ >> mock-server.js
echo     { id: 5, slo_id: 5, slo_name: 'Gateway Uptime', status: 'healthy', current_sli: 0.99995, target: 0.9999, remaining_budget: 95.0, burn_rate: 0.5, last_updated: new Date().toISOString() } >> mock-server.js
echo   ] >> mock-server.js
echo }; >> mock-server.js
echo. >> mock-server.js
echo // API Routes >> mock-server.js
echo app.get('/api/v1/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() })); >> mock-server.js
echo app.get('/api/v1/services', (req, res) => res.json({ data: mockServices })); >> mock-server.js
echo app.get('/api/v1/services/:id/slo-status', (req, res) => { >> mock-server.js
echo   const id = parseInt(req.params.id); >> mock-server.js
echo   const statuses = mockSLOStatuses[id] || []; >> mock-server.js
echo   res.json({ data: statuses }); >> mock-server.js
echo }); >> mock-server.js
echo app.get('/api/v1/deploy-check', (req, res) => { >> mock-server.js
echo   const { service, env } = req.query; >> mock-server.js
echo   const decisions = ['SAFE', 'RISKY', 'BLOCKED']; >> mock-server.js
echo   const decision = Math.random() > 0.7 ? decisions[Math.floor(Math.random() * 3)] : 'SAFE'; >> mock-server.js
echo   res.json({ >> mock-server.js
echo     service_name: service, >> mock-server.js
echo     environment: env, >> mock-server.js
echo     decision: decision, >> mock-server.js
echo     reason: decision === 'SAFE' ? 'SLO status healthy' : decision === 'RISKY' ? 'High burn rate detected' : 'Error budget critically low', >> mock-server.js
echo     remaining_budget: Math.floor(Math.random() * 100), >> mock-server.js
echo     burn_rate: (Math.random() * 3).toFixed(1), >> mock-server.js
echo     recent_incidents: decision === 'BLOCKED', >> mock-server.js
echo     checked_at: new Date().toISOString() >> mock-server.js
echo   }); >> mock-server.js
echo }); >> mock-server.js
echo. >> mock-server.js
echo const PORT = 8080; >> mock-server.js
echo app.listen(PORT, () => console.log(`Mock API server running on http://localhost:${PORT}`)); >> mock-server.js

echo 📦 Installing mock server dependencies...
call npm install express cors

echo 🚀 Starting mock API server...
start "Mock API Server" cmd /k "node mock-server.js"

echo ⏳ Waiting for mock server to start...
timeout /t 3 /nobreak >nul

echo 🎨 Starting React frontend...
start "SLO Frontend" cmd /k "npm start"

echo.
echo 🎉 Demo Mode is starting!
echo.
echo 📊 Access Points:
echo    🌐 Frontend Dashboard: http://localhost:3000
echo    🔧 Mock API: http://localhost:8080/api/v1
echo.
echo 📝 This is demo mode with:
echo    ✅ Mock service data
echo    ✅ Sample SLO statuses
echo    ✅ Simulated deploy safety checks
echo    ✅ No database required
echo    ✅ No Docker required
echo.
echo 🌐 Opening dashboard in browser...
start http://localhost:3000

echo.
echo 💡 To stop demo mode:
echo    Close the terminal windows
echo.
pause
