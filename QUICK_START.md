# Quick Start Guide

## 🚀 One-Click Setup

### Option 1: Windows (Recommended)
```bash
# Check and install required tools
scripts\install-tools.bat

# Start the complete platform
scripts\start-platform.bat
```

### Option 2: Linux/Mac
```bash
# Check and install required tools
chmod +x scripts/install-tools.sh
./scripts/install-tools.sh

# Start the complete platform
chmod +x scripts/start-platform.sh
./scripts/start-platform.sh
```

## 📋 Manual Setup (if scripts don't work)

### 1. Install Required Tools

**Node.js** (Frontend)
- Download: https://nodejs.org/
- Choose LTS version
- Verify: `node --version`

**Docker Desktop** (Database & Metrics)
- Download: https://www.docker.com/products/docker-desktop/
- Restart computer after installation
- Verify: `docker --version`

**Go** (Backend API)
- Download: https://golang.org/dl/
- Choose Windows installer
- Restart terminal after installation
- Verify: `go version`

### 2. Start Platform

```bash
# Start infrastructure services
docker-compose up -d

# Start backend (in new terminal)
cd backend
go run main.go

# Start frontend (in new terminal)
cd frontend
npm start

# Seed sample data (in new terminal)
./scripts/seed-data.sh
```

## 🌐 Access Points

Once running, access the platform at:

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8080/api/v1
- **Prometheus**: http://localhost:9090
- **Database**: localhost:5432

## 🎯 What You'll See

1. **Service Dashboard** - Overview of all services and their SLO status
2. **Service Cards** - Individual service health, error budgets, and deploy safety
3. **Deploy Safety Modal** - Real-time deploy decisions (SAFE/RISKY/BLOCKED)
4. **Prometheus Metrics** - Raw metrics and queries

## 🛑 Stop Platform

```bash
# Stop infrastructure
docker-compose down

# Stop backend/frontend (Ctrl+C in their terminals)
```

## 📚 More Info

- **Development Guide**: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- **API Documentation**: Available at http://localhost:8080/api/v1
- **Architecture**: See README.md for detailed architecture

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Check what's using the port
netstat -ano | findstr :3000  # Frontend
netstat -ano | findstr :8080  # Backend
netstat -ano | findstr :5432  # Database
```

**Docker issues?**
```bash
# Restart Docker Desktop
# Check Docker status
docker ps
```

**Backend not starting?**
```bash
# Check Go installation
go version

# Check dependencies
cd backend
go mod tidy
```

**Frontend not starting?**
```bash
# Clear node modules
cd frontend
rm -rf node_modules
npm install
npm start
```

## 🎉 Success!

When everything is working, you'll see:
- ✅ Frontend running at http://localhost:3000
- ✅ Backend API responding at http://localhost:8080/api/v1
- ✅ PostgreSQL database ready
- ✅ Prometheus collecting metrics
- ✅ Sample services with SLOs displayed

Welcome to SLO-First Reliability! 🚀
