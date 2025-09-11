// Common types used across the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    blockchain: boolean;
    relayer: boolean;
  };
  uptime: number;
  version: string;
}

export interface GasEstimateResponse {
  gasLimit: string;
  gasPrice: string;
  totalCost: string;
  method: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: string;
}

export interface YieldData {
  strategy: string;
  apy: number;
  tvl: number;
  timestamp: string;
}

export interface StrategyInfo {
  name: string;
  address: string;
  type: 'aave' | 'klayswap' | 'compound' | 'custom';
  allocation: number;
  apy: number;
  tvl: number;
  enabled: boolean;
}

export interface VaultInfo {
  totalValueLocked: string;
  totalUsers: number;
  currentApy: number;
  strategies: StrategyInfo[];
  lastUpdated: string;
}

export interface UserInfo {
  address: string;
  balance: string;
  shares: string;
  totalDeposits: string;
  totalWithdrawals: string;
  firstDeposit: string;
  lastActivity: string;
}

export interface RebalanceOpportunity {
  fromStrategy: string;
  toStrategy: string;
  amount: string;
  expectedYieldImprovement: number;
  gasCost: string;
  netBenefit: string;
}

export interface GaslessTransactionRequest {
  user: string;
  method: 'deposit' | 'withdraw' | 'mint' | 'redeem';
  params: any[];
  nonce: string;
  signature: string;
}

export interface GaslessTransactionResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Event types for internal communication
export interface YieldUpdateEvent {
  strategy: string;
  apy: number;
  tvl: number;
  timestamp: number;
}

export interface RebalanceEvent {
  fromStrategy: string;
  toStrategy: string;
  amount: string;
  transactionHash: string;
  timestamp: number;
}

export interface TransactionEvent {
  hash: string;
  type: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
  timestamp: number;
}

// Configuration types
export interface ServiceConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retries: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
}

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  gasPrice: {
    min: number;
    max: number;
    default: number;
  };
  confirmations: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Generic response wrapper
export type ServiceResponse<T> = Promise<ApiResponse<T>>;

// Event handler types
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export type ErrorHandler = (error: Error, context?: string) => void;

// Logger types
export interface LogContext {
  service?: string;
  method?: string;
  userId?: string;
  transactionHash?: string;
  [key: string]: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Database query types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  where?: Record<string, any>;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  command: string;
}
