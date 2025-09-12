import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebProvider } from './providers/WebProvider';
import { Layout } from '@shared/components';
import Dashboard from './components/Dashboard';

const queryClient = new QueryClient();

// Main Dashboard component is now in ./components/Dashboard.tsx

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WebProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </WebProvider>
    </QueryClientProvider>
  );
};

export default App;
