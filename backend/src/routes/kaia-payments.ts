import { Router, Request, Response } from 'express';
import { kaiaPaymentService } from '../services/KaiaPaymentService';
import { Logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import { CONFIG } from '../config';

const logger = new Logger('KaiaPaymentRoutes');
const router = Router();

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: CONFIG.security.rateLimitWindowMs,
  max: 20, // Higher limit for KAIA payments
  message: {
    error: 'Too many payment requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONFIG.security.rateLimitWindowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate wallet address
const validateWalletAddress = (req: Request, res: Response, next: any) => {
  const { address } = req.params;
  
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      error: 'Invalid wallet address format'
    });
  }

  next();
};

// Middleware to validate payment amount
const validatePaymentAmount = (req: Request, res: Response, next: any) => {
  const { amount } = req.body;
  
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      error: 'Invalid payment amount. Must be a positive number.'
    });
  }

  next();
};

/**
 * POST /kaia-payments/create
 * Create a new KAIA payment
 */
router.post('/create', 
  paymentRateLimit,
  validatePaymentAmount,
  async (req: Request, res: Response) => {
    try {
      const { 
        sellerAddress, 
        amount, 
        productId, 
        description, 
        buyerAddress 
      } = req.body;
      
      if (!sellerAddress || !buyerAddress || !productId) {
        return res.status(400).json({
          error: 'Seller address, buyer address, and product ID are required'
        });
      }

      const payment = await kaiaPaymentService.createPayment({
        sellerAddress,
        amount,
        productId,
        description: description || '',
        buyerAddress
      });
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error creating KAIA payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create payment'
      });
    }
  }
);

/**
 * POST /kaia-payments/:paymentId/complete
 * Complete a KAIA payment
 */
router.post('/:paymentId/complete', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { sellerPrivateKey } = req.body;
      
      if (!sellerPrivateKey) {
        return res.status(400).json({
          error: 'Seller private key is required'
        });
      }

      const txHash = await kaiaPaymentService.completePayment(
        parseInt(paymentId), 
        sellerPrivateKey
      );
      
      res.json({
        success: true,
        data: { txHash }
      });
    } catch (error) {
      logger.error('Error completing KAIA payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to complete payment'
      });
    }
  }
);

/**
 * POST /kaia-payments/:paymentId/cancel
 * Cancel a KAIA payment
 */
router.post('/:paymentId/cancel', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { reason, userAddress, userPrivateKey } = req.body;
      
      if (!reason || !userAddress || !userPrivateKey) {
        return res.status(400).json({
          error: 'Reason, user address, and private key are required'
        });
      }

      const txHash = await kaiaPaymentService.cancelPayment(
        parseInt(paymentId),
        reason,
        userAddress,
        userPrivateKey
      );
      
      res.json({
        success: true,
        data: { txHash }
      });
    } catch (error) {
      logger.error('Error cancelling KAIA payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to cancel payment'
      });
    }
  }
);

/**
 * POST /kaia-payments/:paymentId/refund
 * Process a refund (admin only)
 */
router.post('/:paymentId/refund', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { refundAmount } = req.body;
      
      if (!refundAmount || isNaN(parseFloat(refundAmount)) || parseFloat(refundAmount) <= 0) {
        return res.status(400).json({
          error: 'Valid refund amount is required'
        });
      }

      const txHash = await kaiaPaymentService.processRefund(
        parseInt(paymentId),
        refundAmount
      );
      
      res.json({
        success: true,
        data: { txHash }
      });
    } catch (error) {
      logger.error('Error processing refund:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to process refund'
      });
    }
  }
);

/**
 * GET /kaia-payments/:paymentId
 * Get payment by ID
 */
router.get('/:paymentId', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      const payment = await kaiaPaymentService.getPayment(parseInt(paymentId));
      
      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Error getting KAIA payment:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get payment'
      });
    }
  }
);

/**
 * GET /kaia-payments/user/:address
 * Get user's payment history
 */
router.get('/user/:address', 
  paymentRateLimit,
  validateWalletAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const { limit = 50 } = req.query;
      
      const payments = await kaiaPaymentService.getUserPayments(
        address, 
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      logger.error('Error getting user KAIA payments:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get user payments'
      });
    }
  }
);

/**
 * GET /kaia-payments/stats
 * Get payment statistics
 */
router.get('/stats', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const stats = await kaiaPaymentService.getPaymentStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting payment stats:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get payment statistics'
      });
    }
  }
);

/**
 * GET /kaia-payments/balance/:address
 * Get KAIA token balance for an address
 */
router.get('/balance/:address', 
  paymentRateLimit,
  validateWalletAddress,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      const balance = await kaiaPaymentService.getKaiaBalance(address);
      
      res.json({
        success: true,
        data: { balance }
      });
    } catch (error) {
      logger.error('Error getting KAIA balance:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get KAIA balance'
      });
    }
  }
);

/**
 * POST /kaia-payments/fees/calculate
 * Calculate fees for a given amount
 */
router.post('/fees/calculate', 
  paymentRateLimit,
  validatePaymentAmount,
  async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;
      
      const fees = await kaiaPaymentService.calculateFees(amount);
      
      res.json({
        success: true,
        data: fees
      });
    } catch (error) {
      logger.error('Error calculating fees:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to calculate fees'
      });
    }
  }
);

/**
 * PUT /kaia-payments/fees/structure (Admin only)
 * Update fee structure
 */
router.put('/fees/structure', 
  paymentRateLimit,
  async (req: Request, res: Response) => {
    try {
      const { 
        platformFeePercent, 
        loyaltyFeePercent, 
        gasFeePercent 
      } = req.body;
      
      if (!platformFeePercent || !loyaltyFeePercent || !gasFeePercent) {
        return res.status(400).json({
          error: 'All fee percentages are required'
        });
      }

      const txHash = await kaiaPaymentService.updateFeeStructure(
        platformFeePercent,
        loyaltyFeePercent,
        gasFeePercent
      );
      
      res.json({
        success: true,
        data: { txHash }
      });
    } catch (error) {
      logger.error('Error updating fee structure:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update fee structure'
      });
    }
  }
);

/**
 * GET /kaia-payments/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'kaia-payments',
        timestamp: new Date().toISOString(),
        supportedTokens: ['KAIA'],
        supportedNetworks: ['Kaia'],
        features: ['payments', 'refunds', 'fee-calculation', 'balance-check']
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

