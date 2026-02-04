import React from 'react';
import { Service, DeployCheck } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

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

  if (!service) return null;

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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">{service.name}</h4>
            <p className="text-sm text-gray-600">{service.environment} Environment</p>
          </div>

          {deployCheck ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getDecisionIcon(deployCheck.decision)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDecisionColor(deployCheck.decision)}`}>
                  {deployCheck.decision}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">{deployCheck.reason}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Budget Remaining:</span>
                    <span className="ml-2 font-medium">{deployCheck.remaining_budget.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Burn Rate:</span>
                    <span className="ml-2 font-medium">{deployCheck.burn_rate.toFixed(1)}x</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Checked at: {formatTime(deployCheck.checked_at)}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Checking deploy safety...</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeployCheckModal;
