# SLO-First Reliability Platform

A production-ready platform that makes Service Level Objectives the primary decision-making artifact for engineering teams.

## Product Vision

Answers three questions instantly:
- Are we reliable right now? (SLO health)
- Can we safely deploy today? (error budget-aware)
- What will break next if we do nothing? (burn prediction)

## Quick Start

###  One-Click Setup (Windows)

```bash
# Install required tools
scripts\install-tools.bat

# Start complete platform
scripts\start-platform.bat
```

###  Manual Setup

1. **Install Tools**:
   - Docker Desktop: https://www.docker.com/products/docker-desktop/
   - Go: https://golang.org/dl/
   - Node.js: https://nodejs.org/ (already installed)

2. **Start Services**:
   ```bash
   docker-compose up -d
   cd backend && go run main.go
   cd frontend && npm start
   ./scripts/seed-data.sh
   ```

3. **Access Platform**:
   - Dashboard: http://localhost:3000
   - API: http://localhost:8080/api/v1
   - Prometheus: http://localhost:9090

 **Full Guide**: See [QUICK_START.md](./QUICK_START.md) for detailed instructions

## Access Points

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:8080/api/v1
- **Prometheus**: http://localhost:9090
- **Database**: localhost:5432

## Architecture

- **Backend**: Go with REST API (OpenAPI spec)
- **Frontend**: React + TypeScript
- **Database**: PostgreSQL (metadata) + Time-series store
- **Metrics**: Prometheus integration (primary), Datadog adapter (future)
- **Infrastructure**: Docker Compose (local), Terraform (production)

## Core Features

### 1. Service Registry
- Define services with name, owner team, environment
- Track dependencies and versions
- Service metadata management

### 2. SLO Definition Engine
- Support multiple SLI types (availability, latency, error rate, custom)
- Configurable time windows and targets
- Error budget policies

### 3. Error Budget Tracking
- Real-time error budget calculations
- Historical burn analysis
- Budget reset handling

### 4. Burn Rate Analysis
- Multi-window burn rates (5m, 1h, 6h, 24h)
- Visual burn projections
- Alert on sustained burns

### 5. Deploy Safety API
- Input: service name + environment
- Output: SAFE, RISKY, or BLOCKED
- Decision based on budget and burn rate

### 6. SLO Dashboard
- Current SLO status for all services
- Error budget remaining percentage
- Burn rate trends
- Deploy safety checks

## API Endpoints

- `POST /services` - Register service
- `POST /slos` - Create SLO definition
- `GET /services/{id}/slo-status` - Get current SLO health
- `GET /services/{id}/error-budget` - Get error budget status
- `GET /deploy-check?service=X&env=prod` - Deploy safety check
- `POST /metrics/ingest` - Metrics ingestion

## Core Logic

### Error Budget Calculation
```
Error Budget = 1 - SLO Target
Consumed = (Total Bad Events / Total Events)
Remaining = Error Budget - Consumed
```

### Burn Rate
```
Burn Rate = Consumed Budget / Time Window
```

### Deploy Gate Logic
```
IF remaining_budget < 10% AND burn_rate > 1 → BLOCK
ELSE IF burn_rate > 2 → RISKY
ELSE → SAFE
```

## Development

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for detailed setup and architecture documentation.

## Production Deployment

```bash
cd infra
terraform init
terraform plan
terraform apply
```

## License

Internal use - Production SRE Platform
