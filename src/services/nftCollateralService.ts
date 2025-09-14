import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface NFTCollateralPosition {
  positionId: string;
  owner: string;
  nftContract: string;
  tokenId: string;
  collateralValue: string;
  loanAmount: string;
  interestAccrued: string;
  lastInterestUpdate: number;
  createdAt: number;
  active: boolean;
  liquidated: boolean;
}

export interface NFTCollection {
  contractAddress: string;
  supported: boolean;
  maxLTV: number;
  liquidationThreshold: number;
  interestRate: number;
  active: boolean;
}

export interface NFTOwnership {
  contractAddress: string;
  tokenId: string;
  name?: string;
  image?: string;
  metadata?: any;
}

export interface BorrowRequest {
  nftContract: string;
  tokenId: string;
  borrowAmount: string;
  userAddress: string;
}

export interface RepayRequest {
  positionId: string;
  repayAmount: string;
  userAddress: string;
}

export interface LiquidationRequest {
  positionId: string;
  liquidatorAddress: string;
}

export interface VaultStats {
  totalCollateralValue: string;
  totalLoanAmount: string;
  totalInterestAccrued: string;
  vaultLiquidity: string;
}

export interface LiquidationParams {
  liquidationBonusBps: number;
  maxLiquidationRatio: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class NFTCollateralService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/nft`;
  }

  /**
   * Get user's NFT collateral positions
   */
  async getUserPositions(userAddress: string): Promise<NFTCollateralPosition[]> {
    try {
      const response = await axios.get<ApiResponse<NFTCollateralPosition[]>>(
        `${this.baseURL}/positions/${userAddress}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get user positions');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get specific position details
   */
  async getPosition(positionId: string): Promise<NFTCollateralPosition | null> {
    try {
      const response = await axios.get<ApiResponse<NFTCollateralPosition>>(
        `${this.baseURL}/position/${positionId}`
      );

      if (!response.data.success) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(response.data.error || 'Failed to get position');
      }

      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get supported NFT collections
   */
  async getSupportedCollections(): Promise<NFTCollection[]> {
    try {
      const response = await axios.get<ApiResponse<NFTCollection[]>>(
        `${this.baseURL}/collections`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get supported collections');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get user's NFT ownership
   */
  async getUserNFTs(userAddress: string): Promise<NFTOwnership[]> {
    try {
      const response = await axios.get<ApiResponse<NFTOwnership[]>>(
        `${this.baseURL}/ownership/${userAddress}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get user NFTs');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get NFT value from oracle
   */
  async getNFTValue(nftContract: string, tokenId: string): Promise<string> {
    try {
      const response = await axios.get<ApiResponse<{ value: string }>>(
        `${this.baseURL}/value/${nftContract}/${tokenId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get NFT value');
      }

      return response.data.data.value;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Calculate maximum borrow amount for NFT
   */
  async calculateMaxBorrow(nftContract: string, tokenId: string): Promise<string> {
    try {
      const response = await axios.get<ApiResponse<{ maxBorrow: string }>>(
        `${this.baseURL}/max-borrow/${nftContract}/${tokenId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to calculate max borrow');
      }

      return response.data.data.maxBorrow;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Check if position is liquidatable
   */
  async isPositionLiquidatable(positionId: string): Promise<boolean> {
    try {
      const response = await axios.get<ApiResponse<{ liquidatable: boolean }>>(
        `${this.baseURL}/liquidatable/${positionId}`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to check liquidation status');
      }

      return response.data.data.liquidatable;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get vault statistics
   */
  async getVaultStats(): Promise<VaultStats> {
    try {
      const response = await axios.get<ApiResponse<VaultStats>>(
        `${this.baseURL}/vault-stats`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get vault stats');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Get liquidation parameters
   */
  async getLiquidationParameters(): Promise<LiquidationParams> {
    try {
      const response = await axios.get<ApiResponse<LiquidationParams>>(
        `${this.baseURL}/liquidation-params`
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get liquidation parameters');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Calculate liquidation amount
   */
  async calculateLiquidationAmount(collateralValue: string, totalDebt: string): Promise<string> {
    try {
      const response = await axios.post<ApiResponse<{ liquidationAmount: string }>>(
        `${this.baseURL}/calculate-liquidation`,
        { collateralValue, totalDebt }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to calculate liquidation amount');
      }

      return response.data.data.liquidationAmount;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Mock borrow transaction (for testing)
   */
  async mockBorrow(request: BorrowRequest): Promise<NFTCollateralPosition> {
    try {
      const response = await axios.post<ApiResponse<NFTCollateralPosition>>(
        `${this.baseURL}/mock-borrow`,
        request
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to create mock borrow');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Mock repay transaction (for testing)
   */
  async mockRepay(request: RepayRequest): Promise<{ positionId: string; repayAmount: string; repaidAt: number }> {
    try {
      const response = await axios.post<ApiResponse<{ positionId: string; repayAmount: string; repaidAt: number }>>(
        `${this.baseURL}/mock-repay`,
        request
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to process mock repay');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  /**
   * Utility functions
   */
  formatAmount(amount: string, decimals: number = 6): string {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  }

  formatLTV(ltv: number): string {
    return `${(ltv / 100).toFixed(1)}%`;
  }

  formatInterestRate(rate: number): string {
    return `${(rate / 100).toFixed(2)}%`;
  }

  calculateCollateralRatio(collateralValue: string, totalDebt: string): number {
    const collateral = parseFloat(collateralValue);
    const debt = parseFloat(totalDebt);
    
    if (debt === 0) return 0;
    
    return (collateral / debt) * 100;
  }

  calculateTotalDebt(loanAmount: string, interestAccrued: string): string {
    const loan = parseFloat(loanAmount);
    const interest = parseFloat(interestAccrued);
    
    return (loan + interest).toString();
  }

  isPositionHealthy(collateralValue: string, totalDebt: string, liquidationThreshold: number): boolean {
    const ratio = this.calculateCollateralRatio(collateralValue, totalDebt);
    return ratio >= liquidationThreshold;
  }

  getPositionStatus(position: NFTCollateralPosition, liquidationThreshold: number): 'healthy' | 'warning' | 'danger' | 'liquidated' {
    if (position.liquidated) return 'liquidated';
    
    const totalDebt = this.calculateTotalDebt(position.loanAmount, position.interestAccrued);
    const ratio = this.calculateCollateralRatio(position.collateralValue, totalDebt);
    
    if (ratio >= liquidationThreshold) return 'healthy';
    if (ratio >= liquidationThreshold * 0.9) return 'warning';
    return 'danger';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'danger':
        return 'text-red-600 bg-red-100';
      case 'liquidated':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      case 'liquidated':
        return '💀';
      default:
        return '❓';
    }
  }
}

// Export singleton instance
export const nftCollateralService = new NFTCollateralService();
export default nftCollateralService;

