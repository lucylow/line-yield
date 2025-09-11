import { Pool } from 'pg';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';

// Database connection pool
export const pool = new Pool({
  host: CONFIG.database.host,
  port: CONFIG.database.port,
  database: CONFIG.database.name,
  user: CONFIG.database.user,
  password: CONFIG.database.password,
  ssl: CONFIG.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', () => {
  Logger.info('Database client connected');
});

pool.on('error', (err) => {
  Logger.error('Unexpected error on idle database client', err);
});

// Database models and interfaces
export interface YieldData {
  id: number;
  strategy: string;
  apy: number;
  timestamp: Date;
  tvl: number;
}

export interface Transaction {
  id: number;
  hash: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'harvest' | 'gasless_deposit' | 'gasless_withdraw';
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: number;
  gasPrice: number;
  timestamp: Date;
  blockNumber: number;
  userAddress?: string;
}

export interface GaslessTransaction {
  id: number;
  userAddress: string;
  method: string;
  txHash: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: Date;
}

export interface StrategyPerformance {
  strategy: string;
  dailyYield: number;
  weeklyYield: number;
  monthlyYield: number;
  totalYield: number;
  currentApy: number;
  tvl: number;
  lastUpdated: Date;
}

export interface UserActivity {
  userAddress: string;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  firstDeposit: Date;
  lastActivity: Date;
  transactionCount: number;
}

export interface VaultMetrics {
  totalValueLocked: number;
  totalUsers: number;
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  averageApy: number;
  lastUpdated: Date;
}

// Database initialization
export async function initializeDatabase(): Promise<void> {
  try {
    Logger.info('Initializing database...');
    
    // Create tables if they don't exist
    await createTables();
    
    Logger.info('Database initialized successfully');
  } catch (error) {
    Logger.error('Failed to initialize database', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Yield data table
    await client.query(`
      CREATE TABLE IF NOT EXISTS yield_data (
        id SERIAL PRIMARY KEY,
        strategy VARCHAR(50) NOT NULL,
        apy DECIMAL(10,6) NOT NULL,
        tvl DECIMAL(20,6) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        hash VARCHAR(66) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        gas_used BIGINT NOT NULL,
        gas_price DECIMAL(10,2) NOT NULL,
        block_number BIGINT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_address VARCHAR(42)
      );
    `);

    // Gasless transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gasless_transactions (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        method VARCHAR(50) NOT NULL,
        tx_hash VARCHAR(66) UNIQUE NOT NULL,
        gas_used VARCHAR(20) NOT NULL,
        gas_price VARCHAR(20) NOT NULL,
        block_number BIGINT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Strategy performance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS strategy_performance (
        id SERIAL PRIMARY KEY,
        strategy VARCHAR(50) UNIQUE NOT NULL,
        daily_yield DECIMAL(20,6) DEFAULT 0,
        weekly_yield DECIMAL(20,6) DEFAULT 0,
        monthly_yield DECIMAL(20,6) DEFAULT 0,
        total_yield DECIMAL(20,6) DEFAULT 0,
        current_apy DECIMAL(10,6) DEFAULT 0,
        tvl DECIMAL(20,6) DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // User activity table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        user_address VARCHAR(42) PRIMARY KEY,
        total_deposits DECIMAL(20,6) DEFAULT 0,
        total_withdrawals DECIMAL(20,6) DEFAULT 0,
        current_balance DECIMAL(20,6) DEFAULT 0,
        first_deposit TIMESTAMP WITH TIME ZONE,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        transaction_count INTEGER DEFAULT 0
      );
    `);

    // Vault metrics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vault_metrics (
        id SERIAL PRIMARY KEY,
        total_value_locked DECIMAL(20,6) NOT NULL,
        total_users INTEGER NOT NULL,
        daily_volume DECIMAL(20,6) DEFAULT 0,
        weekly_volume DECIMAL(20,6) DEFAULT 0,
        monthly_volume DECIMAL(20,6) DEFAULT 0,
        average_apy DECIMAL(10,6) DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_yield_data_strategy_timestamp 
      ON yield_data (strategy, timestamp DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_hash 
      ON transactions (hash);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_address 
      ON transactions (user_address);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gasless_transactions_user_address 
      ON gasless_transactions (user_address);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_gasless_transactions_timestamp 
      ON gasless_transactions (timestamp DESC);
    `);

    Logger.info('Database tables created successfully');
  } finally {
    client.release();
  }
}

// Database utility functions
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    Logger.info('Database connection pool closed');
  } catch (error) {
    Logger.error('Error closing database connection pool', error);
  }
}

// Query helper functions
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    Logger.debug('Database query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    Logger.error('Database query failed', { text, params, error });
    throw error;
  }
}

// Health check for database
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    Logger.error('Database health check failed', error);
    return false;
  }
}
