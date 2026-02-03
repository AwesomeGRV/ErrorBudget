#!/bin/bash

# SLO Platform Startup Script
# This script starts the complete platform with all services

set -e

echo "🚀 Starting SLO Platform..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "📥 Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Desktop."
    exit 1
fi

# Check if Go is available
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    echo "📥 Download from: https://golang.org/dl/"
    exit 1
fi

echo "✅ All required tools are available!"

# Start infrastructure services
echo "🐳 Starting Docker services (PostgreSQL, Prometheus)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until docker-compose exec -T postgres pg_isready -U slo_user -d slo_platform > /dev/null 2>&1; do
    echo "PostgreSQL not ready, waiting..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Start backend
echo "🔧 Starting Go backend..."
cd backend
go mod download
go run main.go &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Check backend health
until curl -s http://localhost:8080/api/v1/health > /dev/null; do
    echo "Backend not ready, waiting..."
    sleep 2
done

echo "✅ Backend is ready!"

# Seed data
echo "🌱 Seeding sample data..."
if [ -f "scripts/seed-data.sh" ]; then
    chmod +x scripts/seed-data.sh
    ./scripts/seed-data.sh
else
    echo "⚠️  Seed data script not found, skipping..."
fi

# Start frontend (if not already running)
echo "🎨 Starting React frontend..."
cd frontend
if ! curl -s http://localhost:3000 > /dev/null; then
    npm start &
    FRONTEND_PID=$!
else
    echo "✅ Frontend is already running!"
fi
cd ..

echo ""
echo "🎉 SLO Platform is now running!"
echo ""
echo "📊 Access Points:"
echo "   🌐 Frontend Dashboard: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:8080/api/v1"
echo "   📈 Prometheus: http://localhost:9090"
echo "   🗄️  Database: localhost:5432"
echo ""
echo "🛑 To stop the platform:"
echo "   Press Ctrl+C to stop backend/frontend"
echo "   Run 'docker-compose down' to stop infrastructure"
echo ""
echo "📚 Documentation: ./docs/DEVELOPMENT.md"

# Keep script running
wait
