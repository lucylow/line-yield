import { useState, useEffect, useCallback } from 'react';
import { 
  nftCollateralService, 
  NFTCollateralPosition, 
  NFTCollection, 
  NFTOwnership,
  VaultStats,
  LiquidationParams,
  BorrowRequest,
  RepayRequest
} from '../services/nftCollateralService';

export interface UseNFTCollateralReturn {
  // State
  positions: NFTCollateralPosition[];
  collections: NFTCollection[];
  userNFTs: NFTOwnership[];
  vaultStats: VaultStats | null;
  liquidationParams: LiquidationParams | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUserPositions: (userAddress: string) => Promise<void>;
  loadCollections: () => Promise<void>;
  loadUserNFTs: (userAddress: string) => Promise<void>;
  loadVaultStats: () => Promise<void>;
  loadLiquidationParams: () => Promise<void>;
  getNFTValue: (nftContract: string, tokenId: string) => Promise<string>;
  calculateMaxBorrow: (nftContract: string, tokenId: string) => Promise<string>;
  checkLiquidationStatus: (positionId: string) => Promise<boolean>;
  mockBorrow: (request: BorrowRequest) => Promise<NFTCollateralPosition>;
  mockRepay: (request: RepayRequest) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
  
  // Utilities
  formatAmount: (amount: string, decimals?: number) => string;
  formatLTV: (ltv: number) => string;
  formatInterestRate: (rate: number) => string;
  calculateCollateralRatio: (collateralValue: string, totalDebt: string) => number;
  calculateTotalDebt: (loanAmount: string, interestAccrued: string) => string;
  isPositionHealthy: (collateralValue: string, totalDebt: string, liquidationThreshold: number) => boolean;
  getPositionStatus: (position: NFTCollateralPosition, liquidationThreshold: number) => 'healthy' | 'warning' | 'danger' | 'liquidated';
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const useNFTCollateral = (): UseNFTCollateralReturn => {
  const [positions, setPositions] = useState<NFTCollateralPosition[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [userNFTs, setUserNFTs] = useState<NFTOwnership[]>([]);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [liquidationParams, setLiquidationParams] = useState<LiquidationParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user's NFT collateral positions
   */
  const loadUserPositions = useCallback(async (userAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userPositions = await nftCollateralService.getUserPositions(userAddress);
      setPositions(userPositions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user positions';
      setError(errorMessage);
      console.error('Failed to load user positions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load supported NFT collections
   */
  const loadCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supportedCollections = await nftCollateralService.getSupportedCollections();
      setCollections(supportedCollections);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load collections';
      setError(errorMessage);
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load user's NFT ownership
   */
  const loadUserNFTs = useCallback(async (userAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const nfts = await nftCollateralService.getUserNFTs(userAddress);
      setUserNFTs(nfts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user NFTs';
      setError(errorMessage);
      console.error('Failed to load user NFTs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load vault statistics
   */
  const loadVaultStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stats = await nftCollateralService.getVaultStats();
      setVaultStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load vault stats';
      setError(errorMessage);
      console.error('Failed to load vault stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load liquidation parameters
   */
  const loadLiquidationParams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = await nftCollateralService.getLiquidationParameters();
      setLiquidationParams(params);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load liquidation params';
      setError(errorMessage);
      console.error('Failed to load liquidation params:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get NFT value from oracle
   */
  const getNFTValue = useCallback(async (nftContract: string, tokenId: string): Promise<string> => {
    try {
      return await nftCollateralService.getNFTValue(nftContract, tokenId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get NFT value';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Calculate maximum borrow amount
   */
  const calculateMaxBorrow = useCallback(async (nftContract: string, tokenId: string): Promise<string> => {
    try {
      return await nftCollateralService.calculateMaxBorrow(nftContract, tokenId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate max borrow';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Check liquidation status
   */
  const checkLiquidationStatus = useCallback(async (positionId: string): Promise<boolean> => {
    try {
      return await nftCollateralService.isPositionLiquidatable(positionId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check liquidation status';
      setError(errorMessage);
      return false;
    }
  }, []);

  /**
   * Mock borrow transaction
   */
  const mockBorrow = useCallback(async (request: BorrowRequest): Promise<NFTCollateralPosition> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const position = await nftCollateralService.mockBorrow(request);
      
      // Add to positions list
      setPositions(prev => [position, ...prev]);
      
      return position;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create borrow transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mock repay transaction
   */
  const mockRepay = useCallback(async (request: RepayRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await nftCollateralService.mockRepay(request);
      
      // Update position in list
      setPositions(prev => prev.map(pos => 
        pos.positionId === request.positionId 
          ? { ...pos, loanAmount: '0', interestAccrued: '0' }
          : pos
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process repay transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all data in parallel
      await Promise.all([
        loadCollections(),
        loadVaultStats(),
        loadLiquidationParams(),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      console.error('Failed to refresh data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadCollections, loadVaultStats, loadLiquidationParams]);

  // Utility functions
  const formatAmount = useCallback((amount: string, decimals?: number) => {
    return nftCollateralService.formatAmount(amount, decimals);
  }, []);

  const formatLTV = useCallback((ltv: number) => {
    return nftCollateralService.formatLTV(ltv);
  }, []);

  const formatInterestRate = useCallback((rate: number) => {
    return nftCollateralService.formatInterestRate(rate);
  }, []);

  const calculateCollateralRatio = useCallback((collateralValue: string, totalDebt: string) => {
    return nftCollateralService.calculateCollateralRatio(collateralValue, totalDebt);
  }, []);

  const calculateTotalDebt = useCallback((loanAmount: string, interestAccrued: string) => {
    return nftCollateralService.calculateTotalDebt(loanAmount, interestAccrued);
  }, []);

  const isPositionHealthy = useCallback((collateralValue: string, totalDebt: string, liquidationThreshold: number) => {
    return nftCollateralService.isPositionHealthy(collateralValue, totalDebt, liquidationThreshold);
  }, []);

  const getPositionStatus = useCallback((position: NFTCollateralPosition, liquidationThreshold: number) => {
    return nftCollateralService.getPositionStatus(position, liquidationThreshold);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    return nftCollateralService.getStatusColor(status);
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    return nftCollateralService.getStatusIcon(status);
  }, []);

  // Load initial data
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    // State
    positions,
    collections,
    userNFTs,
    vaultStats,
    liquidationParams,
    isLoading,
    error,
    
    // Actions
    loadUserPositions,
    loadCollections,
    loadUserNFTs,
    loadVaultStats,
    loadLiquidationParams,
    getNFTValue,
    calculateMaxBorrow,
    checkLiquidationStatus,
    mockBorrow,
    mockRepay,
    clearError,
    refresh,
    
    // Utilities
    formatAmount,
    formatLTV,
    formatInterestRate,
    calculateCollateralRatio,
    calculateTotalDebt,
    isPositionHealthy,
    getPositionStatus,
    getStatusColor,
    getStatusIcon,
  };
};

