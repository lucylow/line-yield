import { useState, useEffect, useCallback } from 'react';

interface MaintenanceConfig {
  isMaintenanceMode: boolean;
  estimatedDuration?: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  message?: string;
  features?: string[];
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  contactEmail?: string;
  allowBypass?: boolean;
  bypassKey?: string;
}

interface MaintenanceModeHook {
  maintenanceConfig: MaintenanceConfig;
  isLoading: boolean;
  error: string | null;
  checkMaintenanceStatus: () => Promise<void>;
  bypassMaintenance: (key: string) => boolean;
  isBypassed: boolean;
}

// Default maintenance configuration
const DEFAULT_CONFIG: MaintenanceConfig = {
  isMaintenanceMode: false,
  estimatedDuration: '2-4 hours',
  message: 'We are currently performing scheduled maintenance to improve your experience.',
  features: [
    'Enhanced security protocols',
    'Improved transaction processing',
    'New yield optimization strategies',
    'Better user interface'
  ],
  socialLinks: {
    twitter: 'https://twitter.com/lineyield',
    discord: 'https://discord.gg/lineyield',
    telegram: 'https://t.me/lineyield'
  },
  contactEmail: 'support@lineyield.com',
  allowBypass: true,
  bypassKey: 'dev-bypass-2024'
};

export const useMaintenanceMode = (): MaintenanceModeHook => {
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBypassed, setIsBypassed] = useState(false);

  // Check maintenance status from API or environment
  const checkMaintenanceStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check environment variable first (for quick deployment control)
      const envMaintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === 'true';
      
      if (envMaintenanceMode) {
        setMaintenanceConfig(prev => ({
          ...prev,
          isMaintenanceMode: true,
          startTime: new Date().toISOString(),
          progress: 0
        }));
        setIsLoading(false);
        return;
      }

      // Check localStorage for manual override
      const localMaintenance = localStorage.getItem('maintenance-mode');
      if (localMaintenance) {
        const config = JSON.parse(localMaintenance);
        setMaintenanceConfig(prev => ({
          ...prev,
          ...config,
          isMaintenanceMode: true
        }));
        setIsLoading(false);
        return;
      }

      // Check API endpoint for maintenance status
      try {
        const response = await fetch('/api/maintenance-status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const apiConfig = await response.json();
          setMaintenanceConfig(prev => ({
            ...prev,
            ...apiConfig
          }));
        } else {
          // If API is down, assume maintenance mode
          setMaintenanceConfig(prev => ({
            ...prev,
            isMaintenanceMode: true,
            message: 'Service temporarily unavailable. Please try again later.',
            progress: undefined
          }));
        }
      } catch (apiError) {
        // If API call fails, check if it's a network error
        console.warn('Maintenance status API unavailable:', apiError);
        
        // Only set maintenance mode if it's a clear network error
        if (apiError instanceof TypeError && apiError.message.includes('fetch')) {
          setMaintenanceConfig(prev => ({
            ...prev,
            isMaintenanceMode: true,
            message: 'Unable to connect to our servers. Please check your connection and try again.',
            progress: undefined
          }));
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check maintenance status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bypass maintenance mode with a key
  const bypassMaintenance = useCallback((key: string): boolean => {
    if (!maintenanceConfig.allowBypass) {
      return false;
    }

    if (key === maintenanceConfig.bypassKey) {
      setIsBypassed(true);
      localStorage.setItem('maintenance-bypass', JSON.stringify({
        key,
        timestamp: Date.now(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));
      return true;
    }

    return false;
  }, [maintenanceConfig.allowBypass, maintenanceConfig.bypassKey]);

  // Check for existing bypass on mount
  useEffect(() => {
    const existingBypass = localStorage.getItem('maintenance-bypass');
    if (existingBypass) {
      try {
        const bypass = JSON.parse(existingBypass);
        const now = Date.now();
        
        if (bypass.expires > now) {
          setIsBypassed(true);
        } else {
          // Expired bypass, remove it
          localStorage.removeItem('maintenance-bypass');
        }
      } catch (err) {
        // Invalid bypass data, remove it
        localStorage.removeItem('maintenance-bypass');
      }
    }
  }, []);

  // Check maintenance status on mount
  useEffect(() => {
    checkMaintenanceStatus();
  }, [checkMaintenanceStatus]);

  // Auto-refresh maintenance status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isBypassed) {
        checkMaintenanceStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [checkMaintenanceStatus, isBypassed]);

  return {
    maintenanceConfig,
    isLoading,
    error,
    checkMaintenanceStatus,
    bypassMaintenance,
    isBypassed
  };
};

// Utility functions for manual maintenance control
export const setMaintenanceMode = (config: Partial<MaintenanceConfig>) => {
  const fullConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    isMaintenanceMode: true,
    startTime: new Date().toISOString()
  };
  
  localStorage.setItem('maintenance-mode', JSON.stringify(fullConfig));
  
  // Trigger a page reload to apply maintenance mode
  window.location.reload();
};

export const clearMaintenanceMode = () => {
  localStorage.removeItem('maintenance-mode');
  localStorage.removeItem('maintenance-bypass');
  
  // Trigger a page reload to clear maintenance mode
  window.location.reload();
};

export default useMaintenanceMode;
