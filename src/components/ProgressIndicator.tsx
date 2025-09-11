import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  const getStepIcon = (step: Step, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (step.status === 'current') {
      return <Loader2 className="w-5 h-5 text-green-600 animate-spin" />;
    } else {
      return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepClasses = (step: Step, index: number) => {
    const baseClasses = "flex items-center gap-3 p-4 rounded-xl transition-all duration-300";
    
    if (step.status === 'completed') {
      return `${baseClasses} bg-green-50 border border-green-200`;
    } else if (step.status === 'current') {
      return `${baseClasses} bg-green-100 border-2 border-green-300 shadow-lg`;
    } else {
      return `${baseClasses} bg-gray-50 border border-gray-200`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className={getStepClasses(step, index)}>
          <div className="flex-shrink-0">
            {getStepIcon(step, index)}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${
              step.status === 'completed' ? 'text-green-800' :
              step.status === 'current' ? 'text-green-700' :
              'text-gray-600'
            }`}>
              {step.title}
            </h3>
            {step.description && (
              <p className={`text-sm mt-1 ${
                step.status === 'completed' ? 'text-green-600' :
                step.status === 'current' ? 'text-green-600' :
                'text-gray-500'
              }`}>
                {step.description}
              </p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`absolute left-6 top-12 w-0.5 h-8 ${
              step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

interface CircularProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 'md',
  strokeWidth = 4,
  className = '',
  children
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-green-500 transition-all duration-500 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

interface LinearProgressProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  color?: 'green' | 'blue' | 'yellow' | 'red';
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  percentage,
  label,
  showPercentage = true,
  className = '',
  color = 'green'
}) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
};
