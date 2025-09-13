import React from 'react';
import { MaintenanceScreen } from '@/components/MaintenanceScreen';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';

export const MaintenancePage: React.FC = () => {
  const { maintenanceConfig, checkMaintenanceStatus, isLoading } = useMaintenanceMode();

  const handleRetry = async () => {
    await checkMaintenanceStatus();
  };

  return (
    <MaintenanceScreen
      maintenanceInfo={maintenanceConfig}
      onRetry={handleRetry}
    />
  );
};

export default MaintenancePage;
