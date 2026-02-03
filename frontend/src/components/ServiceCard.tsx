import React from 'react';
import { Service, SLOStatus } from '../types';
import { Activity, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  sloStatuses: SLOStatus[];
  onDeployCheck: () => void;
  getStatusColor: (status: string) => string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  sloStatuses,
  onDeployCheck,
  getStatusColor,
}) => {
  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'breached':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getWorstStatus = (): string => {
    if (sloStatuses.length === 0) return 'unknown';
    
    const statusPriority = { breached: 3, degraded: 2, healthy: 1, unknown: 0 };
    return sloStatuses.reduce((worst: string, current: SLOStatus) => {
      return statusPriority[current.status as keyof typeof statusPriority] > 
             statusPriority[worst as keyof typeof statusPriority] ? current.status : worst;
    }, 'healthy');
  };

  const getAverageBudget = (): number => {
    if (sloStatuses.length === 0) return 0;
    const total = sloStatuses.reduce((sum: number, status: SLOStatus) => sum + status.remaining_budget, 0);
    return Math.round(total / sloStatuses.length);
  };

  const worstStatus = getWorstStatus();
  const averageBudget = getAverageBudget();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
          <p className="text-sm text-gray-500">{service.owner_team}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            service.environment === 'prod' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {service.environment.toUpperCase()}
          </span>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(worstStatus)}`}>
          {getStatusIcon(worstStatus)}
          <span className="text-sm font-medium capitalize">{worstStatus}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Error Budget</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  averageBudget > 50 ? 'bg-green-500' :
                  averageBudget > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${averageBudget}%` }}
              />
            </div>
            <span className="text-sm font-medium">{averageBudget}%</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">SLOs</span>
          <span className="text-sm font-medium">{sloStatuses.length}</span>
        </div>

        {service.version && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-medium">{service.version}</span>
          </div>
        )}
      </div>

      {sloStatuses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">SLO Status</h4>
          <div className="space-y-2">
            {sloStatuses.slice(0, 3).map((status) => (
              <div key={status.slo_id} className="flex justify-between items-center">
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {status.slo_name}
                </span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(status.status)}
                  <span className={`text-xs font-medium ${getStatusColor(status.status)}`}>
                    {status.remaining_budget.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            {sloStatuses.length > 3 && (
              <div className="text-xs text-gray-500">
                +{sloStatuses.length - 3} more SLOs
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onDeployCheck}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Check Deploy Safety
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
