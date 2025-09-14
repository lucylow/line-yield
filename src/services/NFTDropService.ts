import axios, { AxiosInstance } from 'axios';

/**
 * NFT Drop Service
 * Handles frontend communication with NFT drop management APIs
 */
export class NFTDropService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Deploy NFT Collection
   * @param collectionData Collection configuration
   * @returns Deployment result
   */
  async deployCollection(collectionData: {
    name: string;
    symbol: string;
    baseURI: string;
    maxSupply: number;
    mintPrice: string;
    royaltyFee: number;
    owner: string;
  }): Promise<{
    success: boolean;
    contractAddress?: string;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/nft/deploy-collection', collectionData);
      
      return {
        success: true,
        contractAddress: response.data.data.contractAddress,
        transactionHash: response.data.data.transactionHash
      };
    } catch (error: any) {
      console.error('Collection deployment error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Deployment failed'
      };
    }
  }

  /**
   * Deploy NFT Marketplace
   * @param marketplaceData Marketplace configuration
   * @returns Deployment result
   */
  async deployMarketplace(marketplaceData: {
    name: string;
    feeRecipient: string;
    platformFee: number;
    royaltyFee: number;
  }): Promise<{
    success: boolean;
    contractAddress?: string;
    transactionHash?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/nft/deploy-marketplace', marketplaceData);
      
      return {
        success: true,
        contractAddress: response.data.data.contractAddress,
        transactionHash: response.data.data.transactionHash
      };
    } catch (error: any) {
      console.error('Marketplace deployment error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Marketplace deployment failed'
      };
    }
  }

  /**
   * Create NFT Drop Campaign
   * @param dropData Drop configuration
   * @returns Drop creation result
   */
  async createDrop(dropData: {
    collectionId: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    whitelistRequired: boolean;
    airdropAmount: number;
    presalePrice: string;
    publicPrice: string;
    stages: {
      airdrop: { startTime: string; endTime: string; };
      presale: { startTime: string; endTime: string; };
      public: { startTime: string; endTime: string; };
    };
  }): Promise<{
    success: boolean;
    dropId?: string;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/nft/create-drop', dropData);
      
      return {
        success: true,
        dropId: response.data.data.dropId
      };
    } catch (error: any) {
      console.error('Drop creation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Drop creation failed'
      };
    }
  }

  /**
   * Execute Airdrop
   * @param dropId Drop ID
   * @param recipients Airdrop recipients
   * @returns Airdrop execution result
   */
  async executeAirdrop(dropId: string, recipients: {
    address: string;
    amount: number;
    tier?: number;
  }[]): Promise<{
    success: boolean;
    airdropId?: string;
    transactionHashes?: string[];
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/nft/execute-airdrop', {
        dropId,
        recipients
      });
      
      return {
        success: true,
        airdropId: response.data.data.airdropId,
        transactionHashes: response.data.data.transactionHashes
      };
    } catch (error: any) {
      console.error('Airdrop execution error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Airdrop execution failed'
      };
    }
  }

  /**
   * Start Presale Stage
   * @param dropId Drop ID
   * @param whitelist Whitelist addresses
   * @returns Presale start result
   */
  async startPresale(dropId: string, whitelist: string[] = []): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/nft/start-presale', {
        dropId,
        whitelist
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Presale start error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Presale start failed'
      };
    }
  }

  /**
   * Start Public Sale Stage
   * @param dropId Drop ID
   * @returns Public sale start result
   */
  async startPublicSale(dropId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post('/nft/start-public-sale', {
        dropId
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Public sale start error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Public sale start failed'
      };
    }
  }

  /**
   * Get Notable Collections
   * @returns Notable collections
   */
  async getNotableCollections(): Promise<{
    success: boolean;
    collections?: any[];
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get('/nft/notable-collections');
      
      return {
        success: true,
        collections: response.data.data
      };
    } catch (error: any) {
      console.error('Notable collections fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch notable collections'
      };
    }
  }

  /**
   * Get All Collections
   * @param params Query parameters
   * @returns Collections list
   */
  async getCollections(params: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
  } = {}): Promise<{
    success: boolean;
    collections?: any[];
    pagination?: any;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get('/nft/collections', { params });
      
      return {
        success: true,
        collections: response.data.data.collections,
        pagination: response.data.data.pagination
      };
    } catch (error: any) {
      console.error('Collections fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch collections'
      };
    }
  }

  /**
   * Get Drop Campaigns
   * @param params Query parameters
   * @returns Drop campaigns list
   */
  async getDrops(params: {
    status?: string;
    stage?: string;
    featured?: boolean;
  } = {}): Promise<{
    success: boolean;
    drops?: any[];
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get('/nft/drops', { params });
      
      return {
        success: true,
        drops: response.data.data
      };
    } catch (error: any) {
      console.error('Drops fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch drops'
      };
    }
  }

  /**
   * Get Drop Details
   * @param dropId Drop ID
   * @returns Drop details
   */
  async getDropDetails(dropId: string): Promise<{
    success: boolean;
    drop?: any;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/nft/drops/${dropId}`);
      
      return {
        success: true,
        drop: response.data.data
      };
    } catch (error: any) {
      console.error('Drop details fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch drop details'
      };
    }
  }

  /**
   * Get Drop Stages
   * @param dropId Drop ID
   * @returns Drop stages
   */
  async getDropStages(dropId: string): Promise<{
    success: boolean;
    stages?: any[];
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/nft/drops/${dropId}/stages`);
      
      return {
        success: true,
        stages: response.data.data
      };
    } catch (error: any) {
      console.error('Drop stages fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch drop stages'
      };
    }
  }

  /**
   * Get Drop Whitelist
   * @param dropId Drop ID
   * @returns Whitelist entries
   */
  async getDropWhitelist(dropId: string): Promise<{
    success: boolean;
    whitelist?: any[];
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/nft/drops/${dropId}/whitelist`);
      
      return {
        success: true,
        whitelist: response.data.data
      };
    } catch (error: any) {
      console.error('Drop whitelist fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch drop whitelist'
      };
    }
  }

  /**
   * Get Drop Airdrop Recipients
   * @param dropId Drop ID
   * @returns Airdrop recipients
   */
  async getDropAirdropRecipients(dropId: string): Promise<{
    success: boolean;
    recipients?: any[];
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/nft/drops/${dropId}/airdrop`);
      
      return {
        success: true,
        recipients: response.data.data
      };
    } catch (error: any) {
      console.error('Drop airdrop recipients fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch airdrop recipients'
      };
    }
  }

  /**
   * Get Drop Analytics
   * @param dropId Drop ID
   * @returns Drop analytics
   */
  async getDropAnalytics(dropId: string): Promise<{
    success: boolean;
    analytics?: any;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/nft/drops/${dropId}/analytics`);
      
      return {
        success: true,
        analytics: response.data.data
      };
    } catch (error: any) {
      console.error('Drop analytics fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch drop analytics'
      };
    }
  }

  /**
   * Add to Whitelist
   * @param dropId Drop ID
   * @param address User address
   * @param maxMints Maximum mints allowed
   * @returns Whitelist addition result
   */
  async addToWhitelist(dropId: string, address: string, maxMints: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post(`/nft/drops/${dropId}/whitelist`, {
        address,
        maxMints
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Whitelist addition error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to add to whitelist'
      };
    }
  }

  /**
   * Batch Add to Whitelist
   * @param dropId Drop ID
   * @param entries Whitelist entries
   * @returns Batch whitelist addition result
   */
  async batchAddToWhitelist(dropId: string, entries: {
    address: string;
    maxMints: number;
  }[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post(`/nft/drops/${dropId}/whitelist/batch`, {
        entries
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Batch whitelist addition error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to batch add to whitelist'
      };
    }
  }

  /**
   * Remove from Whitelist
   * @param dropId Drop ID
   * @param address User address
   * @returns Whitelist removal result
   */
  async removeFromWhitelist(dropId: string, address: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.delete(`/nft/drops/${dropId}/whitelist/${address}`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Whitelist removal error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to remove from whitelist'
      };
    }
  }

  /**
   * Update Drop Status
   * @param dropId Drop ID
   * @param status New status
   * @returns Status update result
   */
  async updateDropStatus(dropId: string, status: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.patch(`/nft/drops/${dropId}/status`, {
        status
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Drop status update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update drop status'
      };
    }
  }

  /**
   * Cancel Drop Campaign
   * @param dropId Drop ID
   * @returns Drop cancellation result
   */
  async cancelDrop(dropId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await this.apiClient.post(`/nft/drops/${dropId}/cancel`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Drop cancellation error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to cancel drop'
      };
    }
  }
}

export default NFTDropService;
