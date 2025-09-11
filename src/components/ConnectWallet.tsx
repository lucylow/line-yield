import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '@/components/ui/button';
import { KLAYTN_TESTNET } from '../utils/constants';
import { Wallet, Copy, ExternalLink } from 'lucide-react';
import { truncateAddress } from '../utils/formatters';
import { useToast } from '@/hooks/use-toast';

export const ConnectWallet: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet({ chainId: KLAYTN_TESTNET.chainId });
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Kaia testnet",
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Please make sure you have a compatible wallet installed",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (wallet.isConnected) {
    return (
      <div className="bg-card rounded-xl p-4 shadow-card border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yield rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yield-foreground" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">Connected</p>
              <p className="text-sm text-muted-foreground">
                {truncateAddress(wallet.address || '', 6, 4)}
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
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-medium">{wallet.balance} KLAY</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium">Kaia Testnet</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-8 shadow-lg border text-center hover:shadow-xl transition-all duration-500">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-primary">
          <Wallet className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yield rounded-full flex items-center justify-center shadow-yield">
          <div className="w-2 h-2 bg-yield-foreground rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold mb-4 tracking-tight">Connect Your Wallet</h3>
      <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
        Connect your Kaia-compatible wallet to start earning yield on USDT with our automated strategies
      </p>
      
      <Button 
        onClick={handleConnect} 
        size="lg"
        className="w-full h-14 text-lg font-semibold shadow-primary hover:shadow-lg transition-all duration-300 hover:scale-105"
        variant="hero"
      >
        <Wallet className="w-6 h-6 mr-3" />
        Connect Wallet
      </Button>
      
      <div className="mt-6 p-4 bg-secondary/50 rounded-2xl">
        <p className="text-sm text-muted-foreground font-medium">
          ✅ Supports MetaMask, WalletConnect & other Web3 wallets<br/>
          ⚡ Gas-free transactions with sponsored fees
        </p>
      </div>
    </div>
  );
};