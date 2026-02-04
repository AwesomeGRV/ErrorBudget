import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock services data
const mockServices = [
  { id: 1, name: 'user-service', owner_team: 'platform-team', environment: 'prod', version: 'v2.1.0', description: 'User authentication and profile management' },
  { id: 2, name: 'payment-service', owner_team: 'fintech-team', environment: 'prod', version: 'v1.8.3', description: 'Payment processing and billing' },
  { id: 3, name: 'notification-service', owner_team: 'platform-team', environment: 'prod', version: 'v3.2.1', description: 'Email and push notifications' },
  { id: 4, name: 'api-gateway', owner_team: 'platform-team', environment: 'prod', version: 'v4.0.0', description: 'API gateway and routing' },
  { id: 5, name: 'inventory-service', owner_team: 'ecommerce-team', environment: 'prod', version: 'v2.5.0', description: 'Product inventory management' },
  { id: 6, name: 'order-service', owner_team: 'ecommerce-team', environment: 'prod', version: 'v3.1.2', description: 'Order processing and fulfillment' },
  { id: 7, name: 'search-service', owner_team: 'platform-team', environment: 'prod', version: 'v1.9.0', description: 'Product search and recommendations' },
  { id: 8, name: 'analytics-service', owner_team: 'data-team', environment: 'prod', version: 'v2.3.1', description: 'Data analytics and reporting' }
];

// Mock SLO statuses
const mockSLOStatuses = {
  1: [
    { slo_id: 1, service_name: 'user-service', slo_name: 'API Availability', current_sli: 0.9995, target: 0.999, status: 'healthy', remaining_budget: 87.5, consumed_budget: 12.5, current_burn_rate: 1.2, fast_burn_rate: 2.0, slow_burn_rate: 1.0, time_to_exhaustion: 30, last_updated: new Date().toISOString() },
    { slo_id: 2, service_name: 'user-service', slo_name: 'Login Latency', current_sli: 0.92, target: 0.95, status: 'degraded', remaining_budget: 65.0, consumed_budget: 35.0, current_burn_rate: 1.8, fast_burn_rate: 2.5, slow_burn_rate: 1.2, time_to_exhaustion: 15, last_updated: new Date().toISOString() }
  ],
  2: [
    { slo_id: 3, service_name: 'payment-service', slo_name: 'Transaction Success Rate', current_sli: 0.9997, target: 0.9995, status: 'healthy', remaining_budget: 92.0, consumed_budget: 8.0, current_burn_rate: 0.8, fast_burn_rate: 1.5, slow_burn_rate: 0.5, time_to_exhaustion: 45, last_updated: new Date().toISOString() }
  ],
  3: [
    { slo_id: 4, service_name: 'notification-service', slo_name: 'Email Delivery Rate', current_sli: 0.975, target: 0.99, status: 'breached', remaining_budget: 15.0, consumed_budget: 85.0, current_burn_rate: 3.5, fast_burn_rate: 4.0, slow_burn_rate: 2.0, time_to_exhaustion: 5, last_updated: new Date().toISOString() }
  ],
  4: [
    { slo_id: 5, service_name: 'api-gateway', slo_name: 'Gateway Uptime', current_sli: 0.99995, target: 0.9999, status: 'healthy', remaining_budget: 95.0, consumed_budget: 5.0, current_burn_rate: 0.5, fast_burn_rate: 1.0, slow_burn_rate: 0.3, time_to_exhaustion: 60, last_updated: new Date().toISOString() }
  ],
  5: [
    { slo_id: 6, service_name: 'inventory-service', slo_name: 'Stock Accuracy', current_sli: 0.998, target: 0.995, status: 'healthy', remaining_budget: 78.0, consumed_budget: 22.0, current_burn_rate: 1.1, fast_burn_rate: 1.8, slow_burn_rate: 0.8, time_to_exhaustion: 35, last_updated: new Date().toISOString() },
    { slo_id: 7, service_name: 'inventory-service', slo_name: 'Update Latency', current_sli: 0.89, target: 0.95, status: 'degraded', remaining_budget: 42.0, consumed_budget: 58.0, current_burn_rate: 2.2, fast_burn_rate: 3.0, slow_burn_rate: 1.5, time_to_exhaustion: 12, last_updated: new Date().toISOString() }
  ],
  6: [
    { slo_id: 8, service_name: 'order-service', slo_name: 'Order Processing Time', current_sli: 0.94, target: 0.95, status: 'degraded', remaining_budget: 55.0, consumed_budget: 45.0, current_burn_rate: 1.6, fast_burn_rate: 2.3, slow_burn_rate: 1.2, time_to_exhaustion: 20, last_updated: new Date().toISOString() }
  ],
  7: [
    { slo_id: 9, service_name: 'search-service', slo_name: 'Search Response Time', current_sli: 0.97, target: 0.95, status: 'healthy', remaining_budget: 88.0, consumed_budget: 12.0, current_burn_rate: 0.9, fast_burn_rate: 1.6, slow_burn_rate: 0.6, time_to_exhaustion: 40, last_updated: new Date().toISOString() },
    { slo_id: 10, service_name: 'search-service', slo_name: 'Search Accuracy', current_sli: 0.989, target: 0.99, status: 'degraded', remaining_budget: 72.0, consumed_budget: 28.0, current_burn_rate: 1.4, fast_burn_rate: 2.1, slow_burn_rate: 1.0, time_to_exhaustion: 25, last_updated: new Date().toISOString() }
  ],
  8: [
    { slo_id: 11, service_name: 'analytics-service', slo_name: 'Report Generation Time', current_sli: 0.91, target: 0.95, status: 'degraded', remaining_budget: 48.0, consumed_budget: 52.0, current_burn_rate: 1.9, fast_burn_rate: 2.8, slow_burn_rate: 1.4, time_to_exhaustion: 18, last_updated: new Date().toISOString() },
    { slo_id: 12, service_name: 'analytics-service', slo_name: 'Data Freshness', current_sli: 0.985, target: 0.98, status: 'healthy', remaining_budget: 82.0, consumed_budget: 18.0, current_burn_rate: 1.0, fast_burn_rate: 1.7, slow_burn_rate: 0.7, time_to_exhaustion: 38, last_updated: new Date().toISOString() }
  ]
};

// API Routes
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/services', (req, res) => {
  res.json({ data: mockServices });
});

app.get('/api/v1/services/:id/slo-status', (req, res) => {
  const id = parseInt(req.params.id);
  const statuses = mockSLOStatuses[id] || [];
  res.json({ data: statuses });
});

app.get('/api/v1/deploy-check', (req, res) => {
  const { service, env } = req.query;
  const decisions = ['SAFE', 'RISKY', 'BLOCKED'];
  const decision = Math.random() > 0.7 ? decisions[Math.floor(Math.random() * 3)] : 'SAFE';
  
  res.json({
    service_name: service,
    environment: env,
    decision: decision,
    reason: decision === 'SAFE' ? 'SLO status healthy' : decision === 'RISKY' ? 'High burn rate detected' : 'Error budget critically low',
    remaining_budget: Math.floor(Math.random() * 100),
    burn_rate: parseFloat((Math.random() * 3).toFixed(1)),
    recent_incidents: decision === 'BLOCKED',
    checked_at: new Date().toISOString()
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
