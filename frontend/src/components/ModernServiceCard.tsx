import React from 'react';
import { Service, SLOStatus } from '../types';
import { Activity, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Shield } from 'lucide-react';

interface ModernServiceCardProps {
  service: Service;
  sloStatuses: SLOStatus[];
  onDeployCheck: () => void;
  getStatusColor: (status: string) => string;
}

const ModernServiceCard: React.FC<ModernServiceCardProps> = ({
  service,
  sloStatuses,
  onDeployCheck,
  getStatusColor,
}) => {
  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'breached':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
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

  const getBudgetColor = (budget: number): string => {
    if (budget > 50) return 'from-green-400 to-emerald-500';
    if (budget > 20) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  const getStatusGradient = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'from-green-400 to-emerald-500';
      case 'degraded':
        return 'from-yellow-400 to-orange-500';
      case 'breached':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-gray-400 to-slate-500';
    }
  };

  const worstStatus = getWorstStatus();
  const averageBudget = getAverageBudget();

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden">
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${getStatusGradient(worstStatus)}`}></div>
      
      {/* Content */}
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusGradient(worstStatus)} animate-pulse`}></div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {service.name}
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                {service.owner_team}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                service.environment === 'prod' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                {service.environment.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusIcon(worstStatus)}
              <span className={`text-sm font-bold capitalize ${getStatusColor(worstStatus)}`}>
                {worstStatus}
              </span>
            </div>
            <div className="text-xs text-gray-500">{sloStatuses.length} SLOs</div>
          </div>
        </div>

        {/* Budget Display */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Error Budget</span>
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r ${getBudgetColor(averageBudget)} bg-clip-text text-transparent`}>
              {averageBudget}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getBudgetColor(averageBudget)} transition-all duration-500 rounded-full`}
              style={{ width: `${averageBudget}%` }}
            ></div>
          </div>
          
          {/* Version Info */}
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">Version</span>
            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
              {service.version}
            </span>
          </div>
        </div>

        {/* SLO Status List */}
        <div className="space-y-2 mb-6">
          {sloStatuses.slice(0, 3).map((slo, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                {getStatusIcon(slo.status)}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{slo.slo_name}</div>
                  <div className="text-xs text-gray-500">
                    Target: {(slo.target * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getStatusColor(slo.status)}`}>
                  {(slo.current_sli * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {slo.current_burn_rate ? (slo.current_burn_rate > 1 ? '🔥' : '✓') + ' ' + slo.current_burn_rate.toFixed(1) + 'x' : 'N/A'}
                </div>
              </div>
            </div>
          ))}
          {sloStatuses.length > 3 && (
            <div className="text-center py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
              +{sloStatuses.length - 3} more SLOs
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onDeployCheck}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <TrendingUp className="w-5 h-5" />
          <span>Check Deploy Safety</span>
        </button>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ModernServiceCard;
