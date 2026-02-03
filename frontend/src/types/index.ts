export interface Service {
  id: number;
  name: string;
  owner_team: string;
  environment: string;
  version?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  slos?: SLO[];
}

export interface SLO {
  id: number;
  service_id: number;
  name: string;
  description?: string;
  sli_type: SLIType;
  target: number;
  time_window_days: number;
  prometheus_query?: string;
  success_metric?: string;
  total_metric?: string;
  latency_threshold?: number;
  fast_burn_threshold: number;
  slow_burn_threshold: number;
  hard_budget_policy: boolean;
  created_at: string;
  updated_at: string;
  current_status?: SLOStatus;
  error_budget?: ErrorBudget;
}

export type SLIType = 'availability' | 'latency' | 'error_rate' | 'custom';

export interface SLOStatus {
  slo_id: number;
  service_name: string;
  slo_name: string;
  current_sli: number;
  target: number;
  status: 'healthy' | 'degraded' | 'breached';
  remaining_budget: number;
  consumed_budget: number;
  current_burn_rate: number;
  fast_burn_rate: number;
  slow_burn_rate: number;
  time_to_exhaustion: number;
  last_updated: string;
}

export interface ErrorBudget {
  slo_id: number;
  total_budget: number;
  consumed_budget: number;
  remaining_budget: number;
  remaining_percent: number;
  current_burn_rate: number;
  five_minute_burn: number;
  one_hour_burn: number;
  six_hour_burn: number;
  twenty_four_hour_burn: number;
  last_updated: string;
}

export type DeployDecision = 'SAFE' | 'RISKY' | 'BLOCKED';

export interface DeployCheck {
  service_name: string;
  environment: string;
  decision: DeployDecision;
  reason: string;
  remaining_budget: number;
  burn_rate: number;
  recent_incidents: boolean;
  last_slo_breach?: string;
  checked_at: string;
}

export interface MetricIngest {
  service_id: number;
  slo_id: number;
  timestamp: string;
  value: number;
  metric_type: string;
}
