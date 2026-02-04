import React, { useState, useEffect } from 'react';
import { serviceAPI, monitoringAPI } from '../services/api';
import { Service, SLOStatus, DeployCheck } from '../types';
import ModernServiceCard from './ModernServiceCard';
import ModernDeployCheckModal from './ModernDeployCheckModal';
import ModernEmptyState from './ModernEmptyState';

const Dashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [sloStatuses, setSLOStatuses] = useState<{ [key: number]: SLOStatus[] }>({});
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeployCheck, setShowDeployCheck] = useState(false);
  const [deployCheck, setDeployCheck] = useState<DeployCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (): Promise<void> => {
    console.log('Fetching services...');
    try {
      const response = await serviceAPI.getServices();
      console.log('Services response:', response);
      setServices(response.data);
      
      // Fetch SLO statuses for each service
      const statuses: { [key: number]: SLOStatus[] } = {};
      for (const service of response.data) {
        try {
          console.log(`Fetching SLO status for service ${service.id}...`);
          const sloResponse = await monitoringAPI.getSLOStatus(service.id);
          console.log(`SLO status for service ${service.id}:`, sloResponse);
          statuses[service.id] = sloResponse.data;
        } catch (error) {
          console.error(`Failed to fetch SLO status for service ${service.id}:`, error);
          statuses[service.id] = [];
        }
      }
      setSLOStatuses(statuses);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      // Add some dummy data as fallback
      setServices([
        {
          id: 1,
          name: 'Sample Service',
          owner_team: 'platform-team',
          environment: 'prod',
          version: 'v1.0.0',
          description: 'Sample service for testing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      setSLOStatuses({
        1: [{
          slo_id: 1,
          service_name: 'Sample Service',
          slo_name: 'Sample SLO',
          current_sli: 0.95,
          target: 0.99,
          status: 'healthy' as const,
          remaining_budget: 75.0,
          consumed_budget: 25.0,
          current_burn_rate: 1.0,
          fast_burn_rate: 1.5,
          slow_burn_rate: 0.8,
          time_to_exhaustion: 30,
          last_updated: new Date().toISOString()
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeployCheck = async (service: Service): Promise<void> => {
    setSelectedService(service);
    setShowDeployCheck(true);
    
    try {
      const response = await monitoringAPI.checkDeploySafety(service.name, service.environment);
      setDeployCheck(response.data);
    } catch (error) {
      console.error('Failed to check deploy safety:', error);
      setDeployCheck(null);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'breached':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDeployDecisionColor = (decision: string): string => {
    switch (decision) {
      case 'SAFE':
        return 'bg-green-100 text-green-800';
      case 'RISKY':
        return 'bg-yellow-100 text-yellow-800';
      case 'BLOCKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    console.log('Dashboard is loading...');
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <div className="text-lg font-semibold text-gray-700">Loading services...</div>
        <div className="text-sm text-gray-500 mt-2">Fetching SLO data</div>
      </div>
    );
  }

  console.log('Dashboard render - services:', services.length);
  console.log('Dashboard render - loading:', loading);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Service Reliability Dashboard
          </h2>
          <p className="text-gray-600 mt-2">Monitor your services' SLO status and deploy safety</p>
        </div>
        <button
          onClick={() => fetchServices()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {services.length === 0 ? (
        <ModernEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ModernServiceCard
              key={service.id}
              service={service}
              sloStatuses={sloStatuses[service.id] || []}
              onDeployCheck={() => handleDeployCheck(service)}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      {showDeployCheck && selectedService && (
        <ModernDeployCheckModal
          service={selectedService}
          deployCheck={deployCheck}
          onClose={() => setShowDeployCheck(false)}
          getDecisionColor={getDeployDecisionColor}
        />
      )}
    </div>
  );
};

export default Dashboard;
