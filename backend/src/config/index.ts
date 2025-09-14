import { config } from 'dotenv';
config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  kaia: {
    rpcUrl: string;
    chainId: number;
    walletPrivateKey: string;
    gasStationUrl: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  contracts: {
    vaultAddress: string;
    strategyManagerAddress: string;
    gaslessVaultAddress: string;
    creditScoreAddress: string;
    nftCollateralVaultAddress: string;
    nftPriceOracleAddress: string;
    liquidationEngineAddress: string;
    yieldPointsNFTAddress: string;
    stablecoinSwapAddress: string;
    daoGovernanceAddress: string;
    secureVaultAddress: string;
    securityOracleAddress: string;
  };
  strategies: {
    [key: string]: StrategyConfig;
  };
  thresholds: {
    rebalance: number; // 0.5% in decimal (0.005)
    minYieldDifference: number;
    maxGasPriceGwei: number;
  };
  intervals: {
    yieldUpdate: number; // milliseconds
    rebalanceCheck: number;
    healthCheck: number;
  };
  security: {
    jwtSecret: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    encryptionKey: string;
    apiRateLimitSecret: string;
  };
  gasless: {
    enabled: boolean;
    relayerUrl: string;
    maxGasPriceGwei: number;
    supportedMethods: string[];
  };
  line: {
    channelAccessToken: string;
    channelId: string;
    providerId?: string;
    liffId?: string;
  };
  supabase: {
    url: string;
    serviceRoleKey: string;
    anonKey: string;
  };
  lovable: {
    clientSecret: string;
    apiKey: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
}

export interface StrategyConfig {
  address: string;
  type: 'aave' | 'klayswap' | 'compound' | 'custom';
  allocation: number; // 0-1
  minApy: number;
  maxApy: number;
  enabled: boolean;
}

export const CONFIG: AppConfig = {
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3000'),
  
  kaia: {
    rpcUrl: process.env['KAIA_RPC_URL'] || 'https://api.baobab.klaytn.net:8651',
    chainId: parseInt(process.env['KAIA_CHAIN_ID'] || '1001'),
    walletPrivateKey: process.env['WALLET_PRIVATE_KEY'] || '',
    gasStationUrl: process.env['KAIA_GAS_STATION_URL'] || 'https://gasstation.klaytn.net'
  },
  
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    name: process.env['DB_NAME'] || 'line_yield',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    ssl: process.env['DB_SSL'] === 'true'
  },
  
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379'),
    password: process.env['REDIS_PASSWORD']
  },
  
  contracts: {
    vaultAddress: process.env['VAULT_ADDRESS'] || '',
    strategyManagerAddress: process.env['STRATEGY_MANAGER_ADDRESS'] || '',
    gaslessVaultAddress: process.env['GASLESS_VAULT_ADDRESS'] || '',
    creditScoreAddress: process.env['CREDIT_SCORE_CONTRACT_ADDRESS'] || '',
    nftCollateralVaultAddress: process.env['NFT_COLLATERAL_VAULT_ADDRESS'] || '',
    nftPriceOracleAddress: process.env['NFT_PRICE_ORACLE_ADDRESS'] || '',
    liquidationEngineAddress: process.env['LIQUIDATION_ENGINE_ADDRESS'] || '',
    yieldPointsNFTAddress: process.env['YIELD_POINTS_NFT_ADDRESS'] || '',
    stablecoinSwapAddress: process.env['STABLECOIN_SWAP_ADDRESS'] || '',
    daoGovernanceAddress: process.env['DAO_GOVERNANCE_ADDRESS'] || '',
    secureVaultAddress: process.env['SECURE_VAULT_ADDRESS'] || '',
    securityOracleAddress: process.env['SECURITY_ORACLE_ADDRESS'] || ''
  },
  
  strategies: {
    aave: {
      address: process.env['AAVE_STRATEGY_ADDRESS'] || '',
      type: 'aave',
      allocation: parseFloat(process.env['AAVE_ALLOCATION'] || '0.4'),
      minApy: 0.03,
      maxApy: 0.15,
      enabled: process.env['AAVE_ENABLED'] !== 'false'
    },
    klayswap: {
      address: process.env['KLAYSWAP_STRATEGY_ADDRESS'] || '',
      type: 'klayswap',
      allocation: parseFloat(process.env['KLAYSWAP_ALLOCATION'] || '0.35'),
      minApy: 0.02,
      maxApy: 0.12,
      enabled: process.env['KLAYSWAP_ENABLED'] !== 'false'
    },
    compound: {
      address: process.env['COMPOUND_STRATEGY_ADDRESS'] || '',
      type: 'compound',
      allocation: parseFloat(process.env['COMPOUND_ALLOCATION'] || '0.25'),
      minApy: 0.025,
      maxApy: 0.10,
      enabled: process.env['COMPOUND_ENABLED'] !== 'false'
    }
  },
  
  thresholds: {
    rebalance: parseFloat(process.env['REBALANCE_THRESHOLD'] || '0.005'),
    minYieldDifference: parseFloat(process.env['MIN_YIELD_DIFFERENCE'] || '0.001'),
    maxGasPriceGwei: parseFloat(process.env['MAX_GAS_PRICE_GWEI'] || '50')
  },
  
  intervals: {
    yieldUpdate: parseInt(process.env['YIELD_UPDATE_INTERVAL'] || '600000'), // 10 minutes
    rebalanceCheck: parseInt(process.env['REBALANCE_CHECK_INTERVAL'] || '300000'), // 5 minutes
    healthCheck: parseInt(process.env['HEALTH_CHECK_INTERVAL'] || '30000') // 30 seconds
  },
  
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'your-secret-key-change-in-production',
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000'), // 1 minute
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    encryptionKey: process.env['ENCRYPTION_KEY'] || '',
    apiRateLimitSecret: process.env['API_RATE_LIMIT_SECRET'] || 'rate-limit-secret'
  },
  
  gasless: {
    enabled: process.env['GASLESS_ENABLED'] === 'true',
    relayerUrl: process.env['RELAYER_URL'] || 'http://localhost:3001',
    maxGasPriceGwei: parseFloat(process.env['GASLESS_MAX_GAS_PRICE_GWEI'] || '30'),
    supportedMethods: ['deposit', 'withdraw', 'mint', 'redeem']
  },
  
  line: {
    channelAccessToken: process.env['LINE_CHANNEL_ACCESS_TOKEN'] || '',
    channelId: process.env['LINE_CHANNEL_ID'] || '',
    providerId: process.env['LINE_PROVIDER_ID'],
    liffId: process.env['LINE_LIFF_ID']
  },
  
  supabase: {
    url: process.env['SUPABASE_URL'] || '',
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
    anonKey: process.env['SUPABASE_ANON_KEY'] || ''
  },
  
  lovable: {
    clientSecret: process.env['LOVABLE_CLIENT_SECRET'] || '',
    apiKey: process.env['LOVABLE_API_KEY'] || ''
  },
  
  stripe: {
    secretKey: process.env['STRIPE_SECRET_KEY'] || '',
    publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] || '',
    webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || ''
  }
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = [
    'WALLET_PRIVATE_KEY',
    'VAULT_ADDRESS',
    'STRATEGY_MANAGER_ADDRESS',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ENCRYPTION_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate encryption key length
  if (process.env['ENCRYPTION_KEY'] && process.env['ENCRYPTION_KEY'].length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }

  // Validate strategy allocations sum to 1
  const totalAllocation = Object.values(CONFIG.strategies)
    .filter(strategy => strategy.enabled)
    .reduce((sum, strategy) => sum + strategy.allocation, 0);
  
  if (Math.abs(totalAllocation - 1) > 0.01) {
    throw new Error(`Strategy allocations must sum to 1.0, got ${totalAllocation}`);
  }

  // Security warnings for development
  if (CONFIG.nodeEnv === 'development') {
    console.warn('⚠️  Running in development mode. Ensure all secrets are properly configured for production.');
  }
}
