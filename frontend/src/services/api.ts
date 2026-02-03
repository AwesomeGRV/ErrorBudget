import axios from 'axios';
import { Service, SLO, SLOStatus, ErrorBudget, DeployCheck, MetricIngest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const serviceAPI = {
  createService: (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Service>('/services', service),
  
  getServices: () =>
    api.get<Service[]>('/services'),
  
  getService: (id: number) =>
    api.get<Service>(`/services/${id}`),
  
  updateService: (id: number, service: Partial<Service>) =>
    api.put<Service>(`/services/${id}`, service),
  
  deleteService: (id: number) =>
    api.delete(`/services/${id}`),
};

export const sloAPI = {
  createSLO: (slo: Omit<SLO, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<SLO>('/slos', slo),
  
  getSLOs: (serviceId: number) =>
    api.get<SLO[]>(`/services/${serviceId}/slos`),
  
  getSLO: (id: number) =>
    api.get<SLO>(`/slos/${id}`),
  
  updateSLO: (id: number, slo: Partial<SLO>) =>
    api.put<SLO>(`/slos/${id}`, slo),
  
  deleteSLO: (id: number) =>
    api.delete(`/slos/${id}`),
};

export const monitoringAPI = {
  getSLOStatus: (serviceId: number) =>
    api.get<SLOStatus[]>(`/services/${serviceId}/slo-status`),
  
  getErrorBudget: (serviceId: number) =>
    api.get<ErrorBudget[]>(`/services/${serviceId}/error-budget`),
  
  checkDeploySafety: (serviceName: string, environment: string) =>
    api.get<DeployCheck>('/deploy-check', {
      params: { service: serviceName, env: environment },
    }),
  
  ingestMetric: (metric: MetricIngest) =>
    api.post('/metrics/ingest', metric),
};

export const healthAPI = {
  check: () =>
    api.get('/health'),
};

export default api;
