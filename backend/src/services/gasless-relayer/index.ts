import express from 'express';
import { ethers } from 'ethers';
import { CONFIG } from '../../config';
import { pool } from '../../models';
import { Logger } from '../../utils/logger';
import { ContractService } from '../contract-service';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

export class GaslessRelayer {
  private app: express.Application;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contractService: ContractService;
  private isRunning: boolean = false;
  private rateLimiter: RateLimiterMemory;

  constructor() {
    this.app = express();
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.wallet = new ethers.Wallet(CONFIG.kaia.walletPrivateKey, this.provider);
    this.contractService = new ContractService(this.provider);
    
    // Rate limiting: 10 requests per minute per IP
    this.rateLimiter = new RateLimiterMemory({
      keyPrefix: 'gasless_relayer',
      points: 10, // Number of requests
      duration: 60, // Per 60 seconds
    });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
      credentials: true
    }));
    
    // Compression and logging
    this.app.use(compression());
    this.app.use(morgan('combined'));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Rate limiting middleware
    this.app.use(this.rateLimitMiddleware.bind(this));
  }

  private async rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    try {
      const key = req.ip || 'unknown';
      await this.rateLimiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round((rejRes as any).msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: secs
      });
    }
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        relayer: this.wallet.address,
        vault: CONFIG.contracts.gaslessVaultAddress,
        network: CONFIG.kaia.rpcUrl,
        gaslessEnabled: CONFIG.gasless.enabled
      });
    });

    // Get user nonce endpoint
    this.app.get('/nonce/:userAddress', async (req, res): Promise<void> => {
      try {
        const { userAddress } = req.params;
        
        if (!ethers.isAddress(userAddress)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid address format'
          });
        }
        
        const nonce = await this.contractService.getUserNonce(userAddress);
        
        res.json({
          success: true,
          nonce: nonce.toString()
        });
      } catch (error) {
        Logger.error('Failed to get user nonce', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user nonce'
        });
      }
    });

    // Gasless deposit endpoint
    this.app.post('/relay/deposit', async (req, res): Promise<void> => {
      try {
        const { user, assets, receiver, nonce, signature } = req.body;
        
        if (!this.validateGaslessRequest(req.body, ['user', 'assets', 'receiver', 'nonce', 'signature'])) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters'
          });
        }
        
        const result = await this.executeGaslessDeposit(user, assets, receiver, nonce, signature);
        res.json(result);
      } catch (error) {
        Logger.error('Failed to execute gasless deposit', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Gasless withdraw endpoint
    this.app.post('/relay/withdraw', async (req, res): Promise<void> => {
      try {
        const { user, assets, receiver, owner, nonce, signature } = req.body;
        
        if (!this.validateGaslessRequest(req.body, ['user', 'assets', 'receiver', 'owner', 'nonce', 'signature'])) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters'
          });
        }
        
        const result = await this.executeGaslessWithdraw(user, assets, receiver, owner, nonce, signature);
        res.json(result);
      } catch (error) {
        Logger.error('Failed to execute gasless withdraw', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Gasless mint endpoint
    this.app.post('/relay/mint', async (req, res): Promise<void> => {
      try {
        const { user, shares, receiver, nonce, signature } = req.body;
        
        if (!this.validateGaslessRequest(req.body, ['user', 'shares', 'receiver', 'nonce', 'signature'])) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters'
          });
        }
        
        const result = await this.executeGaslessMint(user, shares, receiver, nonce, signature);
        res.json(result);
      } catch (error) {
        Logger.error('Failed to execute gasless mint', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Gasless redeem endpoint
    this.app.post('/relay/redeem', async (req, res): Promise<void> => {
      try {
        const { user, shares, receiver, owner, nonce, signature } = req.body;
        
        if (!this.validateGaslessRequest(req.body, ['user', 'shares', 'receiver', 'owner', 'nonce', 'signature'])) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters'
          });
        }
        
        const result = await this.executeGaslessRedeem(user, shares, receiver, owner, nonce, signature);
        res.json(result);
      } catch (error) {
        Logger.error('Failed to execute gasless redeem', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Gas estimation endpoint
    this.app.post('/estimate-gas', async (req, res): Promise<void> => {
      try {
        const { method, params } = req.body;
        
        if (!method || !params) {
          return res.status(400).json({
            success: false,
            error: 'Missing method or params'
          });
        }
        
        const gasEstimate = await this.estimateGas(method, params);
        res.json({ success: true, gasEstimate: gasEstimate.toString() });
      } catch (error) {
        Logger.error('Failed to estimate gas', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Error handling middleware
    this.app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      Logger.error('Unhandled error in gasless relayer', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }

  private validateGaslessRequest(body: any, requiredFields: string[]): boolean {
    return requiredFields.every(field => body[field] !== undefined && body[field] !== null);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      Logger.warn('Gasless relayer is already running');
      return;
    }

    if (!CONFIG.gasless.enabled) {
      Logger.warn('Gasless transactions are disabled in configuration');
      return;
    }

    const port = CONFIG.port + 1; // Use port + 1 to avoid conflict with main app
    this.app.listen(port, () => {
      Logger.info(`Gasless relayer running on port ${port}`);
      Logger.info(`Relayer address: ${this.wallet.address}`);
      Logger.info(`Vault address: ${CONFIG.contracts.gaslessVaultAddress}`);
      this.isRunning = true;
    });
  }

  private async executeGaslessDeposit(
    user: string,
    assets: string,
    receiver: string,
    nonce: string,
    signature: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      // Validate addresses
      if (!ethers.isAddress(user) || !ethers.isAddress(receiver)) {
        throw new Error('Invalid address format');
      }

      // Check gas price
      const gasPrice = await this.getReasonableGasPrice();
      if (gasPrice > CONFIG.gasless.maxGasPriceGwei) {
        throw new Error(`Gas price too high: ${gasPrice} Gwei`);
      }

      // Execute gasless deposit
      const tx = await this.contractService.executeGaslessDeposit(
        user,
        assets,
        receiver,
        nonce,
        signature,
        gasPrice
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Log the transaction
      await this.logGaslessTransaction(user, 'deposit', receipt);

      return {
        success: true,
        transactionHash: receipt?.hash || 'unknown'
      };
    } catch (error) {
      Logger.error('Gasless deposit execution failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeGaslessWithdraw(
    user: string,
    assets: string,
    receiver: string,
    owner: string,
    nonce: string,
    signature: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      // Validate addresses
      if (!ethers.isAddress(user) || !ethers.isAddress(receiver) || !ethers.isAddress(owner)) {
        throw new Error('Invalid address format');
      }

      // Check gas price
      const gasPrice = await this.getReasonableGasPrice();
      if (gasPrice > CONFIG.gasless.maxGasPriceGwei) {
        throw new Error(`Gas price too high: ${gasPrice} Gwei`);
      }

      // Execute gasless withdraw
      const tx = await this.contractService.executeGaslessWithdraw(
        user,
        assets,
        receiver,
        owner,
        nonce,
        signature,
        gasPrice
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Log the transaction
      await this.logGaslessTransaction(user, 'withdraw', receipt);

      return {
        success: true,
        transactionHash: receipt?.hash || 'unknown'
      };
    } catch (error) {
      Logger.error('Gasless withdraw execution failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeGaslessMint(
    user: string,
    shares: string,
    receiver: string,
    nonce: string,
    signature: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      // Validate addresses
      if (!ethers.isAddress(user) || !ethers.isAddress(receiver)) {
        throw new Error('Invalid address format');
      }

      // Check gas price
      const gasPrice = await this.getReasonableGasPrice();
      if (gasPrice > CONFIG.gasless.maxGasPriceGwei) {
        throw new Error(`Gas price too high: ${gasPrice} Gwei`);
      }

      // Execute gasless mint
      const tx = await this.contractService.executeGaslessMint(
        user,
        shares,
        receiver,
        nonce,
        signature,
        gasPrice
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Log the transaction
      await this.logGaslessTransaction(user, 'mint', receipt);

      return {
        success: true,
        transactionHash: receipt?.hash || 'unknown'
      };
    } catch (error) {
      Logger.error('Gasless mint execution failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeGaslessRedeem(
    user: string,
    shares: string,
    receiver: string,
    owner: string,
    nonce: string,
    signature: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      // Validate addresses
      if (!ethers.isAddress(user) || !ethers.isAddress(receiver) || !ethers.isAddress(owner)) {
        throw new Error('Invalid address format');
      }

      // Check gas price
      const gasPrice = await this.getReasonableGasPrice();
      if (gasPrice > CONFIG.gasless.maxGasPriceGwei) {
        throw new Error(`Gas price too high: ${gasPrice} Gwei`);
      }

      // Execute gasless redeem
      const tx = await this.contractService.executeGaslessRedeem(
        user,
        shares,
        receiver,
        owner,
        nonce,
        signature,
        gasPrice
      );

      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Log the transaction
      await this.logGaslessTransaction(user, 'redeem', receipt);

      return {
        success: true,
        transactionHash: receipt?.hash || 'unknown'
      };
    } catch (error) {
      Logger.error('Gasless redeem execution failed', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getReasonableGasPrice(): Promise<number> {
    try {
      // Try to get gas price from Kaia gas station
      const response = await fetch(CONFIG.kaia.gasStationUrl);
      const data = await response.json();
      
      // Use suggested gas price with a small buffer
      return (data as any).safeLow * 1.1;
    } catch (error) {
      // Fallback to provider gas price
      const gasPrice = await this.provider.getFeeData();
      return parseFloat(ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'));
    }
  }

  private async estimateGas(method: string, params: any[]): Promise<bigint> {
    try {
      return await this.contractService.estimateGas(method, params);
    } catch (error) {
      Logger.error('Gas estimation failed', error);
      throw error;
    }
  }

  private async logGaslessTransaction(
    userAddress: string,
    method: string,
    receipt: ethers.ContractReceipt | null
  ): Promise<void> {
    const query = `
      INSERT INTO gasless_transactions 
      (user_address, method, tx_hash, gas_used, gas_price, block_number, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    const values = [
      userAddress,
      method,
      receipt.hash,
      receipt.gasUsed.toString(),
      ethers.formatUnits(receipt.gasPrice || 0, 'gwei'),
      receipt.blockNumber,
      new Date()
    ];
    
    try {
      await pool.query(query, values);
      Logger.info('Gasless transaction logged', {
        user: userAddress,
        method,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString()
      });
    } catch (error) {
      Logger.error('Failed to log gasless transaction', error);
    }
  }
}
