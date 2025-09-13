import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useKaiaWallet, KAIANETWORKS } from '@/hooks/useKaiaWallet';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  LogOut,
  Zap,
  DollarSign,
  TrendingUp,
  Network,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface KaiaWalletConnectionProps {
  className?: string;
  showDetails?: boolean;
}

export const KaiaWalletConnection: React.FC<KaiaWalletConnectionProps> = ({
  className = '',
  showDetails = true
}) => {
  const {
    isConnected,
    account,
    kaiaBalance,
    usdtBalance,
    isLoading,
    error,
    network,
    connectWallet,
    disconnectWallet,
    refreshBalances,
    switchNetwork
  } = useKaiaWallet();

  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  const handleRefresh = async () => {
    await refreshBalances();
  };

  const handleSwitchNetwork = async (targetNetwork: 'testnet' | 'mainnet') => {
    setIsSwitchingNetwork(true);
    try {
      await switchNetwork(targetNetwork);
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
    }
  };

  const openExplorer = () => {
    if (account && network) {
      const explorerUrl = `${network.blockExplorerUrls[0]}/account/${account}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const formatBalance = (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  };

  if (!isConnected) {
    return (
      <Card className={`shadow-lg ${className}`}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Connect Kaia Wallet</CardTitle>
          <p className="text-gray-600">
            Connect your Kaia wallet to start earning yield on your USDT
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Kaia Wallet
              </>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have Kaia Wallet?{' '}
              <a
                href="https://chrome.google.com/webstore/detail/kaia-wallet/kaia-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Install it here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Wallet Connected</CardTitle>
              <p className="text-sm text-gray-500">
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'No account'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="p-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openExplorer}
              className="p-2"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Network</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {network?.chainName || 'Unknown'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSwitchNetwork(network === KAIANETWORKS.MAINNET ? 'testnet' : 'mainnet')}
              disabled={isSwitchingNetwork}
              className="text-xs"
            >
              {isSwitchingNetwork ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                'Switch'
              )}
            </Button>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">KAIA</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {formatBalance(kaiaBalance)}
            </div>
            <div className="text-xs text-blue-700">
              Native Token
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">USDT</span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {formatBalance(usdtBalance, 2)}
            </div>
            <div className="text-xs text-green-700">
              Stablecoin
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh Balances
            </>
          )}
        </Button>

        {/* Detailed Info */}
        {showDetails && (
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account:</span>
                <span className="font-mono text-xs">{account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chain ID:</span>
                <span className="font-mono text-xs">{network?.chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">RPC URL:</span>
                <span className="font-mono text-xs truncate max-w-32">
                  {network?.rpcUrls[0]}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KaiaWalletConnection;
