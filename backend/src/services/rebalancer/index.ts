import { CronJob } from 'cron';
import { ethers } from 'ethers';
import { CONFIG } from '../../config';
import { pool, Transaction } from '../../models';
import { Logger } from '../../utils/logger';
import { ContractService } from '../contract-service';

interface RebalanceOpportunity {
  fromStrategy: string;
  toStrategy: string;
  amount: number;
  expectedYieldImprovement: number;
}

export class Rebalancer {
  private static instance: Rebalancer;
  private provider: ethers.JsonRpcProvider;
  private contractService: ContractService;
  private isRunning: boolean = false;
  private currentYieldData: { [key: string]: number } = {};

  private constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.contractService = new ContractService(this.provider);
  }

  static getInstance(): Rebalancer {
    if (!Rebalancer.instance) {
      Rebalancer.instance = new Rebalancer();
    }
    return Rebalancer.instance;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      Logger.warn('Rebalancer is already running');
      return;
    }

    Logger.info('Starting rebalancer service');
    this.isRunning = true;

    // Check for rebalance opportunities every 5 minutes
    const job = new CronJob(`*/${CONFIG.intervals.rebalanceCheck / 60000} * * * *`, async () => {
      await this.checkRebalanceOpportunities();
    });

    job.start();
  }

  onYieldUpdate(yieldData: { [key: string]: number }): void {
    this.currentYieldData = { ...this.currentYieldData, ...yieldData };
    this.checkRebalanceOpportunities(); // Check immediately on significant updates
  }

  async checkRebalanceOpportunities(): Promise<void> {
    if (Object.keys(this.currentYieldData).length === 0) {
      Logger.info('No yield data available for rebalancing');
      return;
    }

    try {
      const opportunities = await this.findRebalanceOpportunities();
      
      if (opportunities.length > 0) {
        Logger.info('Found rebalance opportunities', { opportunities });
        
        // Execute the most promising opportunity
        const bestOpportunity = opportunities[0];
        if (bestOpportunity) {
          await this.executeRebalance(bestOpportunity);
        }
      } else {
        Logger.info('No profitable rebalance opportunities found');
      }
    } catch (error) {
      Logger.error('Failed to check rebalance opportunities', error);
    }
  }

  private async findRebalanceOpportunities(): Promise<RebalanceOpportunity[]> {
    const opportunities: RebalanceOpportunity[] = [];
    const strategies = Object.keys(this.currentYieldData);
    
    // Get current allocations from strategy manager
    const allocations = await this.contractService.getStrategyAllocations();
    
    for (let i = 0; i < strategies.length; i++) {
      for (let j = 0; j < strategies.length; j++) {
        if (i === j) continue;
        
        const fromStrategy = strategies[i];
        const toStrategy = strategies[j];
        
        const fromApy = this.currentYieldData[fromStrategy] || 0;
        const toApy = this.currentYieldData[toStrategy] || 0;
        
        const yieldDifference = toApy - fromApy;
        
        // Check if the yield difference exceeds our threshold
        if (yieldDifference > CONFIG.thresholds.rebalance) {
          // Calculate how much to rebalance (proportional to current allocation)
          const fromAllocation = allocations[fromStrategy] || 0;
          const rebalanceAmount = fromAllocation * 0.1; // Move 10% of the allocation
          
          opportunities.push({
            fromStrategy: fromStrategy || '',
            toStrategy: toStrategy || '',
            amount: rebalanceAmount,
            expectedYieldImprovement: yieldDifference * rebalanceAmount
          });
        }
      }
    }
    
    // Sort by expected yield improvement (descending)
    return opportunities.sort((a, b) => b.expectedYieldImprovement - a.expectedYieldImprovement);
  }

  private async executeRebalance(opportunity: RebalanceOpportunity): Promise<void> {
    try {
      Logger.info('Executing rebalance', { opportunity });
      
      // Check gas prices first
      const gasPrice = await this.provider.getFeeData();
      const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'));
      
      if (gasPriceGwei > CONFIG.thresholds.maxGasPriceGwei) {
        Logger.warn('Gas price too high for rebalancing', { gasPriceGwei });
        return;
      }
      
      // Execute rebalance through strategy manager
      const tx = await this.contractService.rebalance(
        opportunity.fromStrategy,
        opportunity.toStrategy,
        opportunity.amount
      );
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Log transaction
      await this.logTransaction({
        hash: receipt?.hash || 'unknown',
        type: 'rebalance',
        status: 'confirmed',
        gasUsed: Number(receipt?.gasUsed || 0),
        gasPrice: gasPriceGwei,
        blockNumber: receipt?.blockNumber || 0,
        timestamp: new Date()
      });
      
      Logger.info('Rebalance executed successfully', { 
        txHash: receipt?.hash || 'unknown',
        gasUsed: receipt?.gasUsed?.toString() || '0'
      });
      
    } catch (error) {
      Logger.error('Failed to execute rebalance', error);
      
      // Log failed transaction
      await this.logTransaction({
        hash: 'unknown',
        type: 'rebalance',
        status: 'failed',
        gasUsed: 0,
        gasPrice: 0,
        blockNumber: 0,
        timestamp: new Date()
      });
    }
  }

  private async logTransaction(tx: Omit<Transaction, 'id'>): Promise<void> {
    const query = `
      INSERT INTO transactions (hash, type, status, gas_used, gas_price, block_number, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    const values = [
      tx.hash,
      tx.type,
      tx.status,
      tx.gasUsed,
      tx.gasPrice,
      tx.blockNumber,
      tx.timestamp
    ];
    
    try {
      await pool.query(query, values);
    } catch (error) {
      Logger.error('Failed to log transaction', error);
    }
  }
}
