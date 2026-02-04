import React from 'react';

const ModernEmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
      {/* Animated Icon */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full animate-pulse opacity-20"></div>
        <div className="relative w-full h-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        No Services Registered Yet
      </h3>
      
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
        Get started by registering your first service and defining its SLOs to begin monitoring reliability and making data-driven deploy decisions.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="font-semibold text-green-900 mb-1">Monitor SLOs</h4>
          <p className="text-sm text-green-700">Track service reliability in real-time</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 className="font-semibold text-blue-900 mb-1">Error Budgets</h4>
          <p className="text-sm text-blue-700">Visualize remaining budget and burn rates</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h4 className="font-semibold text-purple-900 mb-1">Deploy Safety</h4>
          <p className="text-sm text-purple-700">Make safe deployment decisions</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Your First Service</span>
        </button>
        
        <button className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors font-semibold flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Learn More</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Real-time Monitoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Prometheus Integration</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Deploy Gates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernEmptyState;
