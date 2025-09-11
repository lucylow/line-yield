export interface VaultData {
  totalAssets: string;
  userShares: string;
  userAssets: string;
  apy: number;
  earnedYield: string;
  strategies: StrategyAllocation[];
}

export interface StrategyAllocation {
  name: string;
  allocation: number;
  apy: number;
  tvl: string;
}

export interface Transaction {
  hash: string;
  type: 'deposit' | 'withdraw' | 'claim';
  amount: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}