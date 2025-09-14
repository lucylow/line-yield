#!/usr/bin/env ts-node

import { ethers } from 'ethers';
import { YieldNFT } from '../contracts/nft/YieldNFT';
import { NFTMarketplace } from '../contracts/nft/NFTMarketplace';
import { NFTDropManager } from '../contracts/nft/NFTDropManager';

/**
 * NFT Drop Deployment Script
 * Deploys NFT collection, marketplace, and drop manager contracts
 */

interface DeploymentConfig {
  network: string;
  rpcUrl: string;
  privateKey: string;
  paymentToken: string;
  feeRecipient: string;
}

interface CollectionConfig {
  name: string;
  symbol: string;
  baseURI: string;
  maxSupply: number;
  mintPrice: string;
  royaltyFee: number;
  owner: string;
}

interface MarketplaceConfig {
  name: string;
  feeRecipient: string;
  platformFee: number;
  royaltyFee: number;
}

interface DropConfig {
  collectionId: string;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  maxParticipants: number;
  airdropAmount: number;
  presalePrice: string;
  publicPrice: string;
  whitelistRequired: boolean;
}

class NFTDropDeployer {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
  }

  /**
   * Deploy NFT Collection Contract
   */
  async deployNFTCollection(collectionConfig: CollectionConfig): Promise<string> {
    console.log(`🚀 Deploying NFT Collection: ${collectionConfig.name}`);
    
    try {
      const factory = new ethers.ContractFactory(
        YieldNFT.abi,
        YieldNFT.bytecode,
        this.wallet
      );

      const contract = await factory.deploy(
        collectionConfig.name,
        collectionConfig.symbol,
        collectionConfig.baseURI,
        collectionConfig.maxSupply,
        ethers.utils.parseEther(collectionConfig.mintPrice),
        collectionConfig.royaltyFee,
        collectionConfig.owner
      );

      console.log(`⏳ Waiting for deployment confirmation...`);
      await contract.deployed();

      console.log(`✅ NFT Collection deployed successfully!`);
      console.log(`📍 Contract Address: ${contract.address}`);
      console.log(`🔗 Transaction Hash: ${contract.deployTransaction.hash}`);
      console.log(`⛽ Gas Used: ${contract.deployTransaction.gasLimit?.toString()}`);

      return contract.address;
    } catch (error) {
      console.error(`❌ Failed to deploy NFT Collection:`, error);
      throw error;
    }
  }

  /**
   * Deploy NFT Marketplace Contract
   */
  async deployNFTMarketplace(marketplaceConfig: MarketplaceConfig): Promise<string> {
    console.log(`🚀 Deploying NFT Marketplace: ${marketplaceConfig.name}`);
    
    try {
      const factory = new ethers.ContractFactory(
        NFTMarketplace.abi,
        NFTMarketplace.bytecode,
        this.wallet
      );

      const contract = await factory.deploy(
        marketplaceConfig.name,
        marketplaceConfig.feeRecipient,
        marketplaceConfig.platformFee,
        marketplaceConfig.royaltyFee
      );

      console.log(`⏳ Waiting for deployment confirmation...`);
      await contract.deployed();

      console.log(`✅ NFT Marketplace deployed successfully!`);
      console.log(`📍 Contract Address: ${contract.address}`);
      console.log(`🔗 Transaction Hash: ${contract.deployTransaction.hash}`);
      console.log(`⛽ Gas Used: ${contract.deployTransaction.gasLimit?.toString()}`);

      return contract.address;
    } catch (error) {
      console.error(`❌ Failed to deploy NFT Marketplace:`, error);
      throw error;
    }
  }

  /**
   * Deploy NFT Drop Manager Contract
   */
  async deployNFTDropManager(): Promise<string> {
    console.log(`🚀 Deploying NFT Drop Manager`);
    
    try {
      const factory = new ethers.ContractFactory(
        NFTDropManager.abi,
        NFTDropManager.bytecode,
        this.wallet
      );

      const contract = await factory.deploy(
        this.config.paymentToken,
        this.config.feeRecipient
      );

      console.log(`⏳ Waiting for deployment confirmation...`);
      await contract.deployed();

      console.log(`✅ NFT Drop Manager deployed successfully!`);
      console.log(`📍 Contract Address: ${contract.address}`);
      console.log(`🔗 Transaction Hash: ${contract.deployTransaction.hash}`);
      console.log(`⛽ Gas Used: ${contract.deployTransaction.gasLimit?.toString()}`);

      return contract.address;
    } catch (error) {
      console.error(`❌ Failed to deploy NFT Drop Manager:`, error);
      throw error;
    }
  }

  /**
   * Create Drop Campaign
   */
  async createDropCampaign(
    dropManagerAddress: string,
    dropConfig: DropConfig
  ): Promise<string> {
    console.log(`🎯 Creating Drop Campaign: ${dropConfig.name}`);
    
    try {
      const dropManager = new ethers.Contract(
        dropManagerAddress,
        NFTDropManager.abi,
        this.wallet
      );

      const tx = await dropManager.createDropCampaign(
        dropConfig.collectionId,
        dropConfig.name,
        dropConfig.description,
        dropConfig.startTime,
        dropConfig.endTime,
        dropConfig.maxParticipants,
        dropConfig.airdropAmount,
        ethers.utils.parseEther(dropConfig.presalePrice),
        ethers.utils.parseEther(dropConfig.publicPrice),
        dropConfig.whitelistRequired
      );

      console.log(`⏳ Waiting for transaction confirmation...`);
      const receipt = await tx.wait();

      console.log(`✅ Drop Campaign created successfully!`);
      console.log(`🔗 Transaction Hash: ${tx.hash}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

      // Get the drop ID from events
      const event = receipt.events?.find(e => e.event === 'DropCampaignCreated');
      const dropId = event?.args?.dropId?.toString();

      return dropId || 'unknown';
    } catch (error) {
      console.error(`❌ Failed to create Drop Campaign:`, error);
      throw error;
    }
  }

  /**
   * Create Drop Stages
   */
  async createDropStages(
    dropManagerAddress: string,
    dropId: string,
    stages: {
      airdropStart: number;
      airdropEnd: number;
      presaleStart: number;
      presaleEnd: number;
      publicStart: number;
      publicEnd: number;
    }
  ): Promise<void> {
    console.log(`📅 Creating Drop Stages for Drop ID: ${dropId}`);
    
    try {
      const dropManager = new ethers.Contract(
        dropManagerAddress,
        NFTDropManager.abi,
        this.wallet
      );

      const tx = await dropManager.createDropStages(
        dropId,
        stages.airdropStart,
        stages.airdropEnd,
        stages.presaleStart,
        stages.presaleEnd,
        stages.publicStart,
        stages.publicEnd
      );

      console.log(`⏳ Waiting for transaction confirmation...`);
      const receipt = await tx.wait();

      console.log(`✅ Drop Stages created successfully!`);
      console.log(`🔗 Transaction Hash: ${tx.hash}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
      console.error(`❌ Failed to create Drop Stages:`, error);
      throw error;
    }
  }

  /**
   * Add Whitelist Entries
   */
  async addWhitelistEntries(
    dropManagerAddress: string,
    dropId: string,
    whitelist: { address: string; maxMints: number }[]
  ): Promise<void> {
    console.log(`👥 Adding Whitelist Entries for Drop ID: ${dropId}`);
    
    try {
      const dropManager = new ethers.Contract(
        dropManagerAddress,
        NFTDropManager.abi,
        this.wallet
      );

      // Batch add whitelist entries
      const addresses = whitelist.map(entry => entry.address);
      const maxMints = whitelist.map(entry => entry.maxMints);

      const tx = await dropManager.batchAddToWhitelist(dropId, addresses, maxMints);

      console.log(`⏳ Waiting for transaction confirmation...`);
      const receipt = await tx.wait();

      console.log(`✅ Whitelist entries added successfully!`);
      console.log(`🔗 Transaction Hash: ${tx.hash}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
      console.error(`❌ Failed to add Whitelist entries:`, error);
      throw error;
    }
  }

  /**
   * Execute Airdrop
   */
  async executeAirdrop(
    dropManagerAddress: string,
    dropId: string,
    recipients: { address: string; amount: number }[]
  ): Promise<void> {
    console.log(`🎁 Executing Airdrop for Drop ID: ${dropId}`);
    
    try {
      const dropManager = new ethers.Contract(
        dropManagerAddress,
        NFTDropManager.abi,
        this.wallet
      );

      const addresses = recipients.map(r => r.address);
      const amounts = recipients.map(r => r.amount);

      const tx = await dropManager.executeAirdrop(dropId, addresses, amounts);

      console.log(`⏳ Waiting for transaction confirmation...`);
      const receipt = await tx.wait();

      console.log(`✅ Airdrop executed successfully!`);
      console.log(`🔗 Transaction Hash: ${tx.hash}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    } catch (error) {
      console.error(`❌ Failed to execute Airdrop:`, error);
      throw error;
    }
  }

  /**
   * Get Network Info
   */
  async getNetworkInfo(): Promise<void> {
    const network = await this.provider.getNetwork();
    const balance = await this.wallet.getBalance();
    
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`👤 Deployer: ${this.wallet.address}`);
    console.log(`💰 Balance: ${ethers.utils.formatEther(balance)} ETH`);
    console.log(`⛽ Gas Price: ${ethers.utils.formatUnits(await this.provider.getGasPrice(), 'gwei')} Gwei`);
  }
}

