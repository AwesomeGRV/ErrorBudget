import React, { useState, useEffect } from 'react';

interface Service {
  id: number;
  name: string;
  team: string;
  environment: string;
  errorBudget: number;
  status: 'healthy' | 'warning' | 'critical';
  sli: number;
  slo: number;
}

const ErrorBudgetDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockServices: Service[] = [
      {
        id: 1,
        name: 'Payment Service',
        team: 'Fintech',
        environment: 'Production',
        errorBudget: 85,
        status: 'healthy',
        sli: 99.9,
        slo: 99.5
      },
      {
        id: 2,
        name: 'User Service',
        team: 'Platform',
        environment: 'Production',
        errorBudget: 45,
        status: 'warning',
        sli: 99.2,
        slo: 99.5
      },
      {
        id: 3,
        name: 'Notification Service',
        team: 'Platform',
        environment: 'Production',
        errorBudget: 15,
        status: 'critical',
        sli: 98.5,
        slo: 99.0
      },
      {
        id: 4,
        name: 'API Gateway',
        team: 'Infrastructure',
        environment: 'Production',
        errorBudget: 92,
        status: 'healthy',
        sli: 99.95,
        slo: 99.9
      }
    ];

    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getErrorBudgetColor = (budget: number) => {
    if (budget >= 70) return 'bg-green-500';
    if (budget >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Error Budget Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Error Budget Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor service reliability and error budgets</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Total Services</div>
            <div className="text-2xl font-bold text-gray-900">{services.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Healthy</div>
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.status === 'healthy').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Warning</div>
            <div className="text-2xl font-bold text-yellow-600">
              {services.filter(s => s.status === 'warning').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Critical</div>
            <div className="text-2xl font-bold text-red-600">
              {services.filter(s => s.status === 'critical').length}
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Team: {service.team}</div>
                  <div>Environment: {service.environment}</div>
                </div>
              </div>

              {/* Error Budget Section */}
              <div className="p-6 bg-gray-50">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Error Budget</span>
                    <span className="text-lg font-bold text-gray-900">{service.errorBudget}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getErrorBudgetColor(service.errorBudget)}`}
                      style={{ width: `${service.errorBudget}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">SLI:</span>
                    <span className="ml-2 font-medium">{service.sli}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">SLO:</span>
                    <span className="ml-2 font-medium">{service.slo}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-white border-t border-gray-200">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Check Deploy Safety
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ErrorBudgetDashboard;
