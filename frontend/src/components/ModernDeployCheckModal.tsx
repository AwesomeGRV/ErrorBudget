import React from 'react';
import { Service, DeployCheck } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Clock, Shield, TrendingUp, AlertCircle } from 'lucide-react';

interface ModernDeployCheckModalProps {
  service: Service;
  deployCheck: DeployCheck | null;
  onClose: () => void;
  getDecisionColor: (decision: string) => string;
}

const ModernDeployCheckModal: React.FC<ModernDeployCheckModalProps> = ({
  service,
  deployCheck,
  onClose,
  getDecisionColor,
}) => {
  const getDecisionIcon = (decision: string): JSX.Element => {
    switch (decision) {
      case 'SAFE':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'RISKY':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'BLOCKED':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getDecisionGradient = (decision: string): string => {
    switch (decision) {
      case 'SAFE':
        return 'from-green-400 to-emerald-500';
      case 'RISKY':
        return 'from-yellow-400 to-orange-500';
      case 'BLOCKED':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-gray-400 to-slate-500';
    }
  };

  const getDecisionEmoji = (decision: string): string => {
    switch (decision) {
      case 'SAFE':
        return '🚀';
      case 'RISKY':
        return '⚠️';
      case 'BLOCKED':
        return '🛑';
      default:
        return '⏳';
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${deployCheck ? getDecisionGradient(deployCheck.decision) : 'from-gray-400 to-slate-500'} rounded-t-3xl`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                {getDecisionIcon(deployCheck?.decision || 'UNKNOWN')}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Deploy Safety Check</h3>
                <p className="text-white/80 text-sm">{service.name} • {service.environment}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <span className="text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Decision Display */}
        {deployCheck ? (
          <div className="p-6">
            {/* Main Decision */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{getDecisionEmoji(deployCheck.decision)}</div>
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold bg-gradient-to-r ${getDecisionGradient(deployCheck.decision)} bg-clip-text text-transparent border-2 border-current/20`}>
                {deployCheck.decision}
              </div>
              <p className="text-gray-600 mt-3 text-lg">{deployCheck.reason}</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Budget Remaining</span>
                </div>
                <div className={`text-3xl font-bold ${
                  deployCheck.remaining_budget > 50 ? 'text-green-600' :
                  deployCheck.remaining_budget > 20 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {deployCheck.remaining_budget.toFixed(1)}%
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-100 p-4 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Burn Rate</span>
                </div>
                <div className={`text-3xl font-bold ${
                  deployCheck.burn_rate > 2 ? 'text-red-600' :
                  deployCheck.burn_rate > 1 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {deployCheck.burn_rate.toFixed(1)}x
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-3 mb-6">
              {deployCheck.recent_incidents && (
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Recent incidents detected</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">{formatTime(deployCheck.checked_at)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {deployCheck.decision === 'SAFE' && (
                <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg">
                  🚀 Proceed with Deploy
                </button>
              )}
              
              {deployCheck.decision === 'RISKY' && (
                <>
                  <button className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg">
                    ⚠️ Deploy with Caution
                  </button>
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium">
                    Cancel
                  </button>
                </>
              )}
              
              {deployCheck.decision === 'BLOCKED' && (
                <>
                  <button className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg">
                    🛑 Deploy Blocked
                  </button>
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium">
                    View Details
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Checking deploy safety...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernDeployCheckModal;