/**
 * Main Deployment Function
 */
async function main() {
  console.log(`🎯 Starting NFT Drop Deployment...\n`);

  // Configuration
  const config: DeploymentConfig = {
    network: process.env.NETWORK || 'localhost',
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY || '',
    paymentToken: process.env.PAYMENT_TOKEN || '0x0000000000000000000000000000000000000000', // USDT address
    feeRecipient: process.env.FEE_RECIPIENT || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  };

  if (!config.privateKey) {
    console.error(`❌ Private key not provided. Please set PRIVATE_KEY environment variable.`);
    process.exit(1);
  }

  const deployer = new NFTDropDeployer(config);

  try {
    // Get network info
    await deployer.getNetworkInfo();
    console.log('');

    // Deploy NFT Collection
    const collectionConfig: CollectionConfig = {
      name: 'LINE Yield Genesis',
      symbol: 'LYG',
      baseURI: 'https://api.lineyield.com/metadata/',
      maxSupply: 10000,
      mintPrice: '0.5',
      royaltyFee: 250, // 2.5%
      owner: config.feeRecipient
    };

    const collectionAddress = await deployer.deployNFTCollection(collectionConfig);
    console.log('');

    // Deploy NFT Marketplace
    const marketplaceConfig: MarketplaceConfig = {
      name: 'LINE Yield Marketplace',
      feeRecipient: config.feeRecipient,
      platformFee: 250, // 2.5%
      royaltyFee: 250 // 2.5%
    };

    const marketplaceAddress = await deployer.deployNFTMarketplace(marketplaceConfig);
    console.log('');

    // Deploy NFT Drop Manager
    const dropManagerAddress = await deployer.deployNFTDropManager();
    console.log('');

    // Create Drop Campaign
    const dropConfig: DropConfig = {
      collectionId: collectionAddress,
      name: 'LINE Yield Legends',
      description: 'Legendary NFTs with special powers and utilities',
      startTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      endTime: Math.floor(Date.now() / 1000) + (30 * 24 * 3600), // 30 days from now
      maxParticipants: 5000,
      airdropAmount: 500,
      presalePrice: '0.3',
      publicPrice: '0.5',
      whitelistRequired: true
    };

    const dropId = await deployer.createDropCampaign(dropManagerAddress, dropConfig);
    console.log('');

    // Create Drop Stages
    const now = Math.floor(Date.now() / 1000);
    await deployer.createDropStages(dropManagerAddress, dropId, {
      airdropStart: now + 3600, // 1 hour from now
      airdropEnd: now + (24 * 3600), // 24 hours from now
      presaleStart: now + (24 * 3600), // 24 hours from now
      presaleEnd: now + (15 * 24 * 3600), // 15 days from now
      publicStart: now + (15 * 24 * 3600), // 15 days from now
      publicEnd: now + (30 * 24 * 3600) // 30 days from now
    });
    console.log('');

    // Add Whitelist Entries (example)
    const whitelistEntries = [
      { address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', maxMints: 5 },
      { address: '0x1234567890abcdef1234567890abcdef12345678', maxMints: 3 }
    ];

    await deployer.addWhitelistEntries(dropManagerAddress, dropId, whitelistEntries);
    console.log('');

    // Execute Airdrop (example)
    const airdropRecipients = [
      { address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', amount: 2 },
      { address: '0x1234567890abcdef1234567890abcdef12345678', amount: 1 }
    ];

    await deployer.executeAirdrop(dropManagerAddress, dropId, airdropRecipients);
    console.log('');

    // Deployment Summary
    console.log(`🎉 Deployment Complete!`);
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`📦 NFT Collection: ${collectionAddress}`);
    console.log(`🏪 NFT Marketplace: ${marketplaceAddress}`);
    console.log(`🎯 NFT Drop Manager: ${dropManagerAddress}`);
    console.log(`🎁 Drop Campaign ID: ${dropId}`);
    console.log(`═══════════════════════════════════════════════════════════`);

  } catch (error) {
    console.error(`❌ Deployment failed:`, error);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`❌ Unhandled error:`, error);
    process.exit(1);
  });
}

export { NFTDropDeployer, DeploymentConfig, CollectionConfig, MarketplaceConfig, DropConfig };
