import React from 'react';
import { TokenManagementPanel } from '@/components/TokenManagementPanel';
import { KaiaWalletConnection } from '@/components/KaiaWalletConnection';
import { useKaiaWallet } from '@/hooks/useKaiaWallet';

export const TokenManagementPage: React.FC = () => {
  const { isConnected } = useKaiaWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <KaiaWalletConnection showDetails={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TokenManagementPanel />
      </div>
    </div>
  );
};

export default TokenManagementPage;



