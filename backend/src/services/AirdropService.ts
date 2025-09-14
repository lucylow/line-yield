import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.serviceRoleKey);

export interface DropStage {
  id: number;
  name: string;
  description: string;
  maxSupply: number;
  mintedCount: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  baseURI: string;
  maxMintsPerUser: number;
  createdAt: string;
  updatedAt: string;
}

export interface AirdropRecipient {
  walletAddress: string;
  tokenId?: number;
  tokenURI: string;
  minted: boolean;
  txHash?: string;
  mintedAt?: string;
}

export interface AirdropBatch {
  id: string;
  stageId: number;
  recipients: AirdropRecipient[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface MintSignature {
  recipient: string;
  stageId: number;
  tokenId: number;
  tokenURI: string;
  nonce: number;
  deadline: number;
  signature: string;
}

export class AirdropService {
  private static instance: AirdropService;
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
    
    // Initialize contract (you'll need to deploy and get the address)
    const contractAddress = CONFIG.contracts.yieldPointsNFTAddress || '0x0000000000000000000000000000000000000000';
    const contractABI = this.getContractABI();
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
  }

  public static getInstance(): AirdropService {
    if (!AirdropService.instance) {
      AirdropService.instance = new AirdropService();
    }
    return AirdropService.instance;
  }

  /**
   * Create a new drop stage
   */
  async createDropStage(stageData: Omit<DropStage, 'id' | 'mintedCount' | 'createdAt' | 'updatedAt'>): Promise<DropStage> {
    try {
      // Create stage in database
      const { data, error } = await supabase
        .from('drop_stages')
        .insert([{
          name: stageData.name,
          description: stageData.description,
          max_supply: stageData.maxSupply,
          start_time: new Date(stageData.startTime).toISOString(),
          end_time: new Date(stageData.endTime).toISOString(),
          is_active: stageData.isActive,
          base_uri: stageData.baseURI,
          max_mints_per_user: stageData.maxMintsPerUser,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Create stage on blockchain
      const tx = await this.contract.createDropStage(
        stageData.name,
        stageData.description,
        stageData.maxSupply,
        stageData.startTime,
        stageData.endTime,
        stageData.baseURI,
        stageData.maxMintsPerUser
      );

      await tx.wait();

      Logger.info(`Drop stage created: ${data.id} - ${stageData.name}`);
      return this.mapDatabaseToDropStage(data);
    } catch (error) {
      Logger.error('Error creating drop stage:', error);
      throw new Error('Failed to create drop stage');
    }
  }

  /**
   * Update drop stage status
   */
  async updateDropStage(stageId: number, isActive: boolean): Promise<void> {
    try {
      // Update in database
      const { error: dbError } = await supabase
        .from('drop_stages')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', stageId);

      if (dbError) throw dbError;

      // Update on blockchain
      const tx = await this.contract.updateDropStage(stageId, isActive);
      await tx.wait();

      Logger.info(`Drop stage updated: ${stageId} - Active: ${isActive}`);
    } catch (error) {
      Logger.error('Error updating drop stage:', error);
      throw new Error('Failed to update drop stage');
    }
  }

  /**
   * Add recipients to whitelist
   */
  async updateWhitelist(stageId: number, recipients: string[], isWhitelisted: boolean): Promise<void> {
    try {
      // Update in database
      const whitelistData = recipients.map(address => ({
        stage_id: stageId,
        wallet_address: address,
        is_whitelisted: isWhitelisted,
        created_at: new Date().toISOString()
      }));

      const { error: dbError } = await supabase
        .from('drop_whitelist')
        .upsert(whitelistData, { 
          onConflict: 'stage_id,wallet_address',
          ignoreDuplicates: false 
        });

      if (dbError) throw dbError;

      // Update on blockchain
      const tx = await this.contract.updateWhitelist(stageId, recipients, Array(recipients.length).fill(isWhitelisted));
      await tx.wait();

      Logger.info(`Whitelist updated for stage ${stageId}: ${recipients.length} recipients`);
    } catch (error) {
      Logger.error('Error updating whitelist:', error);
      throw new Error('Failed to update whitelist');
    }
  }

  /**
   * Create airdrop batch
   */
  async createAirdropBatch(stageId: number, recipients: AirdropRecipient[]): Promise<AirdropBatch> {
    try {
      const batchId = `airdrop_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      
      // Store batch in database
      const { data, error } = await supabase
        .from('airdrop_batches')
        .insert([{
          id: batchId,
          stage_id: stageId,
          recipients: recipients,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      Logger.info(`Airdrop batch created: ${batchId} with ${recipients.length} recipients`);
      return this.mapDatabaseToAirdropBatch(data);
    } catch (error) {
      Logger.error('Error creating airdrop batch:', error);
      throw new Error('Failed to create airdrop batch');
    }
  }

  /**
   * Process airdrop batch (mint NFTs)
   */
  async processAirdropBatch(batchId: string): Promise<void> {
    try {
      // Get batch from database
      const { data: batch, error: fetchError } = await supabase
        .from('airdrop_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (fetchError) throw fetchError;
      if (!batch) throw new Error('Batch not found');

      // Update status to processing
      await supabase
        .from('airdrop_batches')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId);

      // Extract addresses and URIs for batch minting
      const recipients = batch.recipients.map((r: any) => r.walletAddress);
      const tokenURIs = batch.recipients.map((r: any) => r.tokenURI);

      // Execute batch mint on blockchain
      const tx = await this.contract.batchMintAirdrop(recipients, batch.stage_id, tokenURIs);
      const receipt = await tx.wait();

      // Update batch status and recipients with transaction hash
      const updatedRecipients = batch.recipients.map((r: any) => ({
        ...r,
        minted: true,
        txHash: receipt.hash,
        mintedAt: new Date().toISOString()
      }));

      await supabase
        .from('airdrop_batches')
        .update({
          recipients: updatedRecipients,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId);

      Logger.info(`Airdrop batch processed: ${batchId} - TX: ${receipt.hash}`);
    } catch (error) {
      // Mark batch as failed
      await supabase
        .from('airdrop_batches')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', batchId);

      Logger.error('Error processing airdrop batch:', error);
      throw new Error('Failed to process airdrop batch');
    }
  }

  /**
   * Generate mint signature for individual minting
   */
  async generateMintSignature(
    recipient: string,
    stageId: number,
    tokenId: number,
    tokenURI: string,
    deadline: number
  ): Promise<MintSignature> {
    try {
      const nonce = await this.getUserNonce(recipient);
      
      // Create message hash
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'string', 'uint256', 'uint256', 'address'],
        [recipient, stageId, tokenId, tokenURI, nonce, deadline, await this.contract.getAddress()]
      );

      // Sign with wallet
      const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));

      return {
        recipient,
        stageId,
        tokenId,
        tokenURI,
        nonce,
        deadline,
        signature
      };
    } catch (error) {
      Logger.error('Error generating mint signature:', error);
      throw new Error('Failed to generate mint signature');
    }
  }

  /**
   * Get drop stage information
   */
  async getDropStage(stageId: number): Promise<DropStage | null> {
    try {
      const { data, error } = await supabase
        .from('drop_stages')
        .select('*')
        .eq('id', stageId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.mapDatabaseToDropStage(data) : null;
    } catch (error) {
      Logger.error('Error getting drop stage:', error);
      throw new Error('Failed to get drop stage');
    }
  }

  /**
   * Get all drop stages
   */
  async getAllDropStages(): Promise<DropStage[]> {
    try {
      const { data, error } = await supabase
        .from('drop_stages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ? data.map(this.mapDatabaseToDropStage) : [];
    } catch (error) {
      Logger.error('Error getting drop stages:', error);
      throw new Error('Failed to get drop stages');
    }
  }

  /**
   * Get airdrop batch by ID
   */
  async getAirdropBatch(batchId: string): Promise<AirdropBatch | null> {
    try {
      const { data, error } = await supabase
        .from('airdrop_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.mapDatabaseToAirdropBatch(data) : null;
    } catch (error) {
      Logger.error('Error getting airdrop batch:', error);
      throw new Error('Failed to get airdrop batch');
    }
  }

  /**
   * Get user's nonce for signature generation
   */
  private async getUserNonce(userAddress: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_nonces')
        .select('nonce')
        .eq('wallet_address', userAddress)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      const currentNonce = data ? data.nonce : 0;
      const newNonce = currentNonce + 1;

      // Update nonce in database
      await supabase
        .from('user_nonces')
        .upsert({
          wallet_address: userAddress,
          nonce: newNonce,
          updated_at: new Date().toISOString()
        }, { onConflict: 'wallet_address' });

      return newNonce;
    } catch (error) {
      Logger.error('Error getting user nonce:', error);
      throw new Error('Failed to get user nonce');
    }
  }

  /**
   * Map database record to DropStage
   */
  private mapDatabaseToDropStage(data: any): DropStage {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      maxSupply: data.max_supply,
      mintedCount: data.minted_count || 0,
      startTime: new Date(data.start_time).getTime(),
      endTime: new Date(data.end_time).getTime(),
      isActive: data.is_active,
      baseURI: data.base_uri,
      maxMintsPerUser: data.max_mints_per_user,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Map database record to AirdropBatch
   */
  private mapDatabaseToAirdropBatch(data: any): AirdropBatch {
    return {
      id: data.id,
      stageId: data.stage_id,
      recipients: data.recipients,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  /**
   * Get contract ABI (simplified version)
   */
  private getContractABI(): any[] {
    return [
      "function createDropStage(string name, string description, uint256 maxSupply, uint256 startTime, uint256 endTime, string baseURI, uint256 maxMintsPerUser) external",
      "function updateDropStage(uint256 stageId, bool isActive) external",
      "function updateWhitelist(uint256 stageId, address[] users, bool[] isWhitelisted) external",
      "function batchMintAirdrop(address[] recipients, uint256 stageId, string[] tokenURIs) external",
      "function mintWithSignature((address recipient, uint256 stageId, uint256 tokenId, string tokenURI, uint256 nonce, uint256 deadline) params, bytes signature) external",
      "function getDropStage(uint256 stageId) external view returns (tuple)",
      "function isWhitelisted(uint256 stageId, address user) external view returns (bool)",
      "function getUserMintedCount(uint256 stageId, address user) external view returns (uint256)"
    ];
  }
}

export const airdropService = AirdropService.getInstance();

