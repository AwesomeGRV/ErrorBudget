# Development Guide

## Overview

SLO-First Reliability Platform is a production-grade system that makes Service Level Objectives the primary decision-making artifact for engineering teams.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   Go Backend    │    │   PostgreSQL    │
│   (TypeScript)  │◄──►│   (REST API)    │◄──►│   (Metadata)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Prometheus    │
                       │   (Metrics)     │
                       └─────────────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+ (for local development)

### Local Development

1. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

2. **Start Backend**
   ```bash
   cd backend
   go mod download
   go run main.go
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Seed Data**
   ```bash
   chmod +x scripts/seed-data.sh
   ./scripts/seed-data.sh
   ```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Prometheus**: http://localhost:9090
- **Database**: localhost:5432

## Core Concepts

### Error Budget Formula

```
Error Budget = 1 - SLO Target
Consumed = (Total Bad Events / Total Events)
Remaining = Error Budget - Consumed
```

### Burn Rate Calculation

```
Burn Rate = Consumed Budget / Time Window
```

### Deploy Gate Logic

```
IF remaining_budget < 10% AND burn_rate > 1 → BLOCK
ELSE IF burn_rate > 2 → RISKY
ELSE → SAFE
```

## API Documentation

### Services

#### Create Service
```http
POST /api/v1/services
Content-Type: application/json

{
  "name": "user-service",
  "owner_team": "platform-team",
  "environment": "prod",
  "version": "v2.1.0",
  "description": "User authentication and profile management"
}
```

#### List Services
```http
GET /api/v1/services
```

#### Get Service
```http
GET /api/v1/services/{id}
```

### SLOs

#### Create SLO
```http
POST /api/v1/slos
Content-Type: application/json

{
  "service_id": 1,
  "name": "API Availability",
  "description": "User service API must be available",
  "sli_type": "availability",
  "target": 0.999,
  "time_window_days": 30,
  "prometheus_query": "sum(rate(http_requests_total{service=\"user-service\",status!~\"5..\"}[5m])) / sum(rate(http_requests_total{service=\"user-service\"}[5m]))",
  "fast_burn_threshold": 2.0,
  "slow_burn_threshold": 1.0,
  "hard_budget_policy": false
}
```

#### Get SLO Status
```http
GET /api/v1/services/{id}/slo-status
```

#### Get Error Budget
```http
GET /api/v1/services/{id}/error-budget
```

### Deploy Safety

#### Check Deploy Safety
```http
GET /api/v1/deploy-check?service=user-service&env=prod
```

Response:
```json
{
  "service_name": "user-service",
  "environment": "prod",
  "decision": "SAFE",
  "reason": "SLO status healthy",
  "remaining_budget": 87.5,
  "burn_rate": 1.2,
  "recent_incidents": false,
  "checked_at": "2024-01-15T10:30:00Z"
}
```

## Database Schema

### Services
- `id` - Primary key
- `name` - Service name (unique with environment)
- `owner_team` - Team responsible for the service
- `environment` - Environment (prod/stage)
- `version` - Current version
- `description` - Service description

### SLOs
- `id` - Primary key
- `service_id` - Foreign key to services
- `name` - SLO name
- `sli_type` - Type of SLI (availability, latency, error_rate, custom)
- `target` - SLO target (e.g., 0.999 for 99.9%)
- `time_window_days` - Time window for SLO evaluation
- `prometheus_query` - Custom Prometheus query for SLI
- `hard_budget_policy` - Whether budget policy is strict

### Metrics
- `id` - Primary key
- `service_id` - Service identifier
- `slo_id` - SLO identifier
- `timestamp` - Metric timestamp
- `value` - Metric value
- `metric_type` - Type of metric (success, total, latency)

## Frontend Architecture

### Components

- **Dashboard** - Main overview page
- **ServiceCard** - Individual service status card
- **DeployCheckModal** - Deploy safety check modal

### State Management

- React hooks for local state
- Axios for API calls
- TypeScript for type safety

### Styling

- Tailwind CSS for utility-first styling
- Lucide React for icons
- Responsive design

## Backend Architecture

### Layers

- **API Layer** - HTTP handlers and routing
- **Service Layer** - Business logic
- **Data Layer** - Database operations
- **Metrics Layer** - Prometheus integration

### Key Services

- **ServiceRegistry** - Service management
- **SLOService** - SLO calculations and status
- **MetricsService** - Prometheus queries and metrics

### Error Handling

- Consistent error responses
- Proper HTTP status codes
- Structured logging with Zap

## Prometheus Integration

### Metrics Collection

The platform integrates with Prometheus for:

- SLI calculations
- Burn rate analysis
- Historical data

### Query Examples

#### Availability SLI
```promql
sum(rate(http_requests_total{service="user-service",status!~"5.."}[5m])) / 
sum(rate(http_requests_total{service="user-service"}[5m]))
```

#### Latency SLI
```promql
histogram_quantile(0.95, 
  sum(rate(http_request_duration_seconds_bucket{service="user-service"}[5m])) by (le)
)
```

## Deployment

### Docker Compose (Local)

```bash
docker-compose up -d
```

### Kubernetes (Production)

```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Environment Variables

#### Backend
- `SLO_DATABASE_URL` - PostgreSQL connection string
- `SLO_PROMETHEUS_URL` - Prometheus server URL
- `SLO_JWT_SECRET` - JWT signing secret
- `SLO_SERVER_PORT` - Server port (default: 8080)
- `SLO_ENVIRONMENT` - Environment (development/production)

#### Frontend
- `REACT_APP_API_URL` - Backend API URL

## Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Test API endpoints
curl -f http://localhost:8080/api/v1/health

# Test deploy safety check
curl -f "http://localhost:8080/api/v1/deploy-check?service=user-service&env=prod"
```

## Monitoring

### Health Checks

- Backend: `/api/v1/health`
- Database: Connection health check
- Prometheus: Target health status

### Metrics

- Request latency
- Error rates
- Database connection pool
- Memory usage

### Alerting

Configure alerts in Prometheus for:

- High error rates
- SLO breaches
- Database connectivity issues
- High memory usage

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL container status
   - Verify connection string
   - Check network connectivity

2. **Prometheus Queries Fail**
   - Verify Prometheus is accessible
   - Check query syntax
   - Ensure metrics are being scraped

3. **Frontend Cannot Connect to Backend**
   - Check CORS settings
   - Verify API URL configuration
   - Check backend health

### Debug Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U slo_user -d slo_platform

# Test API
curl -v http://localhost:8080/api/v1/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style

- **Go**: Follow standard Go conventions
- **TypeScript**: Use ESLint and Prettier
- **Commits**: Use conventional commit format

### Review Process

- Code review required for all changes
- Tests must pass
- Documentation must be updated
