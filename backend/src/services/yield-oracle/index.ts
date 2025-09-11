import { CronJob } from 'cron';
import { ethers } from 'ethers';
import { CONFIG } from '../../config';
import { pool, YieldData } from '../../models';
import { Logger } from '../../utils/logger';
import { AaveService } from './aave-service';
import { KlaySwapService } from './klayswap-service';

export class YieldOracle {
  private provider: ethers.JsonRpcProvider;
  private aaveService: AaveService;
  private klaySwapService: KlaySwapService;
  private isRunning: boolean = false;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.kaia.rpcUrl);
    this.aaveService = new AaveService(this.provider);
    this.klaySwapService = new KlaySwapService(this.provider);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      Logger.warn('Yield oracle is already running');
      return;
    }

    Logger.info('Starting yield oracle service');
    this.isRunning = true;

    // Run immediately on startup
    await this.updateYieldData();

    // Schedule periodic updates
    const job = new CronJob(`*/${CONFIG.intervals.yieldUpdate / 60000} * * * *`, async () => {
      await this.updateYieldData();
    });

    job.start();
  }

  async updateYieldData(): Promise<void> {
    try {
      Logger.info('Updating yield data');
      
      const [aaveData, klaySwapData] = await Promise.all([
        this.aaveService.getYieldData(),
        this.klaySwapService.getYieldData()
      ]);

      const results = await Promise.all([
        this.saveYieldData('aave', aaveData.apy, aaveData.tvl),
        this.saveYieldData('klayswap', klaySwapData.apy, klaySwapData.tvl)
      ]);

      Logger.info('Yield data updated successfully', { results });
      
      // Emit event for rebalancer to potentially act upon
      this.emitYieldUpdateEvent({
        aave: aaveData.apy,
        klayswap: klaySwapData.apy
      });

    } catch (error) {
      Logger.error('Failed to update yield data', error);
    }
  }

  private async saveYieldData(strategy: string, apy: number, tvl: number): Promise<void> {
    const query = `
      INSERT INTO yield_data (strategy, apy, tvl, timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    
    const values = [strategy, apy, tvl];
    
    try {
      await pool.query(query, values);
    } catch (error) {
      Logger.error(`Failed to save yield data for ${strategy}`, error);
      throw error;
    }
  }

  private emitYieldUpdateEvent(yieldData: { [key: string]: number }): void {
    // This would typically use a message queue or event emitter
    // For simplicity, we'll directly call the rebalancer
    import('../rebalancer').then(({ Rebalancer }) => {
      Rebalancer.getInstance().onYieldUpdate(yieldData);
    });
  }

  async getHistoricalYield(strategy: string, hours: number = 24): Promise<YieldData[]> {
    const query = `
      SELECT * FROM yield_data 
      WHERE strategy = $1 AND timestamp > NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
    `;
    
    try {
      const result = await pool.query(query, [strategy]);
      return result.rows;
    } catch (error) {
      Logger.error(`Failed to get historical yield for ${strategy}`, error);
      throw error;
    }
  }
}

