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
  { id: 4, name: 'api-gateway', owner_team: 'platform-team', environment: 'prod', version: 'v4.0.0', description: 'API gateway and routing' } 
]; 
 
// Mock SLO statuses 
const mockSLOStatuses = { 
  1: [ 
    { id: 1, slo_id: 1, slo_name: 'API Availability', status: 'healthy', current_sli: 0.9995, target: 0.999, remaining_budget: 87.5, burn_rate: 1.2, last_updated: new Date().toISOString() }, 
    { id: 2, slo_id: 2, slo_name: 'Login Latency', status: 'degraded', current_sli: 0.92, target: 0.95, remaining_budget: 65.0, burn_rate: 1.8, last_updated: new Date().toISOString() } 
  ], 
  2: [ 
    { id: 3, slo_id: 3, slo_name: 'Transaction Success Rate', status: 'healthy', current_sli: 0.9997, target: 0.9995, remaining_budget: 92.0, burn_rate: 0.8, last_updated: new Date().toISOString() } 
  ], 
  3: [ 
    { id: 4, slo_id: 4, slo_name: 'Email Delivery Rate', status: 'breached', current_sli: 0.975, target: 0.99, remaining_budget: 15.0, burn_rate: 3.5, last_updated: new Date().toISOString() } 
  ], 
  4: [ 
    { id: 5, slo_id: 5, slo_name: 'Gateway Uptime', status: 'healthy', current_sli: 0.99995, target: 0.9999, remaining_budget: 95.0, burn_rate: 0.5, last_updated: new Date().toISOString() } 
  ] 
}; 
 
// API Routes 
app.get('/api/v1/health', (req, res) = status: 'healthy', timestamp: new Date().toISOString() })); 
app.get('/api/v1/services', (req, res) = data: mockServices })); 
app.get('/api/v1/services/:id/slo-status', (req, res) =
  const id = parseInt(req.params.id); 
  res.json({ data: statuses }); 
}); 
app.get('/api/v1/deploy-check', (req, res) =
  const { service, env } = req.query; 
  const decisions = ['SAFE', 'RISKY', 'BLOCKED']; 
  const decision = Math.random()  ? decisions[Math.floor(Math.random() * 3)] : 'SAFE'; 
  res.json({ 
    service_name: service, 
    environment: env, 
    decision: decision, 
    reason: decision === 'SAFE' ? 'SLO status healthy' : decision === 'RISKY' ? 'High burn rate detected' : 'Error budget critically low', 
    remaining_budget: Math.floor(Math.random() * 100), 
    burn_rate: (Math.random() * 3).toFixed(1), 
    recent_incidents: decision === 'BLOCKED', 
    checked_at: new Date().toISOString() 
  }); 
}); 
 
const PORT = 8080; 
app.listen(PORT, () = API server running on http://localhost:${PORT}`)); 
