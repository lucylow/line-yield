# Maintenance System Documentation

This document describes the maintenance system implementation for the LINE Yield dApp, including how to enable/disable maintenance mode and handle errors gracefully.

## Overview

The maintenance system provides:
- **Maintenance Mode**: Show a user-friendly maintenance screen when the app is down
- **Error Boundary**: Catch and handle application errors gracefully
- **Developer Tools**: Easy utilities to enable/disable maintenance mode
- **Progress Tracking**: Real-time maintenance progress updates
- **Bypass Functionality**: Allow developers to bypass maintenance mode

## Components

### 1. MaintenanceScreen Component

A beautiful, responsive maintenance screen that displays:
- Maintenance status and progress
- Estimated duration
- Features being updated
- Social media links
- Contact information
- Retry functionality

**Location**: `src/components/MaintenanceScreen.tsx`

### 2. ErrorBoundary Component

Catches JavaScript errors anywhere in the component tree and displays a fallback UI:
- Error details (in development mode)
- Error ID for support tracking
- Retry functionality
- Support contact information

**Location**: `src/components/ErrorBoundary.tsx`

### 3. AppWrapper Component

Wraps the entire application to handle:
- Maintenance mode detection
- Error boundary integration
- Automatic maintenance status checking

**Location**: `src/components/AppWrapper.tsx`

## Hooks

### useMaintenanceMode Hook

Manages maintenance mode state and provides utilities:

```typescript
const {
  maintenanceConfig,
  isLoading,
  error,
  checkMaintenanceStatus,
  bypassMaintenance,
  isBypassed
} = useMaintenanceMode();
```

**Location**: `src/hooks/useMaintenanceMode.ts`

## Configuration Methods

### 1. Environment Variable

Set `REACT_APP_MAINTENANCE_MODE=true` in your `.env` file:

```bash
REACT_APP_MAINTENANCE_MODE=true
```

### 2. Local Storage

The system checks for maintenance configuration in localStorage:

```javascript
localStorage.setItem('maintenance-mode', JSON.stringify({
  isMaintenanceMode: true,
  message: 'Custom maintenance message',
  estimatedDuration: '2 hours',
  progress: 50
}));
```

### 3. API Endpoint

The system checks `/api/maintenance-status` for maintenance configuration.

### 4. Developer Utilities

Use the maintenance utilities for easy control:

```javascript
import { maintenanceUtils } from '@/utils/maintenanceUtils';

// Enable scheduled maintenance
maintenanceUtils.enableScheduledMaintenance();

// Enable emergency maintenance
maintenanceUtils.enableEmergencyMaintenance();

// Update progress
maintenanceUtils.updateProgress(75);

// Disable maintenance
maintenanceUtils.disableMaintenance();
```

## Predefined Configurations

### Scheduled Maintenance
- Duration: 2-4 hours
- Features: Security updates, performance improvements
- Bypass: Allowed

### Emergency Maintenance
- Duration: 1-2 hours
- Features: Critical fixes, security updates
- Bypass: Not allowed

### Upgrade Maintenance
- Duration: 4-6 hours
- Features: New features, major improvements
- Bypass: Allowed

### API Maintenance
- Duration: 30 minutes
- Features: API optimization
- Bypass: Allowed

## Usage Examples

### Enable Maintenance Mode

```javascript
// Using utilities
maintenanceUtils.enableScheduledMaintenance({
  message: 'Custom maintenance message',
  progress: 25
});

// Direct configuration
setMaintenanceMode({
  isMaintenanceMode: true,
  message: 'We are upgrading our systems',
  estimatedDuration: '3 hours',
  progress: 0,
  features: ['New features', 'Performance improvements']
});
```

### Update Progress

```javascript
maintenanceUtils.updateProgress(50); // 50% complete
```

### Disable Maintenance Mode

```javascript
maintenanceUtils.disableMaintenance();
```

### Bypass Maintenance (Development)

```javascript
// In browser console
maintenanceUtils.bypassMaintenance('dev-bypass-2024');
```

## Routes

- `/maintenance` - Direct access to maintenance page
- All other routes automatically show maintenance screen when maintenance mode is active

## Error Handling

The ErrorBoundary component:
- Catches JavaScript errors in React components
- Displays user-friendly error messages
- Provides error IDs for support tracking
- Offers retry and navigation options
- Logs errors to console in development mode

## Browser Console Commands (Development)

In development mode, you can use these commands in the browser console:

```javascript
// Enable maintenance
maintenanceUtils.enableScheduledMaintenance();

// Check status
maintenanceUtils.isMaintenanceActive();

// Get current config
maintenanceUtils.getCurrentConfig();

// Update progress
maintenanceUtils.updateProgress(75);

// Disable maintenance
maintenanceUtils.disableMaintenance();
```

## Styling

The maintenance screen uses:
- Gradient backgrounds
- Glassmorphism effects
- Responsive design
- Tailwind CSS classes
- Lucide React icons

## Integration

The maintenance system is automatically integrated into the app through:

1. **AppWrapper** wraps the entire application
2. **ErrorBoundary** catches all errors
3. **useMaintenanceMode** hook manages state
4. **MaintenanceScreen** displays when needed

## Best Practices

1. **Always test** maintenance mode before deploying
2. **Set realistic** estimated durations
3. **Provide clear** messages to users
4. **Update progress** regularly during maintenance
5. **Use bypass** functionality for testing
6. **Monitor errors** in production
7. **Keep contact** information updated

## Troubleshooting

### Maintenance Mode Not Showing
- Check environment variables
- Verify localStorage configuration
- Ensure API endpoint is accessible

### Errors Not Caught
- Verify ErrorBoundary is wrapping components
- Check error boundaries are not nested incorrectly
- Ensure errors are thrown in React components

### Bypass Not Working
- Verify bypass key is correct
- Check if bypass is allowed in configuration
- Ensure localStorage is accessible

## Security Considerations

- Bypass keys should be kept secure
- Maintenance mode should not expose sensitive information
- Error details should be hidden in production
- API endpoints should be properly secured
