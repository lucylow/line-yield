export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: string;
  provider: any;
}

export interface WalletConnectOptions {
  chainId?: number;
  rpcUrl?: string;
}