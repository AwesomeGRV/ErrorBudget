import React, { useState, useEffect } from 'react';
import { serviceAPI, monitoringAPI } from '../services/api';
import { Service, SLOStatus, DeployCheck } from '../types';
import ServiceCard from './ServiceCard';
import DeployCheckModal from './DeployCheckModal';

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
    try {
      const response = await serviceAPI.getServices();
      setServices(response.data);
      
      // Fetch SLO statuses for each service
      const statuses: { [key: number]: SLOStatus[] } = {};
      for (const service of response.data) {
        try {
          const sloResponse = await monitoringAPI.getSLOStatus(service.id);
          statuses[service.id] = sloResponse.data;
        } catch (error) {
          console.error(`Failed to fetch SLO status for service ${service.id}:`, error);
          statuses[service.id] = [];
        }
      }
      setSLOStatuses(statuses);
    } catch (error) {
      console.error('Failed to fetch services:', error);
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Service Reliability Dashboard</h2>
        <button
          onClick={() => fetchServices()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services registered</h3>
          <p className="text-gray-500">Get started by registering your first service.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
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
        <DeployCheckModal
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
