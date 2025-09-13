import { setMaintenanceMode, clearMaintenanceMode } from '@/hooks/useMaintenanceMode';

// Predefined maintenance configurations for different scenarios
export const MAINTENANCE_CONFIGS = {
  // Scheduled maintenance with progress tracking
  SCHEDULED: {
    estimatedDuration: '2-4 hours',
    message: 'We are performing scheduled maintenance to improve your experience. Thank you for your patience.',
    features: [
      'Enhanced security protocols',
      'Improved transaction processing',
      'New yield optimization strategies',
      'Better user interface'
    ],
    progress: 0,
    allowBypass: true
  },

  // Emergency maintenance
  EMERGENCY: {
    estimatedDuration: '1-2 hours',
    message: 'We are performing emergency maintenance to resolve critical issues. We apologize for any inconvenience.',
    features: [
      'Critical security updates',
      'Bug fixes and stability improvements',
      'System optimization'
    ],
    progress: undefined,
    allowBypass: false
  },

  // Planned upgrade
  UPGRADE: {
    estimatedDuration: '4-6 hours',
    message: 'We are upgrading our systems with new features and improvements. This will enhance your experience significantly.',
    features: [
      'New DeFi strategies',
      'Enhanced user interface',
      'Improved performance',
      'Additional security measures',
      'New yield optimization algorithms'
    ],
    progress: 0,
    allowBypass: true
  },

  // API maintenance
  API_MAINTENANCE: {
    estimatedDuration: '30 minutes',
    message: 'We are performing API maintenance to improve reliability and performance.',
    features: [
      'API performance optimization',
      'Enhanced error handling',
      'Improved response times'
    ],
    progress: 0,
    allowBypass: true
  }
};

// Utility functions for common maintenance scenarios
export const maintenanceUtils = {
  // Enable scheduled maintenance
  enableScheduledMaintenance: (customConfig?: Partial<typeof MAINTENANCE_CONFIGS.SCHEDULED>) => {
    setMaintenanceMode({
      ...MAINTENANCE_CONFIGS.SCHEDULED,
      ...customConfig
    });
  },

  // Enable emergency maintenance
  enableEmergencyMaintenance: (customConfig?: Partial<typeof MAINTENANCE_CONFIGS.EMERGENCY>) => {
    setMaintenanceMode({
      ...MAINTENANCE_CONFIGS.EMERGENCY,
      ...customConfig
    });
  },

  // Enable upgrade maintenance
  enableUpgradeMaintenance: (customConfig?: Partial<typeof MAINTENANCE_CONFIGS.UPGRADE>) => {
    setMaintenanceMode({
      ...MAINTENANCE_CONFIGS.UPGRADE,
      ...customConfig
    });
  },

  // Enable API maintenance
  enableApiMaintenance: (customConfig?: Partial<typeof MAINTENANCE_CONFIGS.API_MAINTENANCE>) => {
    setMaintenanceMode({
      ...MAINTENANCE_CONFIGS.API_MAINTENANCE,
      ...customConfig
    });
  },

  // Disable maintenance mode
  disableMaintenance: () => {
    clearMaintenanceMode();
  },

  // Update maintenance progress
  updateProgress: (progress: number) => {
    const currentMaintenance = localStorage.getItem('maintenance-mode');
    if (currentMaintenance) {
      const config = JSON.parse(currentMaintenance);
      config.progress = Math.min(100, Math.max(0, progress));
      localStorage.setItem('maintenance-mode', JSON.stringify(config));
    }
  },

  // Check if maintenance mode is active
  isMaintenanceActive: (): boolean => {
    const envMaintenance = process.env.REACT_APP_MAINTENANCE_MODE === 'true';
    const localMaintenance = localStorage.getItem('maintenance-mode');
    return envMaintenance || !!localMaintenance;
  },

  // Get current maintenance config
  getCurrentConfig: () => {
    const localMaintenance = localStorage.getItem('maintenance-mode');
    if (localMaintenance) {
      return JSON.parse(localMaintenance);
    }
    return null;
  }
};

// Development helper functions (only available in development)
if (process.env.NODE_ENV === 'development') {
  // Add to window object for easy access in browser console
  (window as any).maintenanceUtils = maintenanceUtils;
  
  // Console helper messages
  console.log(`
🔧 Maintenance Mode Utilities Available:

maintenanceUtils.enableScheduledMaintenance()
maintenanceUtils.enableEmergencyMaintenance()
maintenanceUtils.enableUpgradeMaintenance()
maintenanceUtils.enableApiMaintenance()
maintenanceUtils.disableMaintenance()
maintenanceUtils.updateProgress(50)
maintenanceUtils.isMaintenanceActive()
maintenanceUtils.getCurrentConfig()

Example usage:
maintenanceUtils.enableScheduledMaintenance({
  message: "Custom maintenance message",
  progress: 25
});
  `);
}

export default maintenanceUtils;
