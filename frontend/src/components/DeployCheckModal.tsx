import React from 'react';
import { Service, DeployCheck } from '../types';
import { X, CheckCircle, AlertTriangle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface DeployCheckModalProps {
  service: Service;
  deployCheck: DeployCheck | null;
  onClose: () => void;
  getDecisionColor: (decision: string) => string;
}

const DeployCheckModal: React.FC<DeployCheckModalProps> = ({
  service,
  deployCheck,
  onClose,
  getDecisionColor,
}) => {
  const getDecisionIcon = (decision: string): JSX.Element => {
    switch (decision) {
      case 'SAFE':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'RISKY':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'BLOCKED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Deploy Safety Check
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900">Service</h4>
            <p className="text-lg font-semibold">{service.name}</p>
            <p className="text-sm text-gray-500">{service.environment.toUpperCase()}</p>
          </div>

          {deployCheck ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getDecisionIcon(deployCheck.decision)}
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(deployCheck.decision)}`}>
                    {deployCheck.decision}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Reason</h5>
                <p className="text-sm text-gray-700">{deployCheck.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <h5 className="text-sm font-medium text-gray-900">Burn Rate</h5>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {deployCheck.burn_rate.toFixed(2)}x
                  </p>
                  <p className="text-xs text-gray-500">Normal consumption</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <h5 className="text-sm font-medium text-gray-900">Budget</h5>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {deployCheck.remaining_budget.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Recent Incidents</span>
                  <span className={`font-medium ${deployCheck.recent_incidents ? 'text-red-600' : 'text-green-600'}`}>
                    {deployCheck.recent_incidents ? 'Yes' : 'No'}
                  </span>
                </div>

                {deployCheck.last_slo_breach && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last SLO Breach</span>
                    <span className="font-medium text-gray-900">
                      {formatTime(deployCheck.last_slo_breach)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Checked At</span>
                  <span className="font-medium text-gray-900">
                    {formatTime(deployCheck.checked_at)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className={`p-3 rounded-lg ${
                  deployCheck.decision === 'SAFE' ? 'bg-green-50 border border-green-200' :
                  deployCheck.decision === 'RISKY' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    deployCheck.decision === 'SAFE' ? 'text-green-800' :
                    deployCheck.decision === 'RISKY' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {deployCheck.decision === 'SAFE' && 'Deployment is safe to proceed.'}
                    {deployCheck.decision === 'RISKY' && 'Proceed with caution. Monitor closely after deployment.'}
                    {deployCheck.decision === 'BLOCKED' && 'Deployment is not recommended. Address issues before proceeding.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Clock className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-gray-500">Unable to perform deploy safety check</p>
              <p className="text-sm text-gray-400 mt-1">Service may not have SLOs configured</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          {deployCheck && deployCheck.decision !== 'BLOCKED' && (
            <button
              className={`px-4 py-2 text-white rounded transition-colors ${
                deployCheck.decision === 'SAFE' ? 'bg-green-600 hover:bg-green-700' :
                'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {deployCheck.decision === 'SAFE' ? 'Deploy' : 'Deploy Anyway'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployCheckModal;
