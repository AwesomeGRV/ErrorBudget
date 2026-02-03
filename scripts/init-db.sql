-- Initialize SLO Platform Database
-- This script runs automatically when PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_name_env ON services(name, environment);
CREATE INDEX IF NOT EXISTS idx_slos_service_id ON slos(service_id);
CREATE INDEX IF NOT EXISTS idx_metric_ingest_slo_timestamp ON metric_ingests(slo_id, timestamp);

-- Add sample data for demonstration
INSERT INTO services (name, owner_team, environment, version, description, created_at, updated_at) VALUES
('user-service', 'platform-team', 'prod', 'v2.1.0', 'User authentication and profile management', NOW(), NOW()),
('payment-service', 'fintech-team', 'prod', 'v1.8.3', 'Payment processing and billing', NOW(), NOW()),
('notification-service', 'platform-team', 'prod', 'v3.2.1', 'Email and push notifications', NOW(), NOW()),
('api-gateway', 'platform-team', 'prod', 'v4.0.0', 'API gateway and routing', NOW(), NOW())
ON CONFLICT (name, environment) DO NOTHING;

-- Insert sample SLOs
INSERT INTO slos (service_id, name, description, sli_type, target, time_window_days, prometheus_query, success_metric, total_metric, fast_burn_threshold, slow_burn_threshold, hard_budget_policy, created_at, updated_at) VALUES
-- User Service SLOs
(1, 'API Availability', 'User service API must be available', 'availability', 0.999, 30, 'sum(rate(http_requests_total{service="user-service",status!~"5.."}[5m])) / sum(rate(http_requests_total{service="user-service"}[5m]))', 'http_requests_success', 'http_requests_total', 2.0, 1.0, false, NOW(), NOW()),
(1, 'Login Latency', 'Login response time must be fast', 'latency', 0.95, 7, 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="user-service",endpoint="/login"}[5m])) by (le))', 'login_latency', 'login_requests', 2.0, 1.0, false, NOW(), NOW()),

-- Payment Service SLOs
(2, 'Transaction Success Rate', 'Payment transactions must succeed', 'availability', 0.9995, 30, 'sum(rate(payment_success_total[5m])) / sum(rate(payment_attempts_total[5m]))', 'payment_success', 'payment_attempts', 2.0, 1.0, true, NOW(), NOW()),
(2, 'Payment Processing Time', 'Payments must process quickly', 'latency', 0.99, 7, 'histogram_quantile(0.99, sum(rate(payment_duration_seconds_bucket[5m])) by (le))', 'payment_latency', 'payment_total', 2.0, 1.0, true, NOW(), NOW()),

-- Notification Service SLOs
(3, 'Email Delivery Rate', 'Emails must be delivered successfully', 'availability', 0.99, 30, 'sum(rate(email_success_total[5m])) / sum(rate_email_attempts_total[5m]))', 'email_success', 'email_attempts', 2.0, 1.0, false, NOW(), NOW()),

-- API Gateway SLOs
(4, 'Gateway Uptime', 'API gateway must be highly available', 'availability', 0.9999, 30, 'up{job="api-gateway"}', 'gateway_up', 'gateway_total', 2.0, 1.0, true, NOW(), NOW()),
(4, 'Request Latency', 'Gateway requests must be fast', 'latency', 0.99, 7, 'histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="api-gateway"}[5m])) by (le))', 'gateway_latency', 'gateway_requests', 2.0, 1.0, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create service dependencies
INSERT INTO service_dependencies (service_id, depends_on_id, type, critical) VALUES
(1, 4, 'api', true),  -- user-service depends on api-gateway
(2, 4, 'api', true),  -- payment-service depends on api-gateway
(3, 4, 'api', false), -- notification-service depends on api-gateway (non-critical)
(2, 1, 'api', true),  -- payment-service depends on user-service
(3, 1, 'api', false)  -- notification-service depends on user-service (non-critical)
ON CONFLICT DO NOTHING;
