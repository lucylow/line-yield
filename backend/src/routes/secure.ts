import { Router, Request, Response } from 'express';
import { secureApiService, TransactionRequest } from '../services/SecureApiService';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';

const logger = new Logger('SecureRoutes');
const router = Router();

// Rate limiting for secure endpoints
const secureRateLimit = rateLimit({
  windowMs: CONFIG.security.rateLimitWindowMs,
  max: CONFIG.security.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONFIG.security.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user address for rate limiting if available
    return req.body?.userAddress || req.ip;
  }
});

// Middleware to validate required fields
const validateTransactionRequest = (req: Request, res: Response, next: any) => {
  const { userAddress, amount, method } = req.body;
  
  if (!userAddress || !amount || !method) {
    return res.status(400).json({
      error: 'Missing required fields: userAddress, amount, method'
    });
  }

  // Validate method
  const validMethods = ['deposit', 'withdraw', 'mint', 'redeem'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({
      error: `Invalid method. Must be one of: ${validMethods.join(', ')}`
    });
  }

  // Validate amount
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Amount must be a positive number'
    });
  }

  next();
};

// Middleware to validate user signature
const validateUserSignature = async (req: Request, res: Response, next: any) => {
  try {
    const { userAddress, signature, message } = req.body;
    
    if (!signature || !message) {
      return res.status(400).json({
        error: 'Missing signature or message for authentication'
      });
    }

    const isValid = await secureApiService.verifyUserSignature(
      userAddress,
      message,
      signature
    );

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid signature'
      });
    }

    next();
  } catch (error) {
    logger.error('Error validating user signature:', error);
    res.status(500).json({
      error: 'Failed to validate signature'
    });
  }
};

/**
 * GET /secure/nonce/:userAddress
 * Get user nonce for transaction ordering
 */
router.get('/nonce/:userAddress', secureRateLimit, async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.params;
    
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        error: 'Invalid Ethereum address format'
      });
    }

    const nonce = await secureApiService.getUserNonce(userAddress);
    
    res.json({
      success: true,
      data: nonce
    });
  } catch (error) {
    logger.error('Error getting user nonce:', error);
    res.status(500).json({
      error: 'Failed to get user nonce'
    });
  }
});

/**
 * POST /secure/estimate-gas
 * Estimate gas for a transaction
 */
router.post('/estimate-gas', secureRateLimit, async (req: Request, res: Response) => {
  try {
    const { txData } = req.body;
    
    if (!txData) {
      return res.status(400).json({
        error: 'Transaction data is required'
      });
    }

    const gasEstimate = await secureApiService.estimateGas(txData);
    
    res.json({
      success: true,
      data: {
        gasEstimate,
        gasPrice: await secureApiService['provider'].getGasPrice()
      }
    });
  } catch (error) {
    logger.error('Error estimating gas:', error);
    res.status(500).json({
      error: 'Failed to estimate gas'
    });
  }
});

/**
 * POST /secure/sign-transaction
 * Sign a transaction with backend wallet
 */
router.post('/sign-transaction', 
  secureRateLimit, 
  validateTransactionRequest,
  validateUserSignature,
  async (req: Request, res: Response) => {
    try {
      const transactionRequest: TransactionRequest = req.body;
      
      let signedTransaction;
      
      switch (transactionRequest.method) {
        case 'deposit':
          signedTransaction = await secureApiService.createDepositTransaction(transactionRequest);
          break;
        case 'withdraw':
          signedTransaction = await secureApiService.createWithdrawTransaction(transactionRequest);
          break;
        default:
          return res.status(400).json({
            error: `Method ${transactionRequest.method} not implemented`
          });
      }
      
      res.json({
        success: true,
        data: signedTransaction
      });
    } catch (error) {
      logger.error('Error signing transaction:', error);
      res.status(500).json({
        error: 'Failed to sign transaction'
      });
    }
  }
);

/**
 * POST /secure/deposit
 * Create and sign a deposit transaction
 */
router.post('/deposit', 
  secureRateLimit, 
  validateTransactionRequest,
  validateUserSignature,
  async (req: Request, res: Response) => {
    try {
      const transactionRequest: TransactionRequest = {
        ...req.body,
        method: 'deposit'
      };
      
      const signedTransaction = await secureApiService.createDepositTransaction(transactionRequest);
      
      res.json({
        success: true,
        data: signedTransaction
      });
    } catch (error) {
      logger.error('Error creating deposit transaction:', error);
      res.status(500).json({
        error: 'Failed to create deposit transaction'
      });
    }
  }
);

/**
 * POST /secure/withdraw
 * Create and sign a withdraw transaction
 */
router.post('/withdraw', 
  secureRateLimit, 
  validateTransactionRequest,
  validateUserSignature,
  async (req: Request, res: Response) => {
    try {
      const transactionRequest: TransactionRequest = {
        ...req.body,
        method: 'withdraw'
      };
      
      const signedTransaction = await secureApiService.createWithdrawTransaction(transactionRequest);
      
      res.json({
        success: true,
        data: signedTransaction
      });
    } catch (error) {
      logger.error('Error creating withdraw transaction:', error);
      res.status(500).json({
        error: 'Failed to create withdraw transaction'
      });
    }
  }
);

/**
 * GET /secure/wallet-info
 * Get wallet information (address and balance)
 */
router.get('/wallet-info', secureRateLimit, async (req: Request, res: Response) => {
  try {
    const address = secureApiService.getWalletAddress();
    const balance = await secureApiService.getWalletBalance();
    
    res.json({
      success: true,
      data: {
        address,
        balance,
        network: CONFIG.kaia.chainId
      }
    });
  } catch (error) {
    logger.error('Error getting wallet info:', error);
    res.status(500).json({
      error: 'Failed to get wallet information'
    });
  }
});

/**
 * POST /secure/verify-signature
 * Verify a user signature
 */
router.post('/verify-signature', secureRateLimit, async (req: Request, res: Response) => {
  try {
    const { userAddress, message, signature } = req.body;
    
    if (!userAddress || !message || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: userAddress, message, signature'
      });
    }

    const isValid = await secureApiService.verifyUserSignature(
      userAddress,
      message,
      signature
    );
    
    res.json({
      success: true,
      data: {
        isValid,
        userAddress
      }
    });
  } catch (error) {
    logger.error('Error verifying signature:', error);
    res.status(500).json({
      error: 'Failed to verify signature'
    });
  }
});

/**
 * GET /secure/health
 * Health check endpoint for secure services
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const walletAddress = secureApiService.getWalletAddress();
    const balance = await secureApiService.getWalletBalance();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        walletAddress,
        balance,
        network: CONFIG.kaia.chainId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;


