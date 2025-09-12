import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { usePlatform } from '../hooks/usePlatform';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showHeader = true, 
  showFooter = true 
}) => {
  const { isLiff } = usePlatform();

  return (
    <div className={`min-h-screen bg-gray-50 ${isLiff ? 'pb-safe' : ''}`}>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && !isLiff && <Footer />}
    </div>
  );
};
