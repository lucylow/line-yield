import React from 'react';
import { MainNavigation } from './MainNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showNavigation = true 
}) => {
  if (!showNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MainNavigation />
      <main className="flex-1 lg:ml-0">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};
