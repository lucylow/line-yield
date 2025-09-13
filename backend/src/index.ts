import { YieldOracle } from './services/yield-oracle';
import { Rebalancer } from './services/rebalancer';
import { GaslessRelayer } from './services/gasless-relayer';
import { ApiServer } from './services/api-server';
import { Logger } from './utils/logger';
import { CONFIG, validateConfig } from './config';

class Application {
  private yieldOracle: YieldOracle;
  private rebalancer: Rebalancer;
  private gaslessRelayer: GaslessRelayer;
  private apiServer: ApiServer;

  constructor() {
    this.yieldOracle = new YieldOracle();
    this.rebalancer = Rebalancer.getInstance();
    this.gaslessRelayer = new GaslessRelayer();
    this.apiServer = new ApiServer();
  }

  async start(): Promise<void> {
    try {
      Logger.info('Starting LINE Yield backend services');
      
      // Validate configuration
      validateConfig();
      Logger.info('Configuration validated successfully');
      
      // Start yield oracle
      Logger.info('Starting yield oracle service...');
      await this.yieldOracle.start();
      Logger.info('Yield oracle service started');
      
      // Start rebalancer
      Logger.info('Starting rebalancer service...');
      await this.rebalancer.start();
      Logger.info('Rebalancer service started');
      
      // Start gasless relayer if enabled
      if (CONFIG.gasless.enabled) {
        Logger.info('Starting gasless relayer service...');
        await this.gaslessRelayer.start();
        Logger.info('Gasless relayer service started');
      } else {
        Logger.info('Gasless relayer is disabled in configuration');
      }
      
      // Start API server
      Logger.info('Starting API server...');
      await this.apiServer.start();
      Logger.info('API server started');
      
      Logger.info('All backend services started successfully');
      Logger.info(`Environment: ${CONFIG.nodeEnv}`);
      Logger.info(`Network: ${CONFIG.kaia.rpcUrl}`);
      Logger.info(`Vault: ${CONFIG.contracts.vaultAddress}`);
      Logger.info(`Gasless Vault: ${CONFIG.contracts.gaslessVaultAddress}`);
      
      // Handle graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      Logger.error('Failed to start application', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      Logger.info(`Received ${signal}, shutting down gracefully`);
      
      try {
        // Stop services gracefully
        Logger.info('Stopping services...');
        
        // Add any cleanup logic here
        // For example, close database connections, stop cron jobs, etc.
        
        Logger.info('All services stopped successfully');
        process.exit(0);
      } catch (error) {
        Logger.error('Error during shutdown', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  Logger.error('Unhandled error in application startup', error);
  process.exit(1);
});
