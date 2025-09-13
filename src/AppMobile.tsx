import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LocalizationProvider } from '../../packages/shared/src/contexts/LocalizationContext';

// Mobile-specific pages
import MobileLanding from './pages/MobileLanding';
import MobileDashboard from './pages/MobileDashboard';
import MobileGamification from './pages/MobileGamification';

// Shared components
import { usePreventGoBack } from '@shared/hooks';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  // Prevent accidental navigation on mobile
  usePreventGoBack();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Mobile Landing Page */}
          <Route path="/" element={<MobileLanding />} />
          
          {/* Mobile Dashboard */}
          <Route path="/dashboard" element={<MobileDashboard />} />
          
          {/* Mobile Gamification */}
          <Route path="/gamification" element={<MobileGamification />} />
          
          {/* Redirect any other routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const AppMobile: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default AppMobile;
