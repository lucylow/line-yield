import React, { useState, useEffect } from 'react';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CircularProgress } from './ProgressIndicator';

interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = '' }) => {
  const { getPerformanceMetrics } = useAnalytics();
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getPerformanceMetrics]);

  const getPerformanceScore = () => {
    let score = 100;
    
    // Deduct points for slow page load
    if (metrics.pageLoadTime > 3000) score -= 20;
    else if (metrics.pageLoadTime > 2000) score -= 10;
    else if (metrics.pageLoadTime > 1000) score -= 5;
    
    // Deduct points for slow interactions
    if (metrics.interactionTime > 1000) score -= 15;
    else if (metrics.interactionTime > 500) score -= 10;
    else if (metrics.interactionTime > 200) score -= 5;
    
    // Deduct points for errors
    score -= metrics.errorCount * 10;
    
    return Math.max(0, score);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const performanceScore = getPerformanceScore();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 z-50 ${className}`}
        title="Performance Monitor"
      >
        <Activity className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-scale-in ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Performance Monitor</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall Performance Score */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <CircularProgress 
              percentage={performanceScore} 
              size="md"
              className="w-20 h-20"
            >
              <span className={`text-lg font-bold ${getPerformanceColor(performanceScore)}`}>
                {performanceScore}
              </span>
            </CircularProgress>
          </div>
          <p className={`text-sm font-medium ${getPerformanceColor(performanceScore)}`}>
            {getPerformanceLabel(performanceScore)}
          </p>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Page Load</span>
            </div>
            <span className={`text-sm font-bold ${
              metrics.pageLoadTime < 1000 ? 'text-green-600' :
              metrics.pageLoadTime < 2000 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.pageLoadTime.toFixed(0)}ms
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Interaction</span>
            </div>
            <span className={`text-sm font-bold ${
              metrics.interactionTime < 200 ? 'text-green-600' :
              metrics.interactionTime < 500 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.interactionTime.toFixed(0)}ms
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <span className={`text-sm font-bold ${
              metrics.errorCount === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.errorCount}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Transactions</span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              {metrics.transactionCount}
            </span>
          </div>
        </div>

        {/* Performance Tips */}
        {performanceScore < 90 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Performance Tips:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {metrics.pageLoadTime > 2000 && (
                <li>• Consider using a faster internet connection</li>
              )}
              {metrics.interactionTime > 500 && (
                <li>• Close other browser tabs to free up memory</li>
              )}
              {metrics.errorCount > 0 && (
                <li>• Refresh the page to clear any temporary issues</li>
              )}
              <li>• Keep your browser updated for best performance</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
