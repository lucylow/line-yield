import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { MaintenanceScreen } from './MaintenanceScreen';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';

interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { maintenanceConfig, isBypassed, checkMaintenanceStatus } = useMaintenanceMode();

  // Show maintenance screen if maintenance mode is active and not bypassed
  if (maintenanceConfig.isMaintenanceMode && !isBypassed) {
    return (
      <MaintenanceScreen
        maintenanceInfo={maintenanceConfig}
        onRetry={checkMaintenanceStatus}
      />
    );
  }

  // Wrap the app with error boundary
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Application Error:', error, errorInfo);
        }
        
        // In production, you might want to send this to an error monitoring service
        // like Sentry, LogRocket, or Bugsnag
      }}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppWrapper;
