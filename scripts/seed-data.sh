#!/bin/bash

# Seed data script for SLO Platform
# This script populates the database with sample services and SLOs

set -e

API_BASE_URL="http://localhost:8080/api/v1"

echo "🌱 Seeding SLO Platform with sample data..."

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
until curl -s "$API_BASE_URL/health" > /dev/null; do
    echo "Backend not ready, waiting..."
    sleep 2
done

echo "✅ Backend is ready!"

# Create sample services
echo "📝 Creating sample services..."

# User Service
curl -X POST "$API_BASE_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-service",
    "owner_team": "platform-team",
    "environment": "prod",
    "version": "v2.1.0",
    "description": "User authentication and profile management"
  }' && echo "✅ Created user-service"

# Payment Service
curl -X POST "$API_BASE_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "payment-service",
    "owner_team": "fintech-team",
    "environment": "prod",
    "version": "v1.8.3",
    "description": "Payment processing and billing"
  }' && echo "✅ Created payment-service"

# Notification Service
curl -X POST "$API_BASE_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "notification-service",
    "owner_team": "platform-team",
    "environment": "prod",
    "version": "v3.2.1",
    "description": "Email and push notifications"
  }' && echo "✅ Created notification-service"

# API Gateway
curl -X POST "$API_BASE_URL/services" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api-gateway",
    "owner_team": "platform-team",
    "environment": "prod",
    "version": "v4.0.0",
    "description": "API gateway and routing"
  }' && echo "✅ Created api-gateway"

# Create SLOs for each service
echo "📊 Creating SLOs..."

# User Service SLOs
USER_SERVICE_ID=1
curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $USER_SERVICE_ID,
    \"name\": \"API Availability\",
    \"description\": \"User service API must be available\",
    \"sli_type\": \"availability\",
    \"target\": 0.999,
    \"time_window_days\": 30,
    \"prometheus_query\": \"sum(rate(http_requests_total{service=\\\"user-service\\\",status!~\\\"5..\\\"}[5m])) / sum(rate(http_requests_total{service=\\\"user-service\\\"}[5m]))\",
    \"success_metric\": \"http_requests_success\",
    \"total_metric\": \"http_requests_total\",
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": false
  }" && echo "✅ Created User Service Availability SLO"

curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $USER_SERVICE_ID,
    \"name\": \"Login Latency\",
    \"description\": \"Login response time must be fast\",
    \"sli_type\": \"latency\",
    \"target\": 0.95,
    \"time_window_days\": 7,
    \"prometheus_query\": \"histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service=\\\"user-service\\\",endpoint=\\\"/login\\\"}[5m])) by (le))\",
    \"success_metric\": \"login_latency\",
    \"total_metric\": \"login_requests\",
    \"latency_threshold\": 0.5,
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": false
  }" && echo "✅ Created User Service Latency SLO"

# Payment Service SLOs
PAYMENT_SERVICE_ID=2
curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $PAYMENT_SERVICE_ID,
    \"name\": \"Transaction Success Rate\",
    \"description\": \"Payment transactions must succeed\",
    \"sli_type\": \"availability\",
    \"target\": 0.9995,
    \"time_window_days\": 30,
    \"prometheus_query\": \"sum(rate(payment_success_total[5m])) / sum(rate(payment_attempts_total[5m]))\",
    \"success_metric\": \"payment_success\",
    \"total_metric\": \"payment_attempts\",
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": true
  }" && echo "✅ Created Payment Service Success Rate SLO"

curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $PAYMENT_SERVICE_ID,
    \"name\": \"Payment Processing Time\",
    \"description\": \"Payments must process quickly\",
    \"sli_type\": \"latency\",
    \"target\": 0.99,
    \"time_window_days\": 7,
    \"prometheus_query\": \"histogram_quantile(0.99, sum(rate(payment_duration_seconds_bucket[5m])) by (le))\",
    \"success_metric\": \"payment_latency\",
    \"total_metric\": \"payment_total\",
    \"latency_threshold\": 2.0,
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": true
  }" && echo "✅ Created Payment Service Latency SLO"

# Notification Service SLOs
NOTIFICATION_SERVICE_ID=3
curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $NOTIFICATION_SERVICE_ID,
    \"name\": \"Email Delivery Rate\",
    \"description\": \"Emails must be delivered successfully\",
    \"sli_type\": \"availability\",
    \"target\": 0.99,
    \"time_window_days\": 30,
    \"prometheus_query\": \"sum(rate(email_success_total[5m])) / sum(rate(email_attempts_total[5m]))\",
    \"success_metric\": \"email_success\",
    \"total_metric\": \"email_attempts\",
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": false
  }" && echo "✅ Created Notification Service SLO"

# API Gateway SLOs
GATEWAY_SERVICE_ID=4
curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $GATEWAY_SERVICE_ID,
    \"name\": \"Gateway Uptime\",
    \"description\": \"API gateway must be highly available\",
    \"sli_type\": \"availability\",
    \"target\": 0.9999,
    \"time_window_days\": 30,
    \"prometheus_query\": \"up{job=\\\"api-gateway\\\"}\",
    \"success_metric\": \"gateway_up\",
    \"total_metric\": \"gateway_total\",
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": true
  }" && echo "✅ Created API Gateway Availability SLO"

curl -X POST "$API_BASE_URL/slos" \
  -H "Content-Type: application/json" \
  -d "{
    \"service_id\": $GATEWAY_SERVICE_ID,
    \"name\": \"Request Latency\",
    \"description\": \"Gateway requests must be fast\",
    \"sli_type\": \"latency\",
    \"target\": 0.99,
    \"time_window_days\": 7,
    \"prometheus_query\": \"histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service=\\\"api-gateway\\\"}[5m])) by (le))\",
    \"success_metric\": \"gateway_latency\",
    \"total_metric\": \"gateway_requests\",
    \"latency_threshold\": 0.1,
    \"fast_burn_threshold\": 2.0,
    \"slow_burn_threshold\": 1.0,
    \"hard_budget_policy\": false
  }" && echo "✅ Created API Gateway Latency SLO"

echo ""
echo "🎉 Sample data seeding completed!"
echo ""
echo "📊 Services created:"
echo "   - user-service (platform-team)"
echo "   - payment-service (fintech-team)"
echo "   - notification-service (platform-team)"
echo "   - api-gateway (platform-team)"
echo ""
echo "📈 SLOs created:"
echo "   - API Availability SLOs"
echo "   - Latency SLOs"
echo "   - Payment Success Rate SLOs"
echo "   - Email Delivery Rate SLOs"
echo ""
echo "🌐 Access the dashboard at: http://localhost:3000"
echo "📊 Access Prometheus at: http://localhost:9090"
echo "🔧 Access API at: http://localhost:8080/api/v1"
