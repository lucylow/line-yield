import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Index";
import LineYieldApp from "./pages/LineYieldApp";
import LineMiniDapp from "./pages/LineMiniDapp";
import WebMiniDapp from "./pages/WebMiniDapp";
import MiniDappDemo from "./pages/MiniDappDemo";
import SecurityAudit from "./pages/SecurityAudit";
import KaiaLineMiniDapp from "./pages/KaiaLineMiniDapp";
import TokenManagementPage from "./pages/TokenManagementPage";
import MultilingualDemoPage from "./pages/MultilingualDemoPage";
import NotFound from "./pages/NotFound";
// Mobile-specific pages
import MobileLanding from "./pages/MobileLanding";
import MobileDashboard from "./pages/MobileDashboard";
import MobileGamification from "./pages/MobileGamification";
import { LiffProvider } from "./hooks/useLiff";
import { useAnalytics } from "./hooks/useAnalytics";
import { useGlobalErrorHandler } from "./hooks/useErrorHandler";
import { useMobile } from "./hooks/useMobile";
import { LocalizationProvider } from "@shared/contexts";
import { usePreventGoBack } from "@shared/hooks";
import { AppWrapper } from "./components/AppWrapper";
// New components
import { DAOGovernancePanel } from "./components/governance/DAOGovernancePanel";
import { StablecoinSwapPanel } from "./components/swap/StablecoinSwapPanel";
import "./styles/mobile.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { trackPageView } = useAnalytics();
  const { handleGlobalError, handleUnhandledRejection } = useGlobalErrorHandler();
  const { isMobile } = useMobile();

  // Prevent accidental navigation on mobile
  usePreventGoBack();

  // Track page views
  React.useEffect(() => {
    trackPageView(window.location.pathname);
  }, [trackPageView]);

  // Set up global error handlers
  React.useEffect(() => {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleGlobalError, handleUnhandledRejection]);

  // Mobile-specific routes
  if (isMobile) {
    return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MobileLanding />} />
            <Route path="/dashboard" element={<MobileDashboard />} />
            <Route path="/gamification" element={<MobileGamification />} />
            <Route path="/line-mini-dapp" element={
              <LiffProvider>
                <LineMiniDapp />
              </LiffProvider>
            } />
            <Route path="/kaia-mini-dapp" element={<KaiaLineMiniDapp />} />
            <Route path="/token-management" element={<TokenManagementPage />} />
            <Route path="/multilingual-demo" element={<MultilingualDemoPage />} />
            {/* Redirect other routes to mobile landing */}
            <Route path="*" element={<MobileLanding />} />
          </Routes>
        </BrowserRouter>
        <PerformanceMonitor />
      </>
    );
  }

  // Desktop routes
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Dashboard />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/line-yield" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <LineYieldApp />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/line-mini-dapp" element={
            <LiffProvider>
              <LineMiniDapp />
            </LiffProvider>
          } />
          <Route path="/web-mini-dapp" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <WebMiniDapp />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/mini-dapp-demo" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <MiniDappDemo />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/security" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <SecurityAudit />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/kaia-mini-dapp" element={<KaiaLineMiniDapp />} />
          <Route path="/token-management" element={<TokenManagementPage />} />
          <Route path="/multilingual-demo" element={<MultilingualDemoPage />} />
          <Route path="/governance" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8">
                <DAOGovernancePanel 
                  governanceTokenBalance={15000}
                  userAddress="0x1234...5678"
                />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/swap" element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8">
                <StablecoinSwapPanel 
                  walletBalance={1000}
                  userAddress="0x1234...5678"
                />
              </main>
              <Footer />
            </div>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <PerformanceMonitor />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppWrapper>
          <AppContent />
        </AppWrapper>
      </TooltipProvider>
    </LocalizationProvider>
  </QueryClientProvider>
);

export default App;